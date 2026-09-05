import { SimulationEngine } from '../simulation/engine';

export function exportMathWorksData(engine: SimulationEngine) {
  const snapshot = {
    timestamp: Date.now(),
    scenarioName: engine.scenarioName || 'Unknown',
    ego: {
      x: engine.ego.x,
      y: engine.ego.y,
      velocity: engine.ego.velocity,
      heading: engine.ego.heading,
      steering: engine.ego.steering
    },
    observations: engine.trackedObjects.map(obj => ({
      id: obj.id,
      x: obj.x,
      y: obj.y,
      velocity: obj.velocity,
      heading: obj.heading,
      type: obj.type,
      uncertaintyRadius: obj.uncertaintyRadius,
      confidence: obj.confidence
    })),
    metrics: {
      state: engine.state,
      targetOffset: engine.targetOffset,
      pathSmoothness: engine.metrics.pathSmoothness,
      collisions: engine.metrics.collisionCount
    }
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "mathworks_sim_snapshot.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
