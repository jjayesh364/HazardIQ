# SIH 3-5 Minute Live Demo Script

## 0:00 - Introduction & Setup
**Action:** Open the browser to `http://localhost:5175`. Ensure the dashboard is visible and the "Unmarked Village Road" scenario is selected in the top dropdown.
**Speaker:** "Hello judges, our project tackles Problem Statement 26037: Adaptive Path Planning for Autonomous Vehicles on Unstructured Indian Roads. Instead of relying on Western lane-following logic, we have built a cost-based trajectory planner that dynamically negotiates chaotic spaces."

## 0:30 - Explaining the UI & Sensors
**Action:** Do NOT click Start yet. Point to the UI elements.
**Speaker:** "On our dashboard, the center canvas represents the world. You can see our sensor footprints: the blue cone is the Camera, the green circle is the 360 LiDAR, and the yellow cone is the long-range Radar. On the right, our Telemetry panel measures our pipeline latency and path smoothness in real-time. Notice the Perception panel—it proves our planner does not cheat; it only acts on fused data from our virtual sensors."

## 1:00 - Scenario 1: Unmarked Village Road
**Action:** Click the **Start** button.
**Speaker:** "As the vehicle moves, you'll see it identify the pedestrian and the slow vehicle. Notice the translucent green line—that is our adaptive planner evaluating lateral offsets. It calculates a safe passing maneuver on the fly without lane markers."
**Judges Should Observe:** The vehicle smoothly steering around the pedestrian and car, logging 0 collisions, and reaching the green goal circle.

## 1:45 - The Uncertainty Concept
**Action:** Select "Dense Market" from the dropdown. Click **Start**.
**Speaker:** "Indian roads have highly erratic obstacles. Watch the pedestrian and pushcart. The faint red circle expanding ahead of them represents our expanding uncertainty model. Because they move randomly, our planner expands the safety buffer it requires, forcing our vehicle to give them a wider berth than a predictable car."
**Judges Should Observe:** The red uncertainty regions and the ego vehicle steering cautiously around the dense cluster.

## 2:30 - Scenario 5: Sudden Cattle Crossing
**Action:** Select "Sudden Cattle Crossing" from the dropdown. Click **Start**.
**Speaker:** "The true test of our pipeline latency is a sudden appearance. Here, an animal is off-road and entirely outside our sensor field of view. Our vehicle is at cruising speed."
**Judges Should Observe:** The cattle suddenly darting into the road. The UI flashes `EMERGENCY_STOP` or `AVOID_LEFT`, the vehicle brakes heavily, and avoids the cattle.
**Speaker:** "The moment the cattle entered the LiDAR range, it was fused, tracked, and its trajectory predicted. Within milliseconds, the decision manager overrode the cruise state and initiated emergency braking."

## 3:30 - Codebase & MATLAB
**Action:** Briefly show the VS Code editor with `matlab/AdaptivePathPlanner.m` open.
**Speaker:** "While our visualizer is in React, the architecture is designed for automotive industry standards. We have provided clean MATLAB reference implementations of this exact logic, preparing us for seamless hardware-in-the-loop integration with MathWorks RoadRunner. Thank you."
