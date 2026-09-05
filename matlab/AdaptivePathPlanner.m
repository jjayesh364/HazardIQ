classdef AdaptivePathPlanner < handle
    % AdaptivePathPlanner - SIH Problem Statement 26037
    % This is an educational reference implementation corresponding to the web simulator.
    
    properties
        Predictor
        CollisionCheck
        DecisionMgr
        SensorFusion
        TargetOffset = 0;
    end
    
    methods
        function obj = AdaptivePathPlanner()
            obj.SensorFusion = SensorFusion();
            obj.Predictor = ObstaclePrediction();
            obj.CollisionCheck = CollisionChecker();
            obj.DecisionMgr = DecisionManager();
        end
        
        function [steering, velocity, state] = planStep(obj, egoState, cameraData, lidarData, radarData, goal)
            % 1. Sensor Fusion
            trackedObjects = obj.SensorFusion.fuse(cameraData, lidarData, radarData);
            
            % 2. Obstacle Prediction (with expanding uncertainty)
            predictedTrajectories = obj.Predictor.predict(trackedObjects, 3.0);
            
            % 3. Candidate Generation & Collision Check
            offsets = [0, -10, 10, -20, 20];
            safestOffset = 0;
            minCost = inf;
            collisionFound = false;
            
            for i = 1:length(offsets)
                off = offsets(i);
                [isCollision, minObsDist] = obj.CollisionCheck.checkPath(egoState, off, predictedTrajectories, goal);
                
                if ~isCollision
                    cost = abs(off); % Prefer staying close to center
                    if cost < minCost
                        minCost = cost;
                        safestOffset = off;
                    end
                else
                    collisionFound = true;
                end
            end
            
            % 4. Decision & Actuation
            if isinf(minCost)
                % No safe path
                state = 'EMERGENCY_STOP';
            else
                obj.TargetOffset = safestOffset;
                if obj.TargetOffset < 0
                    state = 'AVOID_LEFT';
                elseif obj.TargetOffset > 0
                    state = 'AVOID_RIGHT';
                else
                    if collisionFound % Path is clear but obstacles are near
                        state = 'SLOW_DOWN';
                    else
                        state = 'CRUISE';
                    end
                end
            end
            
            [steering, velocity] = obj.DecisionMgr.actuate(egoState, obj.TargetOffset, state, goal);
        end
    end
end
