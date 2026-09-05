import { EgoVehicle, WorldObject, SensorObservation } from '../types';

export class LiDARSensor {
  range = 40; // meters
  fov = Math.PI * 2; // 360 degrees
  noiseStdDev = 0.5; // meters

  // Box-Muller transform for normal distribution
  private gaussianNoise() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * this.noiseStdDev;
  }

  observe(ego: EgoVehicle, obstacles: WorldObject[]): SensorObservation[] {
    const observations: SensorObservation[] = [];
    
    for (const obs of obstacles) {
      const dx = obs.x - ego.x;
      const dy = obs.y - ego.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance <= this.range) {
        // LiDAR provides exact distance but we add a bit of spatial noise
        const noisyX = obs.x + this.gaussianNoise();
        const noisyY = obs.y + this.gaussianNoise();

        observations.push({
          sensorType: 'lidar',
          id: `lidar_${obs.id}`,
          x: noisyX,
          y: noisyY,
          width: obs.width,
          length: obs.length,
          confidence: 0.95
        });
      }
    }
    return observations;
  }
}
