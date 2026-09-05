# MathWorks Integration & HIL Readiness

This project represents a complete, MathWorks-aligned architecture preparing our browser prototype for Hardware-in-the-Loop (HIL) testing within MATLAB, Simulink, and RoadRunner. 

## A. Current Browser Prototype (LIVE)
The core simulation runs directly in the browser via TypeScript to ensure the demonstration is fully interactive and universally accessible during the hackathon pitch. This closed-loop engine dynamically handles sensor fusion, prediction, trajectory planning, and vehicle control.

## B. MATLAB Reference Implementation (READY)
Located in `mathworks/matlab/`. We provide direct `.m` file equivalents to our core algorithms (e.g., `AdaptivePathPlanner.m`, `CollisionChecker.m`). These demonstrate mathematically identical approaches to our TypeScript logic, ensuring the logic is production-ready for the automotive sector.

## C. Simulink Architecture (READY)
Located in `mathworks/simulink/AdaptiveAutonomousVehicle_ARCHITECTURE.md`. Because Simulink is not locally installed in this exact repository environment, we supply the exact architecture mapping (Sensors -> Fusion -> Prediction -> Decision -> Control) that details how our system ports natively into `.slx` blocksets.

## D. Stateflow Decision Logic (READY)
Located in `mathworks/stateflow/DecisionLogic.md`. Maps the 5 specific states (`CRUISE`, `SLOW_DOWN`, `AVOID`, `EMERGENCY_STOP`, `GOAL_REACHED`) directly into Stateflow logic requirements.

## E. RoadRunner Scenario Layer (READY)
Located in `mathworks/roadrunner/`. Translates our Unmarked Village and Urban Intersection scenarios into requirements for MathWorks RoadRunner.

## F. Data Exchange (LIVE)
The browser dashboard provides an **"Export MathWorks Simulation Data"** button. This takes a snapshot of the live vehicle state, fused objects, trajectory decisions, and telemetry, exporting a JSON file that can be ingested into MATLAB via `mathworks/matlab/import_browser_data.m`.

## Demonstration Flow
1. **Interactive Demo**: Show the live 60Hz browser prototype avoiding obstacles.
2. **Export Data**: Click the Export button to save the state.
3. **MATLAB Import**: Point to the `.m` scripts and the `import_browser_data.m` loader to prove compatibility with industry-standard toolchains.
