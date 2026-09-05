% import_browser_data.m
% Loads JSON telemetry exported from the SIH browser prototype for MATLAB validation.

function simData = import_browser_data(jsonFilePath)
    if ~isfile(jsonFilePath)
        error(['File not found: ', jsonFilePath]);
    end
    
    rawText = fileread(jsonFilePath);
    simData = jsondecode(rawText);
    
    disp('Successfully imported browser telemetry:');
    disp(['Scenario: ', simData.scenarioName]);
    disp(['Ego Velocity: ', num2str(simData.ego.velocity)]);
    disp(['Decision State: ', simData.metrics.state]);
end
