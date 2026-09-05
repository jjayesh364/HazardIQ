# SIH Architecture

## Overview
The prototype operates primarily in a React/Vite web environment to provide an interactive dashboard.

## Simulation Pipeline
Every frame (~16ms):
1. **Environment Update:** Obstacles move.
2. **Sensors/Perception:** (Mocked) Detect relative distances.
3. **Prediction:** Short-term deterministic projection (3 seconds).
4. **Collision Risk:** Calculate distance to all objects.
5. **Decision Making:** 
   - `CRUISE`: Path clear.
   - `SLOW_DOWN`: Obstacles near.
   - `EMERGENCY_STOP`: Imminent collision.
6. **Vehicle Control:** Actuate steering and speed towards goal avoiding predicted obstacle positions.
