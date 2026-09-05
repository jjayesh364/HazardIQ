classdef CollisionChecker < handle
    % CollisionChecker checks candidate trajectories against predicted obstacle states
    
    methods
        function [isCollision, minObsDist] = checkPath(~, egoState, offset, predictedTrajectories, goal)
            lookahead = 20.0;
            angleToGoal = atan2(goal.y - egoState.y, goal.x - egoState.x);
            
            wx = egoState.x + lookahead * cos(angleToGoal) - offset * sin(angleToGoal);
            wy = egoState.y + lookahead * sin(angleToGoal) + offset * cos(angleToGoal);
            
            isCollision = false;
            minObsDist = inf;
            L2 = (wx - egoState.x)^2 + (wy - egoState.y)^2;
            
            for i = 1:length(predictedTrajectories)
                obs = predictedTrajectories(i);
                
                % Projection of obstacle onto trajectory segment
                if L2 > 0
                    t = ((obs.cx - egoState.x) * (wx - egoState.x) + (obs.cy - egoState.y) * (wy - egoState.y)) / L2;
                    t = max(0, min(1, t));
                    projX = egoState.x + t * (wx - egoState.x);
                    projY = egoState.y + t * (wy - egoState.y);
                    
                    distToTrajectory = hypot(obs.cx - projX, obs.cy - projY);
                    buffer = 4.0 + obs.uncertaintyRadius;
                    
                    distToEgo = hypot(obs.cx - egoState.x, obs.cy - egoState.y);
                    if distToEgo < minObsDist
                        minObsDist = distToEgo;
                    end
                    
                    if distToTrajectory < buffer && distToEgo < 25
                        isCollision = true;
                        break;
                    end
                end
            end
        end
    end
end
