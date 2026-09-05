# RoadRunner Integration

**Status:** Scenario Specifications Prepared. (RoadRunner installation `Not Detected`).

To fulfill the SIH requirements for photorealistic simulation and Hardware-in-the-Loop (HIL) testing, the browser prototype scenarios translate directly into MathWorks RoadRunner.

## Scenario 1: Unmarked Village Road (VillageRoad.rrscene)
- **Road Geometry:** 10m wide dirt/asphalt mix. No lane markings.
- **Ego Trajectory:** Center-aligned routing.
- **Traffic Participants:** 
  - 1 Pedestrian actor with random lateral jitter trajectory.
  - 1 Slow-moving Auto-rickshaw actor.
- **Environment:** Dense roadside vegetation limiting sensor FOV.

## Scenario 2: Urban Intersection (UrbanIntersection.rrscene)
- **Road Geometry:** 4-way unsignalized crossing.
- **Traffic Participants:**
  - Crossing vehicles with right-of-way conflicts.
  - Pedestrians waiting at corners.
- **Objective:** Planner must predict crossing trajectories and reduce speed before entering the conflict zone.

*See `docs/MATHWORKS_INTEGRATION.md` for details on exporting these scenes into Simulink.*
