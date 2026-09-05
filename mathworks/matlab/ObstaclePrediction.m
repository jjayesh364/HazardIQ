classdef ObstaclePrediction < handle
    methods
        function predictedTrajectories = predict(~, trackedObjects, horizonTime)
            predictedTrajectories = struct('id', {}, 'x', {}, 'y', {}, 'cx', {}, 'cy', {}, 'uncertaintyRadius', {});
            
            for i = 1:length(trackedObjects)
                obj = trackedObjects(i);
                
                predX = obj.x + obj.velocity * cos(obj.heading) * horizonTime;
                predY = obj.y + obj.velocity * sin(obj.heading) * horizonTime;
                
                expandedUncertainty = obj.uncertaintyRadius * horizonTime;
                
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
