classdef ObstaclePrediction < handle
    % ObstaclePrediction estimates future positions and uncertainty of tracked objects
    
    methods
        function predictedTrajectories = predict(~, trackedObjects, horizonTime)
            predictedTrajectories = struct('id', {}, 'x', {}, 'y', {}, 'uncertaintyRadius', {});
            
            for i = 1:length(trackedObjects)
                obj = trackedObjects(i);
                
                % Constant Velocity Model
                predX = obj.x + obj.velocity * cos(obj.heading) * horizonTime;
                predY = obj.y + obj.velocity * sin(obj.heading) * horizonTime;
                
                % Uncertainty expands with time
                % Erratic objects (pedestrians/cattle) have higher base uncertainty
                baseUncertainty = obj.baseUncertainty;
                expandedUncertainty = baseUncertainty * horizonTime;
                
                predictedTrajectories(i).id = obj.id;
                predictedTrajectories(i).x = predX;
                predictedTrajectories(i).y = predY;
                predictedTrajectories(i).cx = obj.x;
                predictedTrajectories(i).cy = obj.y;
                predictedTrajectories(i).uncertaintyRadius = expandedUncertainty;
            end
        end
    end
end
