import { EgoVehicle, WorldObject, DecisionState, Scenario, TrackedObject } from '../types';
import { CameraSensor } from '../sensors/camera';
import { LiDARSensor } from '../sensors/lidar';
import { RadarSensor } from '../sensors/radar';
import { SensorFusion } from '../sensors/fusion';
import { SeededRandom } from '../utils/random';

interface CandidatePath {
  offset: number;     // lateral offset
  cost: number;
  collides: boolean;
}

export class SimulationEngine {
  ego: EgoVehicle;
  obstacles: WorldObject[]; // Ground truth
  trackedObjects: TrackedObject[] = []; // Fused perception
  goal: { x: number, y: number };
  state: DecisionState;
  
  // Sensors
  camera = new CameraSensor();
  lidar = new LiDARSensor();
  radar = new RadarSensor();
  fusion = new SensorFusion();

  // To avoid multi-counting
  currentlyColliding = new Set<string>();

  metrics = {
    collisionCount: 0,
    minDistance: Infinity,
    replans: 0,
    latency: 0,
    emergencyStops: 0,
    averageSpeed: 0,
    speedSamples: 0,
    cameraObs: 0,
    lidarObs: 0,
    radarObs: 0,
    fusedTracks: 0,
    pathSmoothness: 0,
    completed: false
  };

  dt = 1 / 60; // 60 FPS
  targetOffset = 0;
  prevSteering = 0;
  steeringDeltaSum = 0;
  scenarioName = 'Unknown';

  constructor(scenario: Scenario) {
    this.ego = { ...scenario.initEgo };
    this.obstacles = JSON.parse(JSON.stringify(scenario.initObstacles)); // deep copy
    this.goal = { ...scenario.goal };
    this.state = 'CRUISE';
    this.scenarioName = scenario.name;
  }

  update() {
    const start = performance.now();
    
    this.updateObstacles();
    this.checkActualCollisions(); // Uses ground truth for metrics only
    
    // PERCEPTION PIPELINE
    const camObs = this.camera.observe(this.ego, this.obstacles);
    const lidarObs = this.lidar.observe(this.ego, this.obstacles);
    const radarObs = this.radar.observe(this.ego, this.obstacles);
    this.trackedObjects = this.fusion.fuse([...camObs, ...lidarObs, ...radarObs]);

    this.metrics.cameraObs = camObs.length;
    this.metrics.lidarObs = lidarObs.length;
    this.metrics.radarObs = radarObs.length;
    this.metrics.fusedTracks = this.trackedObjects.length;

    this.plan();
    this.controlVehicle();

    this.metrics.speedSamples++;
    this.metrics.averageSpeed += (this.ego.velocity - this.metrics.averageSpeed) / this.metrics.speedSamples;
    this.metrics.latency = performance.now() - start;
  }

  rng = new SeededRandom(12345);

  updateObstacles() {
    this.obstacles.forEach(obs => {
      if (obs.behavior === 'linear' || obs.behavior === 'crossing') {
        obs.x += obs.velocity * Math.cos(obs.heading) * this.dt;
        obs.y += obs.velocity * Math.sin(obs.heading) * this.dt;
      } else if (obs.behavior === 'random') {
        // Change heading slightly
        obs.heading += this.rng.range(-0.1, 0.1);
        // Vary speed slightly
        obs.velocity = Math.max(0, obs.velocity + this.rng.range(-0.5, 0.5));
        
        obs.x += obs.velocity * Math.cos(obs.heading) * this.dt;
        obs.y += obs.velocity * Math.sin(obs.heading) * this.dt;
      } else if (obs.behavior === 'sudden_crossing') {
        // Wait until ego is close enough
        const dist = this.getDistance(this.ego.x, this.ego.y, obs.x, obs.y);
        if (obs.velocity === 0 && obs.triggerDistance && dist < obs.triggerDistance) {
          // Trigger movement
          obs.velocity = 2; // sudden burst of speed
        }
        if (obs.velocity > 0) {
          // Slight randomness as it crosses
          obs.heading += this.rng.range(-0.05, 0.05);
          obs.x += obs.velocity * Math.cos(obs.heading) * this.dt;
          obs.y += obs.velocity * Math.sin(obs.heading) * this.dt;
        }
      }
    });
  }

  getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  // Purely metric collision counting (discrete)
  checkActualCollisions() {
    const safeRadius = 2.0; // Minimal threshold to be considered a physical collision
    this.obstacles.forEach(obs => {
      const d = this.getDistance(this.ego.x, this.ego.y, obs.x, obs.y);
      if (d < safeRadius) {
        if (!this.currentlyColliding.has(obs.id)) {
          this.currentlyColliding.add(obs.id);
          this.metrics.collisionCount++;
        }
      } else {
        this.currentlyColliding.delete(obs.id);
      }
    });
  }

