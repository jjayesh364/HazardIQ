# SIH Scenario Results Template

Please record the actual performance metrics for each scenario during final validation testing.

| Scenario ID | Name | Completion Rate | Collisions | Min Obstacle Dist (m) | Path Smoothness | Emergency Stops | Pipeline Latency (ms) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **S1** | Unmarked Village Road | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] |
| **S2** | Busy Urban Intersection | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] |
| **S3** | Highway Merge | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] |
| **S4** | Dense Market | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] |
| **S5** | Sudden Cattle Crossing | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] | [placeholder] |

### Metric Definitions
- **Completion Rate**: Number of times the ego vehicle successfully reached the `GOAL_REACHED` state without crashing out of 10 attempts.
- **Collisions**: Number of discrete collision events triggered during the run.
- **Min Obstacle Dist (m)**: The absolute closest distance the ego vehicle came to any hazard.
- **Path Smoothness**: The cumulative variance in steering inputs; a lower number represents a smoother trajectory.
- **Emergency Stops**: Number of times the `EMERGENCY_STOP` state was triggered.
- **Pipeline Latency (ms)**: Average real-time millisecond execution time of the full perception-to-actuation pipeline loop.
