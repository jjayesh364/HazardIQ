classdef SensorFusion < handle
    properties
        PreviousTracks
    end
    
    methods
        function obj = SensorFusion()
            obj.PreviousTracks = struct('id', {}, 'x', {}, 'y', {}, 'velocity', {}, 'heading', {}, 'uncertaintyRadius', {});
        end
        
        function fusedTracks = fuse(obj, observations)
            associationThreshold = 3.0;
            fusedTracks = struct('id', {}, 'x', {}, 'y', {}, 'velocity', {}, 'heading', {}, 'uncertaintyRadius', {});
            
            % Placeholder basic logic mapping the typescript approach
            for i = 1:length(observations)
                obs = observations(i);
                isErratic = strcmp(obs.type, 'cattle') || strcmp(obs.type, 'pedestrian');
                urad = 0.2;
                if isErratic
                    urad = 1.0;
                end
                
                fusedTracks(i).id = obs.id;
                fusedTracks(i).x = obs.x;
                fusedTracks(i).y = obs.y;
                fusedTracks(i).velocity = obs.velocity;
                fusedTracks(i).heading = obs.heading;
                fusedTracks(i).uncertaintyRadius = urad;
            end
            
            obj.PreviousTracks = fusedTracks;
        end
    end
end
