# SIH Autonomous Vehicle Prototype (Problem Statement 26037)

## Project Overview
This project tackles the Smart India Hackathon challenge of **Adaptive Path Planning and Collision Avoidance for Autonomous Vehicles on Unstructured Indian Roads**. 

Standard autonomous driving algorithms rely on well-defined lanes and predictable traffic. This project implements a cost-based, adaptive trajectory planner that thrives in unstructured environments containing erratic pedestrians, sudden cattle crossings, and informal merging.

## Features
- **Adaptive Path Planning**: Generates and evaluates lateral offsets to dynamically negotiate obstacles without lane definitions.
- **Sensor Simulation**: Real-time simulation of Camera, LiDAR, and Radar footprints and noise.
- **Sensor Fusion**: Proximity-based association of raw sensor data into consolidated `TrackedObjects`.
- **Irregular Movement Prediction**: Mathematical prediction models that expand safety buffers (uncertainty regions) based on the object type (e.g., cattle vs. cars).
- **Professional Dashboard**: React-based telemetry UI displaying latency, path smoothness, and scenario completion rates.
- **Dataset Validation Layer**: UI panel acknowledging Indian-road dataset references (IDD, DATS_2022) to ground our scenarios in real-world dimensions and behaviors without relying on opaque ML models for control.

## Architecture & Tiers
To fulfill the SIH requirements while providing an interactive demo, this project is delivered in distinct architectural tiers:

1. **Implemented Browser Simulation (Active)** 
   - A complete closed-loop autonomous driving simulator running in the browser using React, TypeScript, and a custom 60Hz physics/perception engine.
2. **MathWorks Integration Artifacts**
   - See `docs/MATHWORKS_INTEGRATION.md`.
   - **MATLAB**: Complete `.m` reference files (`mathworks/matlab/`) and a live Data Export bridge from the browser.
   - **Simulink & Stateflow**: Detailed architecture definitions (`mathworks/simulink/`, `mathworks/stateflow/`) for bridging the prototype into automotive blocksets.
   - **RoadRunner**: Scenario definitions for exporting our unstructured scenes to MathWorks RoadRunner.
   - *(Note: To ensure universal demonstration capability, native MathWorks toolchains are marked as Reference Ready rather than executing locally in the repository).*

## Five Scenarios
The simulator validates the logic across five required environments:
1. **Unmarked Village Road**: Pedestrians and slow vehicles without lane definitions.
2. **Busy Urban Intersection**: Unregulated crossing traffic.
3. **Highway Merge**: Merging dynamically with slower traffic (trucks/cars).
4. **Dense Market**: Pushcarts, parked vehicles, and random pedestrian movement.
5. **Sudden Cattle Crossing**: High-speed scenario where an animal unpredictably crosses the road from a blind spot.

## Project Structure
```text
/
├── src/
│   ├── components/       # React UI Dashboard
│   ├── sensors/          # Camera, LiDAR, Radar, and Fusion simulation
│   ├── simulation/       # Core physics, state machine, and path planner
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Deterministic RNG and helpers
├── matlab/               # Mathematical reference implementation (.m files)
├── docs/                 # SIH documentation (Reports, QA, Demo Script)
└── ...
```

## How to Run

1. Ensure Node.js is installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the interactive dashboard:
   ```bash
   npm run dev
   ```
4. Open your browser to the local URL (usually `http://localhost:5173`).

## Testing
The core engine is heavily tested using Vitest to ensure deterministic path planning, accurate sensor FOV filtering, and reliable collision avoidance.

Run the test suite:
```bash
npm run test
```

Build the project for production:
```bash
npm run build
```
