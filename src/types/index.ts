export type ObjectType = 'car' | 'motorcycle' | 'auto-rickshaw' | 'bus' | 'truck' | 'pedestrian' | 'cyclist' | 'pushcart' | 'cattle' | 'static';

export interface WorldObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  length: number;
  velocity: number; // m/s
  heading: number; // radians
  behavior: 'static' | 'linear' | 'random' | 'crossing' | 'sudden_crossing';
  triggerDistance?: number; // Used for sudden_crossing
}

export interface EgoVehicle {
  x: number;
  y: number;
  width: number;
  length: number;
  velocity: number;
  heading: number;
  steering: number;
  acceleration: number;
}

export type DecisionState = 'CRUISE' | 'CAUTION' | 'SLOW_DOWN' | 'STOP' | 'AVOID_LEFT' | 'AVOID_RIGHT' | 'REPLAN' | 'EMERGENCY_STOP' | 'GOAL_REACHED';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  initEgo: EgoVehicle;
  initObstacles: WorldObject[];
  goal: { x: number; y: number };
}

export type SensorType = 'camera' | 'lidar' | 'radar';

export interface SensorObservation {
  sensorType: SensorType;
  id: string; // Internal sensor track ID
  x: number;
  y: number;
  velocity?: number;
  heading?: number;
  type?: ObjectType;
  width?: number;
  length?: number;
  confidence: number;
}

export interface TrackedObject {
  id: string; // Fused ID
  x: number;
  y: number;
  velocity: number;
  heading: number;
  width: number;
  length: number;
  type: ObjectType | 'unknown';
  confidence: number;
  sensorSources: SensorType[];
  uncertaintyRadius: number; // For non-linear expanding uncertainty
  visualX?: number; // Smoothed X for visualization
  visualY?: number; // Smoothed Y for visualization
}
