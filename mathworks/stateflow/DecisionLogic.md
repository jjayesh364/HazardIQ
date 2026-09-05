# Stateflow Decision Logic

**Status:** Reference Architecture Designed.

Below is the state machine specification that maps identically to the TypeScript browser prototype's `DecisionManager`.

## Stateflow Chart Definition

**Inputs:**
* `TargetOffset` (double)
* `CollisionFound` (boolean)
* `NoSafePath` (boolean)
* `DistanceToGoal` (double)

**Outputs:**
* `State` (enum: CRUISE, SLOW_DOWN, AVOID_LEFT, AVOID_RIGHT, EMERGENCY_STOP, GOAL_REACHED)
* `TargetVelocity` (double)

### States and Transitions

1. **CRUISE** (Default State)
   * *Entry/During*: `State = CRUISE; TargetVelocity = 15.0;`
   * *Transitions*: 
     * `[NoSafePath == true]` -> **EMERGENCY_STOP**
     * `[CollisionFound == true && TargetOffset == 0]` -> **SLOW_DOWN**
     * `[TargetOffset < 0]` -> **AVOID_LEFT**
     * `[TargetOffset > 0]` -> **AVOID_RIGHT**
     * `[DistanceToGoal < 10.0]` -> **GOAL_REACHED**

2. **SLOW_DOWN**
   * *Entry/During*: `State = SLOW_DOWN; TargetVelocity = 5.0;`
   * *Transitions*:
     * `[NoSafePath == true]` -> **EMERGENCY_STOP**
     * `[CollisionFound == false]` -> **CRUISE**
     * `[TargetOffset ~= 0]` -> **AVOID_LEFT** or **AVOID_RIGHT**
     * `[DistanceToGoal < 10.0]` -> **GOAL_REACHED**

3. **AVOID_LEFT**
   * *Entry/During*: `State = AVOID_LEFT; TargetVelocity = 10.0;`
   * *Transitions*:
     * `[NoSafePath == true]` -> **EMERGENCY_STOP**
     * `[TargetOffset == 0 && CollisionFound == false]` -> **CRUISE**
     * `[TargetOffset > 0]` -> **AVOID_RIGHT**
     * `[DistanceToGoal < 10.0]` -> **GOAL_REACHED**

4. **AVOID_RIGHT**
   * *Entry/During*: `State = AVOID_RIGHT; TargetVelocity = 10.0;`
   * *Transitions*:
     * `[NoSafePath == true]` -> **EMERGENCY_STOP**
     * `[TargetOffset == 0 && CollisionFound == false]` -> **CRUISE**
     * `[TargetOffset < 0]` -> **AVOID_LEFT**
     * `[DistanceToGoal < 10.0]` -> **GOAL_REACHED**

5. **EMERGENCY_STOP**
   * *Entry/During*: `State = EMERGENCY_STOP; TargetVelocity = 0.0; applyMaxBrake();`
   * *Transitions*:
     * `[NoSafePath == false && CollisionFound == false]` -> **CRUISE**

6. **GOAL_REACHED**
   * *Entry/During*: `State = GOAL_REACHED; TargetVelocity = 0.0;`
   * *Terminal State*
