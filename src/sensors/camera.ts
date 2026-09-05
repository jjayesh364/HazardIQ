import { EgoVehicle, WorldObject, SensorObservation } from '../types';

export class CameraSensor {
  range = 60; // meters
  fov = Math.PI / 2; // 90 degrees

  observe(ego: EgoVehicle, obstacles: WorldObject[]): SensorObservation[] {
    const observations: SensorObservation[] = [];
    
    for (const obs of obstacles) {
      const dx = obs.x - ego.x;
      const dy = obs.y - ego.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance <= this.range) {
        let angleToObs = Math.atan2(dy, dx) - ego.heading;
        // Normalize to [-PI, PI]
        while (angleToObs > Math.PI) angleToObs -= 2 * Math.PI;
        while (angleToObs < -Math.PI) angleToObs += 2 * Math.PI;
        
        if (Math.abs(angleToObs) <= this.fov / 2) {
          observations.push({
            sensorType: 'camera',
            id: `cam_${obs.id}`,
            x: obs.x,
            y: obs.y,
            type: obs.type,
            width: obs.width,
            length: obs.length,
            confidence: 0.9 - (distance / this.range) * 0.2 // Lower confidence further away
          });
        }
      }
    }
    return observations;
  }
}
