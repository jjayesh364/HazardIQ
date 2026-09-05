# SIH Judge Q&A Guide

**1. Why did you choose a 3-sensor fusion approach (Camera, LiDAR, Radar)?**
Each sensor has weaknesses. Cameras are great for classification but poor at depth estimation. LiDAR gives precise 360-degree spatial mapping but struggles with velocity extraction and weather. Radar penetrates weather and extracts instant relative velocity, but has low spatial resolution. Fusing them ensures redundancy and reliability on chaotic Indian roads.

**2. How does your Sensor Fusion work?**
It uses a proximity-based association algorithm. If a Camera bounding box, LiDAR point cloud, and Radar return are within a 3.0-meter threshold, they are fused into a single `TrackedObject`. LiDAR is prioritized for positioning, Radar for velocity, and Camera for classification.

**3. How do you predict the movement of something unpredictable like cattle?**
We use an expanding uncertainty model. While we project a linear trajectory based on current velocity, we assign cattle and pedestrians a high base uncertainty radius. This radius expands linearly over the 3-second prediction horizon, forcing the planner to treat the animal not as a point, but as a large, growing hazardous zone.

**4. Why aren't you using an LLM or Generative AI for the driving decisions?**
Safety-critical systems like autonomous driving require strict determinism, low latency (sub-20ms), and mathematical verifiability. Generative AI is prone to hallucination and unpredictable latency. We use deterministic cost-based trajectory evaluation.

**5. How does your adaptive path planner work without lane markings?**
Instead of following a rigid center-line, our planner generates multiple lateral offset trajectories (e.g., straight, 10m left, 20m right). It checks each trajectory against the predicted obstacle uncertainty zones. It selects the trajectory that is completely collision-free while having the lowest lateral cost (closest to the center).

**6. What is the latency of your pipeline?**
Our entire pipeline—sensor observation, fusion, prediction, candidate generation, and vehicle actuation—completes in under 5 milliseconds per frame in the browser, well within the 60Hz (16ms) real-time requirement.

**7. How do you handle a sudden obstacle that wasn't there a second ago?**
Our pipeline runs at 60Hz. If a pedestrian steps out from behind a parked truck, they immediately enter the LiDAR/Camera FOV. The system instantly detects the obstacle, calculates the time-to-collision, and overrides the state machine to `EMERGENCY_STOP` or `AVOID`.

**8. What is the role of MATLAB in this project?**
Since the SIH problem statement was provided by MathWorks, we provided 1:1 educational MATLAB reference implementations (`.m` files) of our core algorithms (Path Planning, Sensor Fusion, Prediction). This proves our logic is directly translatable to automotive industry standards.

**9. Is MathWorks RoadRunner or Simulink implemented in this demo?**
No, this live interactive demo runs in a browser to ensure it is accessible and easily presentable for the hackathon format. However, our architecture is strictly decoupled (Sensors → Fusion → Planning → Control), making it fully compatible for future integration into Simulink and RoadRunner.

**10. How do you track path smoothness?**
We calculate the cumulative variance in the steering angle command between frames. A trajectory that requires jerky, oscillating steering will have a high (bad) smoothness score, while a smooth passing maneuver keeps the score low.

**11. Does your vehicle always stop for obstacles?**
No. If a safe lateral offset trajectory exists and is clear of the obstacle's uncertainty zone, the vehicle will seamlessly steer around the obstacle (e.g., overtaking a slow pushcart) without stopping.

**12. How does the vehicle know where the goal is?**
The vehicle is provided a global GPS-style waypoint. The path planner aims for this macro-goal while handling micro-avoidance locally.

**13. What happens if all candidate trajectories result in a collision?**
If no safe offset is found, the planner assigns an infinite cost to the path, which triggers the `DecisionManager` to immediately shift into an `EMERGENCY_STOP` state and apply maximum braking.

**14. Are the obstacles scripted or dynamic?**
The obstacles follow deterministic behavioral models. For example, 'random' pedestrians continuously adjust their heading and velocity using a seeded random generator, making them drift unpredictably while remaining repeatable for testing.

**15. How realistic is the kinematic model?**
We use a standard 2D kinematic bicycle model which respects steering angle limits (turning radius) and velocity constraints. It prevents the car from moving sideways instantly.

**16. What are the limitations of your current approach?**
The current simulation is 2D and assumes flat terrain. It lacks 3D suspension dynamics and tire friction models (slip angles). 

**17. How scalable is your sensor fusion?**
Because the fusion relies on a spatial proximity threshold, its complexity scales with the number of obstacles. For extremely dense environments, a spatial partitioning algorithm (like a QuadTree) would be needed to maintain low latency.

**18. Why build a web simulator instead of using an existing one?**
To directly answer the SIH problem statement regarding *Indian* unstructured roads, we needed absolute control over the environment to simulate chaotic entities like cattle, pushcarts, and informal merging without the constraints of Western-centric lane-following simulators.

**19. How would this deploy to a real vehicle?**
The algorithms would be compiled via Simulink Coder to C++ and deployed onto an automotive RTOS (Real-Time Operating System) connected to physical CAN bus actuators.

**20. What is the most novel part of your solution?**
Our expanding uncertainty model specifically tailored for Indian traffic. By scaling the uncertainty radius based on the *classification* of the object (cattle vs. car), we mathematically replicate the human intuition of giving unpredictable animals a wider berth than predictable vehicles.
