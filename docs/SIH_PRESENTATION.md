# SIH Presentation Points

**Problem**: Lack of standardized road structures, unpredictable obstacles (cattle, pedestrians), and missing lane markings make autonomous driving challenging in India.
**Existing Challenge**: Most AI models are trained on structured Western roads.
**Proposed Solution**: A dual-system architecture combining deep learning for perception and a deterministic rule-based state machine (Adaptive Path Planner) for collision avoidance.
**Innovation**: Safely handling edge cases like "Sudden Cattle Crossing" via minimal viable distance scoring rather than relying entirely on black-box predictions.
**Architecture**: React/Vite (UI), Custom 2D Engine (Simulation), MATLAB (Underlying Mathematical Model).
**Five Scenarios**: 
1. Unmarked Village Road
2. Busy Urban Intersection
3. Highway Merge
4. Dense Market
5. Sudden Cattle Crossing
**Results**: Replanning latency consistently under 16ms (60 FPS real-time control).
