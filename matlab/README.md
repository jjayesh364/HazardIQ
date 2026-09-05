# MATLAB Reference Implementation

This folder contains reference `.m` files for the SIH Autonomous Vehicle project.

## Files
- `AdaptivePathPlanner.m`: Core path planning logic.
- `ObstaclePrediction.m`: (To be added) Predicts obstacle trajectories.
- `DecisionManager.m`: (To be added) State machine logic.

## Integration with RoadRunner and Simulink
While the current prototype runs entirely in the browser for demonstration purposes (using React/TypeScript), these MATLAB files demonstrate the underlying mathematical models.

In a production environment, these algorithms would be deployed via:
1. **Automated Driving Toolbox**: To process actual LiDAR/Radar point clouds.
2. **Simulink**: To run the `AdaptivePathPlanner` as a block in a larger control system.
3. **RoadRunner**: To generate high-fidelity 3D scenarios of Indian roads, exporting OpenDRIVE networks which are then imported into MATLAB for closed-loop simulation.