  plan() {
    const distToGoal = this.getDistance(this.ego.x, this.ego.y, this.goal.x, this.goal.y);
    if (distToGoal < 5) {
      this.state = 'GOAL_REACHED';
      this.ego.velocity = 0;
      if (!this.metrics.completed) {
        this.metrics.completed = true;
      }
      return;
    }

    // 1. Prediction over a 3-second horizon (using FUSED tracks)
    const T = 3.0;
    const predictedObstacles = this.trackedObjects.map(track => ({
      id: track.id,
      x: track.x + track.velocity * Math.cos(track.heading) * T,
      y: track.y + track.velocity * Math.sin(track.heading) * T,
      cx: track.x, cy: track.y,
      uncertainty: track.uncertaintyRadius * T // uncertainty grows linearly with time
    }));

    // Update min distance metric
    let minObsDist = Infinity;
    predictedObstacles.forEach(obs => {
      const d = this.getDistance(this.ego.x, this.ego.y, obs.cx, obs.cy);
      if (d < minObsDist) minObsDist = d;
    });
    if (minObsDist < this.metrics.minDistance) {
      this.metrics.minDistance = minObsDist;
    }

    // 2. Generate Candidate Trajectories
    // We evaluate 5 lateral offsets relative to the straight line to the goal
    const offsets = [0, -10, 10, -20, 20]; // 0 is straight, negative is left, positive is right
    
    // Base angle towards goal
    const angleToGoal = Math.atan2(this.goal.y - this.ego.y, this.goal.x - this.ego.x);
    
    const candidates: CandidatePath[] = offsets.map(off => {
      // Calculate a target waypoint projected 20 meters ahead with lateral offset
      const lookahead = 20;
      const wx = this.ego.x + lookahead * Math.cos(angleToGoal) - off * Math.sin(angleToGoal);
      const wy = this.ego.y + lookahead * Math.sin(angleToGoal) + off * Math.cos(angleToGoal);
      
      let collides = false;
      let cost = Math.abs(off); // slight preference for staying on center

      // Check collision along this trajectory ray against obstacles
      for (const obs of predictedObstacles) {
        // Simple bounding radius check around the trajectory
        // Distance from obstacle to line segment Ego->Waypoint
        const L2 = this.getDistance(this.ego.x, this.ego.y, wx, wy) ** 2;
        if (L2 === 0) continue;
        
        // Dot product to find projection of obstacle on segment
        let t = ((obs.cx - this.ego.x) * (wx - this.ego.x) + (obs.cy - this.ego.y) * (wy - this.ego.y)) / L2;
        t = Math.max(0, Math.min(1, t));
        
        const projX = this.ego.x + t * (wx - this.ego.x);
        const projY = this.ego.y + t * (wy - this.ego.y);
        
        const distToTrajectory = this.getDistance(obs.cx, obs.cy, projX, projY);
        
        // Buffer includes base safe distance + expanding uncertainty region
        const buffer = 4.0 + obs.uncertainty; 

        if (distToTrajectory < buffer && this.getDistance(this.ego.x, this.ego.y, obs.cx, obs.cy) < 25) {
          collides = true;
          break;
        }
      }

      return { offset: off, cost, collides };
    });

    // 3. Select safest trajectory
    const validPaths = candidates.filter(c => !c.collides);
    
    if (validPaths.length > 0) {
      // Pick the valid path with the lowest cost (closest to center)
      validPaths.sort((a, b) => a.cost - b.cost);
      
      if (this.targetOffset !== validPaths[0].offset) {
        this.targetOffset = validPaths[0].offset;
        this.metrics.replans++;
      }

      if (this.targetOffset !== 0) {
        this.state = this.targetOffset < 0 ? 'AVOID_LEFT' : 'AVOID_RIGHT';
      } else {
        // Even if center is clear, slow down if obstacles are somewhat close
        if (minObsDist < 12) {
          this.state = 'SLOW_DOWN';
        } else {
          this.state = 'CRUISE';
        }
      }
    } else {
      // No safe paths found
      this.state = 'EMERGENCY_STOP';
      if (this.ego.velocity > 5) this.metrics.emergencyStops++;
    }
  }

  controlVehicle() {
    if (this.state === 'EMERGENCY_STOP' || this.state === 'STOP' || this.state === 'GOAL_REACHED') {
      this.ego.velocity = Math.max(0, this.ego.velocity - 15 * this.dt);
    } else if (this.state === 'SLOW_DOWN' || this.state === 'AVOID_LEFT' || this.state === 'AVOID_RIGHT') {
      this.ego.velocity = Math.max(3, this.ego.velocity - 5 * this.dt);
    } else if (this.state === 'CRUISE') {
      this.ego.velocity = Math.min(12, this.ego.velocity + 3 * this.dt);
    }

    if (this.ego.velocity === 0) return;

    // Steer towards the target waypoint (goal + lateral offset)
    const angleToGoal = Math.atan2(this.goal.y - this.ego.y, this.goal.x - this.ego.x);
    const lookahead = 15;
    const wx = this.ego.x + lookahead * Math.cos(angleToGoal) - this.targetOffset * Math.sin(angleToGoal);
    const wy = this.ego.y + lookahead * Math.sin(angleToGoal) + this.targetOffset * Math.cos(angleToGoal);

    const targetHeading = Math.atan2(wy - this.ego.y, wx - this.ego.x);
    let headingDiff = targetHeading - this.ego.heading;
    
    // Normalize headingDiff
    while (headingDiff > Math.PI) headingDiff -= 2 * Math.PI;
    while (headingDiff < -Math.PI) headingDiff += 2 * Math.PI;

    // Steering limit
    this.ego.steering = Math.max(-0.8, Math.min(0.8, headingDiff));
    this.ego.heading += this.ego.steering * this.ego.velocity * this.dt;

    this.ego.x += this.ego.velocity * Math.cos(this.ego.heading) * this.dt;
    this.ego.y += this.ego.velocity * Math.sin(this.ego.heading) * this.dt;

    // Track path smoothness (cumulative variance/delta in steering)
    const steeringDelta = Math.abs(this.ego.steering - this.prevSteering);
    this.steeringDeltaSum += steeringDelta;
    this.prevSteering = this.ego.steering;
    this.metrics.pathSmoothness = this.steeringDeltaSum / (this.metrics.speedSamples || 1);
  }
}
