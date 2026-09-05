# MathWorks Integration

This directory contains artifacts and architecture specifications for integrating the SIH Autonomous Vehicle Simulator with the MathWorks ecosystem.

The current implementation bridges the browser-based deterministic prototype (TypeScript) into professional automotive toolchains.

## Current Toolchain Status
- **MATLAB**: Reference files prepared. Local execution environment `Not Detected`.
- **Simulink**: Architecture and subsystem design prepared. `.slx` model execution `Not Detected`.
- **Stateflow**: State logic mapped. Execution `Not Detected`.
- **RoadRunner**: Scenarios documented for import. Native RoadRunner environment `Not Detected`.

## Directory Structure
- `matlab/`: Educational `.m` scripts representing our core Sensor Fusion, Path Planning, and Decision Logic modules.
- `simulink/`: Closed-loop architecture specifications for `AdaptiveAutonomousVehicle.slx`.
- `stateflow/`: State machine definition mapping the planner's states to a Stateflow chart.
- `roadrunner/`: Scene designs mapping the Unmarked Village and Urban Intersection scenarios into 3D environments.
- `data/`: Extracted JSON telemetry bridging the live browser simulation to MATLAB data structures.
