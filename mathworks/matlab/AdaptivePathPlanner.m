classdef AdaptivePathPlanner < handle
    % AdaptivePathPlanner calculates safest lateral offset
    properties
        Predictor
        CollisionCheck
        DecisionMgr
        TargetOffset = 0;
    end
    
    methods
        function obj = AdaptivePathPlanner(predictor, collisionCheck, decisionMgr)
            obj.Predictor = predictor;
            obj.CollisionCheck = collisionCheck;
            obj.DecisionMgr = decisionMgr;
        end
        
        function [steering, velocity, state, smoothness] = planStep(obj, egoState, trackedObjects, goal, prevSteering, dt)
            predictedObs = obj.Predictor.predict(trackedObjects, 3.0);
            
            offsets = [0, -10, 10, -20, 20];
            safestOffset = 0;
            minCost = inf;
            collisionFound = false;
            
            for i = 1:length(offsets)
                off = offsets(i);
                [isCollision, ~] = obj.CollisionCheck.checkPath(egoState, off, predictedObs, goal);
                
                if ~isCollision
                    cost = abs(off);
                    if cost < minCost
                        minCost = cost;
                        safestOffset = off;
                    end
                else
                    collisionFound = true;
                end
            end
            
            if isinf(minCost)
                state = 'EMERGENCY_STOP';
            else
                obj.TargetOffset = safestOffset;
                if obj.TargetOffset < 0
                    state = 'AVOID_LEFT';
                elseif obj.TargetOffset > 0
                    state = 'AVOID_RIGHT';
                else
                    if collisionFound
                        state = 'SLOW_DOWN';
                    else
                        state = 'CRUISE';
                    end
                end
            end
            
            [steering, velocity] = obj.DecisionMgr.actuate(egoState, obj.TargetOffset, state, goal, dt);
            
            steeringDelta = abs(steering - prevSteering);
            smoothness = steeringDelta; % Instantaneous delta
        end
    end
end
