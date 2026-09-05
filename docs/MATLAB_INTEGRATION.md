# MATLAB / RoadRunner Integration

The current Phase 1 deliverable is a self-contained browser-based prototype designed for rapid demonstration at SIH.

**Future Architecture (Production):**
1. **Scenario Generation:** MathWorks RoadRunner will be used to design high-fidelity 3D scenarios matching the 5 required Indian road situations.
2. **Export:** Scenarios exported to OpenDRIVE.
3. **Simulink Integration:** The vehicle dynamics (Vehicle Dynamics Blockset) and deterministic path planner (AdaptivePathPlanner.m) will run in Simulink.
4. **Sensor Simulation:** Automated Driving Toolbox will provide synthetic LiDAR and Camera detections from the RoadRunner environment to feed into the Simulink model.
