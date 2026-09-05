import { EgoVehicle, WorldObject, SensorObservation } from '../types';

export class RadarSensor {
  range = 100; // meters
  fov = Math.PI / 4; // 45 degrees
  velNoiseStdDev = 0.2; // m/s

  private gaussianNoise(stddev: number) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stddev;
  }

  observe(ego: EgoVehicle, obstacles: WorldObject[]): SensorObservation[] {
    const observations: SensorObservation[] = [];
    
    for (const obs of obstacles) {
      const dx = obs.x - ego.x;
      const dy = obs.y - ego.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance <= this.range) {
        let angleToObs = Math.atan2(dy, dx) - ego.heading;
        while (angleToObs > Math.PI) angleToObs -= 2 * Math.PI;
        while (angleToObs < -Math.PI) angleToObs += 2 * Math.PI;
        
        if (Math.abs(angleToObs) <= this.fov / 2) {
          const noisyVel = obs.velocity + this.gaussianNoise(this.velNoiseStdDev);
          const noisyX = obs.x + this.gaussianNoise(1.0); // Radar has worse spatial resolution
          const noisyY = obs.y + this.gaussianNoise(1.0);

          observations.push({
            sensorType: 'radar',
            id: `radar_${obs.id}`,
            x: noisyX,
            y: noisyY,
            velocity: noisyVel,
            heading: obs.heading, // assume radar can extract heading for moving targets
            confidence: 0.85
          });
        }
      }
    }
    return observations;
  }
}
