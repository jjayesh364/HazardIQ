classdef DecisionManager < handle
    methods
        function [steering, velocity] = actuate(~, egoState, targetOffset, state, goal, dt)
            distToGoal = hypot(goal.x - egoState.x, goal.y - egoState.y);
            if distToGoal < 10
                state = 'GOAL_REACHED';
            end
            
            angleToGoal = atan2(goal.y - egoState.y, goal.x - egoState.x);
            lookahead = 20;
            wx = egoState.x + lookahead * cos(angleToGoal) - targetOffset * sin(angleToGoal);
            wy = egoState.y + lookahead * sin(angleToGoal) + targetOffset * cos(angleToGoal);
            
            targetHeading = atan2(wy - egoState.y, wx - egoState.x);
            steering = targetHeading - egoState.heading;
            
            while steering > pi, steering = steering - 2*pi; end
            while steering < -pi, steering = steering + 2*pi; end
            
            steering = max(-pi/4, min(pi/4, steering));
            
            switch state
                case 'CRUISE'
                    velocity = min(15, egoState.velocity + 2.0 * dt);
                case 'SLOW_DOWN'
                    velocity = max(5, egoState.velocity - 5.0 * dt);
                case {'AVOID_LEFT', 'AVOID_RIGHT'}
                    velocity = min(10, egoState.velocity - 2.0 * dt);
                case 'EMERGENCY_STOP'
                    velocity = max(0, egoState.velocity - 15.0 * dt);
                case 'GOAL_REACHED'
                    velocity = 0;
            end
        end
    end
end
