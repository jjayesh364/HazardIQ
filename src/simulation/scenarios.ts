import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    name: 'Unmarked Village Road',
    description: 'Narrow road, pedestrians, slow vehicle.',
    initEgo: { x: 0, y: 50, width: 2, length: 4, velocity: 0, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: [
      { id: 'o1', type: 'pedestrian', x: 40, y: 48, width: 0.5, length: 0.5, velocity: 1, heading: Math.PI/2, behavior: 'random' },
      { id: 'o2', type: 'car', x: 60, y: 50, width: 2, length: 4, velocity: 3, heading: 0, behavior: 'linear' }
    ],
    goal: { x: 150, y: 50 }
  },
  {
    id: 's2',
    name: 'Busy Urban Intersection',
    description: 'No signals, crossing traffic.',
    initEgo: { x: 0, y: 50, width: 2, length: 4, velocity: 0, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: [
      { id: 'o1', type: 'auto-rickshaw', x: 50, y: 20, width: 1.5, length: 2.5, velocity: 5, heading: Math.PI/2, behavior: 'linear' },
      { id: 'o2', type: 'car', x: 80, y: 80, width: 2, length: 4, velocity: 5, heading: -Math.PI/2, behavior: 'linear' }
    ],
    goal: { x: 150, y: 50 }
  },
  {
    id: 's3',
    name: 'Highway Merge',
    description: 'Merge with slower traffic.',
    initEgo: { x: 0, y: 50, width: 2, length: 4, velocity: 8, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: [
      { id: 'o1', type: 'truck', x: 50, y: 50, width: 2.5, length: 8, velocity: 4, heading: 0, behavior: 'linear' },
      { id: 'o2', type: 'car', x: 30, y: 45, width: 2, length: 4, velocity: 6, heading: 0.1, behavior: 'linear' }
    ],
    goal: { x: 200, y: 50 }
  },
  {
    id: 's4',
    name: 'Dense Market',
    description: 'Pushcarts, parked vehicles.',
    initEgo: { x: 0, y: 50, width: 2, length: 4, velocity: 0, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: [
      { id: 'o1', type: 'pushcart', x: 30, y: 51, width: 1.5, length: 2, velocity: 0.5, heading: 0, behavior: 'linear' },
      { id: 'o2', type: 'static', x: 60, y: 48, width: 2, length: 4, velocity: 0, heading: 0, behavior: 'static' },
      { id: 'o3', type: 'pedestrian', x: 80, y: 52, width: 0.5, length: 0.5, velocity: 1, heading: -Math.PI/4, behavior: 'random' }
    ],
    goal: { x: 120, y: 50 }
  },
  {
    id: 's5',
    name: 'Sudden Cattle Crossing',
    description: 'Animal abruptly enters road.',
    initEgo: { x: 0, y: 50, width: 2, length: 4, velocity: 8, heading: 0, steering: 0, acceleration: 0 },
    initObstacles: [
      { id: 'o1', type: 'cattle', x: 40, y: 55, width: 1, length: 2, velocity: 0, heading: -Math.PI/2, behavior: 'sudden_crossing', triggerDistance: 30 }
    ],
    goal: { x: 100, y: 50 }
  }
];
