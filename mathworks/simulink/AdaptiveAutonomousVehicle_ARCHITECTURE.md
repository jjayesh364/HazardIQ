# Simulink Architecture

## AdaptiveAutonomousVehicle.slx

**Status:** Reference Architecture Designed. (Simulink environment `Not Detected` locally).

Since Simulink is not locally active in this repository environment, a raw `.slx` file is not included to prevent version conflicts and empty block errors. Below is the exact architecture specification required to construct the closed-loop model natively in Simulink.

### Top-Level Subsystems

1. **Scenario & Environment Generation**
   - **Inputs:** Ego Vehicle State.
   - **Outputs:** Ground Truth Object list (Positions, Velocities, Headings).
   - *Implementation:* Automated Driving Toolbox Scenario Reader.

2. **Sensor Suite Simulation**
   - **Camera:** Vision Detection Generator block (adds classification, distance drop-off, 90° FOV).
   - **LiDAR:** Lidar Point Cloud Generator (adds spatial gaussian noise, 360° FOV).
   - **Radar:** Driving Radar Data Generator (adds velocity accuracy, 45° FOV).

3. **Sensor Fusion & Tracking**
   - **Inputs:** Detections from Camera, LiDAR, Radar.
   - **Outputs:** Fused Tracks (`TrackedObject` bus array).
   - *Implementation:* Multi-Object Tracker block with custom proximity association threshold (3.0m).

4. **Prediction & Uncertainty Expansion**
   - **Inputs:** Fused Tracks.
   - **Outputs:** Predicted Trajectories (3.0s horizon).
   - *Implementation:* MATLAB Function Block utilizing `ObstaclePrediction.m` mathematics. Linearly expands uncertainty radius based on object classification.

5. **Adaptive Path Planner & Collision Checker**
   - **Inputs:** Predicted Trajectories, Ego State, Goal Coordinates.
   - **Outputs:** Target Lateral Offset, Collision Flag.
   - *Implementation:* MATLAB Function Block utilizing `CollisionChecker.m` and `AdaptivePathPlanner.m` to generate offset trajectories (-20m to +20m) and select the lowest cost safe path.

6. **Decision Logic (Stateflow)**
   - **Inputs:** Target Lateral Offset, Collision Flag, Distance to Goal.
   - **Outputs:** Vehicle Target State (`CRUISE`, `AVOID`, `EMERGENCY_STOP`).
   - *Implementation:* Stateflow Chart (see `stateflow/DecisionLogic.md`).

7. **Vehicle Controller**
   - **Inputs:** Ego State, Target Offset, Decision State.
   - **Outputs:** Throttle, Brake, Steering Commands.
   - *Implementation:* Lateral/Longitudinal Stanley or Pure Pursuit controllers.

8. **Vehicle Dynamics**
   - **Inputs:** Throttle, Brake, Steering Commands.
   - **Outputs:** Updated Ego State.
   - *Implementation:* Kinematic Bicycle Model block from Vehicle Dynamics Blockset.
