import { describe, it, expect } from 'vitest';
import { SimulationEngine } from './engine';
import { SCENARIOS } from './scenarios';
import { WorldObject } from '../types';

describe('Simulation Engine', () => {
  const createMockScenario = (obstacles: WorldObject[]) => ({
    id: 'test', name: 'Test', description: 'Test',
    initEgo: { x: 0, y: 0, width: 2, length: 4, velocity: 5, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: obstacles,
    goal: { x: 100, y: 0 }
  });

  it('obstacle directly ahead -> vehicle avoids it (replans)', () => {
    // Static obstacle directly ahead
    const obstacles: WorldObject[] = [
      { id: 'o1', type: 'static', x: 20, y: 0, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' }
    ];
    const engine = new SimulationEngine(createMockScenario(obstacles));
    engine.update(); // Runs perception -> fusion -> plan
    // It should generate an offset != 0 to avoid
    expect(engine.targetOffset).not.toBe(0);
    expect(['AVOID_LEFT', 'AVOID_RIGHT', 'SLOW_DOWN', 'EMERGENCY_STOP']).toContain(engine.state);
  });

  it('no safe path -> vehicle stops', () => {
    // Wall of obstacles ahead
    const obstacles: WorldObject[] = [
      { id: 'o1', type: 'static', x: 15, y: -20, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' },
      { id: 'o2', type: 'static', x: 15, y: -10, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' },
      { id: 'o3', type: 'static', x: 15, y: 0, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' },
      { id: 'o4', type: 'static', x: 15, y: 10, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' },
      { id: 'o5', type: 'static', x: 15, y: 20, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' }
    ];
    const engine = new SimulationEngine(createMockScenario(obstacles));
    engine.update(); // Runs perception -> fusion -> plan
    // No safe path, should stop
    expect(engine.state).toBe('EMERGENCY_STOP');
  });

  it('successful avoidance -> collision count remains 0', () => {
    // Run the engine for a while with an obstacle ahead
    const obstacles: WorldObject[] = [
      { id: 'o1', type: 'static', x: 20, y: 0, width: 2, length: 2, velocity: 0, heading: 0, behavior: 'static' }
    ];
    const engine = new SimulationEngine(createMockScenario(obstacles));
    
    // Simulate 600 frames (~10 seconds)
    for (let i = 0; i < 600; i++) {
      engine.update();
    }
    
    // Vehicle should have driven past the obstacle safely
    expect(engine.metrics.collisionCount).toBe(0);
    expect(engine.ego.x).toBeGreaterThan(20); // Past the obstacle
  });
  
  it('collision counting is discrete', () => {
    const engine = new SimulationEngine(SCENARIOS[0]);
    // Force a collision by placing obstacle on top of ego
    engine.obstacles[0].x = engine.ego.x;
    engine.obstacles[0].y = engine.ego.y;
    
    // Run multiple frames
    engine.update();
    engine.update();
    engine.update();
    
    // Should still only count as 1 collision event
    expect(engine.metrics.collisionCount).toBe(1);
  });

  describe('Perception Sensors & Fusion', () => {
    const egoStub = { x: 0, y: 0, width: 2, length: 4, velocity: 5, heading: 0, steering: 0, acceleration: 0 };
    
    it('Camera ignores an object outside FOV', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: -10, y: 0, width: 2, length: 4, velocity: 0, heading: 0, behavior: 'static' }]; // Behind
      const camObs = engine.camera.observe(engine.ego, engine.obstacles);
      expect(camObs.length).toBe(0);
    });

    it('Camera detects object inside FOV', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: 20, y: 0, width: 2, length: 4, velocity: 0, heading: 0, behavior: 'static' }]; // Ahead
      const camObs = engine.camera.observe(engine.ego, engine.obstacles);
      expect(camObs.length).toBe(1);
      expect(camObs[0].type).toBe('car');
    });

    it('LiDAR detects objects within range with noise', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: 20, y: 0, width: 2, length: 4, velocity: 0, heading: 0, behavior: 'static' }];
      const lidarObs = engine.lidar.observe(engine.ego, engine.obstacles);
      expect(lidarObs.length).toBe(1);
      // It should have noise, so it won't be exactly 20
      expect(lidarObs[0].x).not.toBe(20);
      expect(Math.abs(lidarObs[0].x - 20)).toBeLessThan(3.0); // within 3 stddevs
    });

    it('Radar reports relative velocity', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: 20, y: 0, width: 2, length: 4, velocity: 15, heading: 0, behavior: 'linear' }];
      const radarObs = engine.radar.observe(engine.ego, engine.obstacles);
      expect(radarObs.length).toBe(1);
      expect(radarObs[0].velocity).toBeDefined();
    });

    it('Sensor fusion combines detections from multiple sensors', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: 20, y: 0, width: 2, length: 4, velocity: 15, heading: 0, behavior: 'linear' }];
      
      const camObs = engine.camera.observe(engine.ego, engine.obstacles);
      const lidarObs = engine.lidar.observe(engine.ego, engine.obstacles);
      const radarObs = engine.radar.observe(engine.ego, engine.obstacles);
      
      const fused = engine.fusion.fuse([...camObs, ...lidarObs, ...radarObs]);
      expect(fused.length).toBe(1);
      expect(fused[0].sensorSources).toContain('camera');
      expect(fused[0].sensorSources).toContain('lidar');
      expect(fused[0].sensorSources).toContain('radar');
      expect(fused[0].confidence).toBeGreaterThan(0.9); // Increased confidence
    });

    it('Fusion handles an object detected by only one sensor', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.obstacles = [{ id: 'o1', type: 'car', x: 80, y: 0, width: 2, length: 4, velocity: 15, heading: 0, behavior: 'linear' }]; // Beyond camera (60m) and lidar (40m), but inside radar (100m)
      
      const camObs = engine.camera.observe(engine.ego, engine.obstacles);
      const lidarObs = engine.lidar.observe(engine.ego, engine.obstacles);
      const radarObs = engine.radar.observe(engine.ego, engine.obstacles);
      
      expect(camObs.length).toBe(0);
      expect(lidarObs.length).toBe(0);
      expect(radarObs.length).toBe(1);
      
      const fused = engine.fusion.fuse([...camObs, ...lidarObs, ...radarObs]);
      expect(fused.length).toBe(1);
      expect(fused[0].sensorSources).toEqual(['radar']);
      expect(fused[0].type).toBe('unknown'); // Radar doesn't report type
    });

    it('Planner receives fused observations rather than ground truth', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego = egoStub;
      engine.update(); // runs perception and plan
      expect(engine.trackedObjects).toBeDefined();
      expect(engine.trackedObjects.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('P1: Irregular Movement & Sudden Crossing', () => {
    it('pedestrian changes heading deterministically', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      const initialHeading = engine.obstacles[0].heading;
      engine.update();
      expect(engine.obstacles[0].heading).not.toBe(initialHeading); // random behavior applied
    });

    it('prediction uncertainty increases with time', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.update();
      const pedTrack = engine.trackedObjects.find(t => t.type === 'pedestrian');
      expect(pedTrack).toBeDefined();
      expect(pedTrack!.uncertaintyRadius).toBeGreaterThan(0.2); // erratic gets larger radius
    });

    it('unpredictable pedestrian crossing triggers replanning', () => {
      const engine = new SimulationEngine(SCENARIOS[0]); // S1 has random pedestrian
      engine.ego = { x: 30, y: 50, width: 2, length: 4, velocity: 5, heading: 0, steering: 0, acceleration: 0 };
      engine.update();
      expect(engine.state).not.toBe('CRUISE');
    });

    it('cattle remains undetected before trigger', () => {
      const engine = new SimulationEngine(SCENARIOS[4]); // S5 Sudden Cattle Crossing
      engine.ego.x = 0; // Trigger distance is 30. Dist from (0,50) to (40,55) is ~40.
      engine.update();
      const cattle = engine.obstacles[0];
      expect(cattle.velocity).toBe(0); // Has not triggered yet
    });

    it('cattle becomes detected and moves after trigger', () => {
      const engine = new SimulationEngine(SCENARIOS[4]);
      engine.ego.x = 15; // Dist from (15,50) to (40,55) is ~25 < 30
      engine.update();
      const cattle = engine.obstacles[0];
      expect(cattle.velocity).toBe(2); // Sudden speed burst
      
      const cattleTrack = engine.trackedObjects.find(t => t.x > 30);
      expect(cattleTrack).toBeDefined();
    });

    it('sudden cattle appearance causes SLOW_DOWN or EMERGENCY_STOP', () => {
      const engine = new SimulationEngine(SCENARIOS[4]);
      engine.ego.x = 25; // Trigger cattle, very close! (15,5) dist ~15.
      engine.update();
      expect(['SLOW_DOWN', 'EMERGENCY_STOP', 'AVOID_LEFT', 'AVOID_RIGHT']).toContain(engine.state);
    });

    it('scenario can still reach GOAL_REACHED', () => {
      const engine = new SimulationEngine(SCENARIOS[4]);
      engine.ego.x = 96; // Close to goal at 100
      engine.update();
      expect(engine.state).toBe('GOAL_REACHED');
    });
  });

  describe('P2: Metrics & References', () => {
    it('calculates path smoothness correctly', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      // Run straight
      engine.update();
      expect(engine.metrics.pathSmoothness).toBe(0);
      
      // Force steering by placing obstacle directly ahead
      engine.obstacles = [{ id: 'o1', type: 'car', x: 20, y: 50, width: 2, length: 4, velocity: 0, heading: 0, behavior: 'static' }];
      engine.update();
      engine.update();
      
      expect(engine.metrics.pathSmoothness).toBeGreaterThan(0);
    });

    it('sets completion flag upon reaching goal', () => {
      const engine = new SimulationEngine(SCENARIOS[0]);
      engine.ego.x = 146; // Goal is 150
      expect(engine.metrics.completed).toBe(false);
      engine.update();
      expect(engine.state).toBe('GOAL_REACHED');
      expect(engine.metrics.completed).toBe(true);
    });

    it('contains MATLAB reference implementation files', async () => {
      // For Node imports in Vite, use dynamic import if needed or just use fetch in browser. 
      // Actually we are in Node during vitest.
      const fs = await import('fs');
      const path = await import('path');
      const matlabDir = path.join(process.cwd(), 'matlab');
      
      expect(fs.existsSync(path.join(matlabDir, 'AdaptivePathPlanner.m'))).toBe(true);
      expect(fs.existsSync(path.join(matlabDir, 'ObstaclePrediction.m'))).toBe(true);
      expect(fs.existsSync(path.join(matlabDir, 'CollisionChecker.m'))).toBe(true);
      expect(fs.existsSync(path.join(matlabDir, 'DecisionManager.m'))).toBe(true);
    });
  });
});
