classdef DecisionManager < handle
    % DecisionManager translates planner states into vehicle steering and velocity commands
    
    methods
        function [steering, velocity] = actuate(~, egoState, targetOffset, state, goal)
            dt = 1/60;
            velocity = egoState.velocity;
            
            if strcmp(state, 'EMERGENCY_STOP') || strcmp(state, 'STOP') || strcmp(state, 'GOAL_REACHED')
                velocity = max(0, velocity - 15 * dt);
            elseif strcmp(state, 'SLOW_DOWN') || strcmp(state, 'AVOID_LEFT') || strcmp(state, 'AVOID_RIGHT')
                velocity = max(3, velocity - 5 * dt);
            elseif strcmp(state, 'CRUISE')
                velocity = min(12, velocity + 3 * dt);
            end
            
            if velocity == 0
                steering = egoState.steering;
                return;
            end
            
            angleToGoal = atan2(goal.y - egoState.y, goal.x - egoState.x);
            lookahead = 15;
            wx = egoState.x + lookahead * cos(angleToGoal) - targetOffset * sin(angleToGoal);
            wy = egoState.y + lookahead * sin(angleToGoal) + targetOffset * cos(angleToGoal);
            
            targetHeading = atan2(wy - egoState.y, wx - egoState.x);
            headingDiff = targetHeading - egoState.heading;
            
            % Normalize headingDiff
            while headingDiff > pi; headingDiff = headingDiff - 2*pi; end
            while headingDiff < -pi; headingDiff = headingDiff + 2*pi; end
            
            steering = max(-0.8, min(0.8, headingDiff));
        end
    end
end
