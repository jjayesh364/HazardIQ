# SIH Technical Report

## Problem Statement 26037
**Title**: Adaptive Path Planning and Collision Avoidance for Autonomous Vehicles on Unstructured Indian Roads.
**Organization**: MathWorks

## Problem Definition
Unstructured Indian roads present a unique challenge for autonomous navigation. Unlike highly organized Western highways, these roads suffer from missing lane markings, informal merging, and the sudden appearance of erratic obstacles such as pedestrians, pushcarts, and cattle. Standard lane-following and static path planning algorithms fail under these highly dynamic and unpredictable conditions. 

## Proposed Solution
We propose a robust, multi-tier autonomous driving architecture that shifts away from rigid lane-following toward an adaptive, cost-based trajectory evaluation. The system fuses multiple sensor modalities, tracks moving obstacles, models behavioral uncertainty (especially for erratic entities like cattle), and rapidly replans a collision-free path at high frequencies.

## System Architecture
The architecture is designed to be modular and scalable, separated into the following tiers:
1. **Implemented Browser Simulation (Active)**: A complete closed-loop TypeScript simulation of the vehicle physics, environments, sensors, and planning logic.
2. **MathWorks Integration Artifacts (Reference Ready)**: A structured mapping of our logic into MATLAB `.m` files, Simulink `.slx` subsystem definitions, and Stateflow logic charts.
3. **Data Exchange Bridge (Live)**: Real-time telemetry export linking the active browser simulation to offline MATLAB analysis scripts.

### Dataset Validation & References
While our simulation is a highly capable deterministic engine, its unstructured scenarios are anchored by real-world references. We utilize **India Driving Dataset (IDD)** and **DATS_2022** strictly as reference points for validating object dimensions, classifications, and chaotic lane behavior. 
*(Note: To ensure real-time verifiability and safety, our core path planner is completely deterministic and does not use a black-box AI model trained on this data. These datasets serve as ground truth for future perception model training).*

### Camera, LiDAR, and Radar Simulation
Our environment leverages three distinct simulated sensors to process the ground truth:
* **CameraSensor**: Operates over a 90° FOV up to 60m. Extracts bounding boxes and classifications (`ObjectType`), with confidence dropping over distance.
* **LiDARSensor**: Provides 360° coverage up to 40m. Applies spatial Gaussian noise to represent point-cloud jitter.
* **RadarSensor**: Operates over a narrow 45° FOV up to 100m. Highly accurate at extracting relative velocity and heading, but with larger spatial noise.

### Sensor Fusion & Object Tracking
The `SensorFusion` module associates incoming detections using a spatial proximity threshold (3.0m). It creates consolidated `TrackedObject` representations, prioritizing LiDAR for position, Radar for velocity, and Camera for classification. Confidence scores increase dynamically when multiple sensors agree.

### Motion Prediction & Uncertainty Modeling
We employ a 3-second predictive horizon. Using the fused data, the `ObstaclePrediction` module estimates future trajectories. Erratic objects (cattle, pedestrians) are assigned a high base uncertainty (1.0m) compared to vehicles (0.2m). This uncertainty expands linearly over time, forcing the planner to evaluate a wider cone of avoidance for unpredictable entities.

### Adaptive Path Planning & Collision Checking
The `AdaptivePathPlanner` generates an array of candidate trajectories (e.g., straight, slight left, hard right). Each trajectory is validated against the predicted future states of obstacles via dot-product line-segment projection. The system selects the safest path with the lowest lateral offset to stay as central as safely possible.

### Decision Logic & Vehicle Control
Based on the safest available path, the `DecisionManager` transitions the vehicle state between `CRUISE`, `AVOID_LEFT`, `AVOID_RIGHT`, `SLOW_DOWN`, and `EMERGENCY_STOP`. These states dictate the kinematic throttle/braking limits, while the vehicle physically steers towards the selected target offset waypoint.

## Five Scenarios
The system is validated against five critical Indian road scenarios:
1. **Unmarked Village Road**: Pedestrians and slow vehicles without lane definitions.
2. **Busy Urban Intersection**: Unregulated crossing traffic.
3. **Highway Merge**: Merging dynamically with slower traffic (trucks/cars).
4. **Dense Market**: Pushcarts, parked vehicles, and random pedestrian movement.
5. **Sudden Cattle Crossing**: High-speed scenario where an animal unpredictably crosses the road from a blind spot.

## Metrics & Testing Results
Performance is tracked via real-time metrics:
* **Path Smoothness**: Cumulative variance in steering angle.
* **Scenario Completion Rate**: Ratio of successful runs to total attempts.
* **Replanning Latency**: Millisecond timing of the full sensor-to-actuation pipeline.
* **Minimum Obstacle Distance**: The closest the ego vehicle comes to a hazard.

*Testing Results*: All 21 deterministic unit tests pass, confirming FOV occlusion, sensor noise, fusion behavior, and collision avoidance.

## Limitations & Future Improvements
**Limitations**: The current prototype uses a 2D kinematic bicycle model which lacks 3D suspension and tire friction dynamics. The simulation operates on assumed flat terrain.
**Future Improvements**: Migration to MathWorks RoadRunner for photorealistic 3D simulation and Simulink for high-fidelity vehicle dynamics testing. Extending the sensor fusion logic to use Kalman Filtering.
