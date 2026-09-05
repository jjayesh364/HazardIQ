import { useEffect, useRef, useState } from 'react';
import { SimulationEngine } from '../simulation/engine';
import { SCENARIOS } from '../simulation/scenarios';
import { DATASETS, checkDatasetSamples } from '../datasets';
import { exportMathWorksData } from '../integration/mathworksExport';
import { Play, Pause, RotateCcw, AlertTriangle, Activity } from 'lucide-react';

const Dashboard = () => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const engineRef = useRef<SimulationEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reqRef = useRef<number>();

  const [metrics, setMetrics] = useState({
    state: 'CRUISE',
    velocity: 0,
    minDist: 0,
    latency: 0,
    collisions: 0,
    avgSpeed: 0,
    cam: 0,
    lidar: 0,
    radar: 0,
    fused: 0,
    smoothness: 0
  });

  const [stats, setStats] = useState<Record<number, { attempts: number; completions: number }>>({});
  const completionLogged = useRef<boolean>(false);

  const [datasets, setDatasets] = useState(DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  useEffect(() => {
    // Check for local samples
    checkDatasetSamples().then(results => {
      setDatasets(prev => prev.map(ds => ({
        ...ds,
        isLoaded: results[ds.id] || false
      })));
    });
  }, []);

  const initSimulation = () => {
    engineRef.current = new SimulationEngine(SCENARIOS[scenarioIdx]);
    draw();
  };

  useEffect(() => {
    initSimulation();
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [scenarioIdx]);

  const togglePlay = () => {
    if (!isRunning) {
      if (metrics.state === 'CRUISE' && engineRef.current?.ego.x === SCENARIOS[scenarioIdx].initEgo.x) {
         setStats(prev => ({
           ...prev,
           [scenarioIdx]: {
             attempts: (prev[scenarioIdx]?.attempts || 0) + 1,
             completions: prev[scenarioIdx]?.completions || 0
           }
         }));
      }
    }
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    completionLogged.current = false;
    initSimulation();
  };

  const draw = () => {
    if (!canvasRef.current || !engineRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const engine = engineRef.current;

    // Clear
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw Road (simple gray background)
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw Grid/Lane markings
    ctx.strokeStyle = '#555';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(0, 50 * 5);
    ctx.lineTo(ctx.canvas.width, 50 * 5);
    ctx.stroke();
    ctx.setLineDash([]);

    const scale = 5;

    // Draw Goal
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(engine.goal.x * scale, engine.goal.y * scale, 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw Ground Truth (faint)
    engine.obstacles.forEach(obs => {
      ctx.save();
      ctx.translate(obs.x * scale, obs.y * scale);
      ctx.rotate(obs.heading);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(-obs.length * scale / 2, -obs.width * scale / 2, obs.length * scale, obs.width * scale);
      ctx.restore();
    });

    // Draw Tracked (Fused) Objects
    engine.trackedObjects.forEach(obs => {
      ctx.save();
      const drawX = obs.visualX ?? obs.x;
      const drawY = obs.visualY ?? obs.y;
      ctx.translate(drawX * scale, drawY * scale);
      ctx.rotate(obs.heading);

      // Predict trajectory
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(obs.velocity * 3 * scale, 0); // 3 sec prediction
      ctx.stroke();

      // Uncertainty region at t=3s
      if (obs.uncertaintyRadius > 0) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(obs.velocity * 3 * scale, 0, obs.uncertaintyRadius * 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = obs.type === 'pedestrian' || obs.type === 'cattle' ? 'orange' : 'red';
      ctx.fillRect(-obs.length * scale / 2, -obs.width * scale / 2, obs.length * scale, obs.width * scale);
      
      // Confidence text
      ctx.rotate(-obs.heading); // Un-rotate for text
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.fillText(`${(obs.confidence * 100).toFixed(0)}%`, -10, -15);
      
      ctx.restore();
      
      // Draw small indicators for sensor sources
      ctx.save();
      ctx.translate(drawX * scale, drawY * scale);
      let dotX = -5;
      if (obs.sensorSources.includes('camera')) { ctx.fillStyle='blue'; ctx.fillRect(dotX, 5, 4, 4); dotX+=6; }
      if (obs.sensorSources.includes('lidar')) { ctx.fillStyle='green'; ctx.fillRect(dotX, 5, 4, 4); dotX+=6; }
      if (obs.sensorSources.includes('radar')) { ctx.fillStyle='yellow'; ctx.fillRect(dotX, 5, 4, 4); }
      
      ctx.restore();
    });

    // Draw Planned Trajectory
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(engine.ego.x * scale, engine.ego.y * scale);
    const lookahead = 20;
    const angleToGoal = Math.atan2(engine.goal.y - engine.ego.y, engine.goal.x - engine.ego.x);
    const wx = engine.ego.x + lookahead * Math.cos(angleToGoal) - engine.targetOffset * Math.sin(angleToGoal);
    const wy = engine.ego.y + lookahead * Math.sin(angleToGoal) + engine.targetOffset * Math.cos(angleToGoal);
    ctx.lineTo(wx * scale, wy * scale);
    ctx.stroke();
    ctx.lineWidth = 1;

    // Draw Ego
    ctx.save();
    ctx.translate(engine.ego.x * scale, engine.ego.y * scale);
    ctx.rotate(engine.ego.heading);
    
    // Sensors (Radar/LiDAR/Camera ranges)
    // LiDAR (Green, 40m, 360deg)
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 0, 40 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Camera (Blue, 60m, 90deg)
    ctx.fillStyle = 'rgba(0, 100, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 60 * scale, -Math.PI/4, Math.PI/4);
    ctx.fill();

    // Radar (Yellow, 100m, 45deg)
    ctx.fillStyle = 'rgba(255, 200, 0, 0.05)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 100 * scale, -Math.PI/8, Math.PI/8);
    ctx.fill();

    ctx.fillStyle = '#0ea5e9'; // Tailwind sky-500
    ctx.fillRect(-engine.ego.length * scale / 2, -engine.ego.width * scale / 2, engine.ego.length * scale, engine.ego.width * scale);
    
    // Direction indicator
    ctx.fillStyle = 'white';
    ctx.fillRect(engine.ego.length * scale / 2 - 2, -2, 4, 4);
    ctx.restore();
  };

  const loop = () => {
    if (isRunning && engineRef.current) {
      engineRef.current.update();
      setMetrics({
        state: engineRef.current.state,
        velocity: engineRef.current.ego.velocity,
        minDist: engineRef.current.metrics.minDistance,
        latency: engineRef.current.metrics.latency,
        collisions: engineRef.current.metrics.collisionCount,
        avgSpeed: engineRef.current.metrics.averageSpeed,
        cam: engineRef.current.metrics.cameraObs,
        lidar: engineRef.current.metrics.lidarObs,
        radar: engineRef.current.metrics.radarObs,
        fused: engineRef.current.metrics.fusedTracks,
        smoothness: engineRef.current.metrics.pathSmoothness
      });
      
      if (engineRef.current.metrics.completed && !completionLogged.current) {
        completionLogged.current = true;
        setStats(prev => ({
          ...prev,
          [scenarioIdx]: {
            attempts: prev[scenarioIdx]?.attempts || 1,
            completions: (prev[scenarioIdx]?.completions || 0) + 1
          }
        }));
      }

      draw();
    }
    reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (isRunning) {
      reqRef.current = requestAnimationFrame(loop);
    } else {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isRunning]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-gray-100">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-sky-500" />
          <h1 className="text-xl font-bold">SIH AV Simulator</h1>
        </div>
        <div className="flex space-x-4">
          <select 
            value={scenarioIdx}
            onChange={e => setScenarioIdx(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
          >
            {SCENARIOS.map((s, i) => (
              <option key={s.id} value={i}>{s.name}</option>
            ))}
          </select>
          <button onClick={togglePlay} className="px-4 py-1 bg-sky-600 hover:bg-sky-500 rounded flex items-center space-x-1">
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          <button onClick={reset} className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded flex items-center space-x-1">
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 p-6 space-x-6">
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col relative">
          <div className="p-2 bg-gray-900 text-xs text-gray-400 absolute top-2 left-2 rounded z-10">
            {SCENARIOS[scenarioIdx].description}
          </div>
          <canvas 
            ref={canvasRef} 
            width={1200} 
            height={500} 
            className="w-full h-full object-contain bg-black"
          />
        </div>

        <div className="w-80 flex flex-col space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase">Telemetry</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Decision State</div>
                <div className={`text-xl font-bold ${metrics.state === 'EMERGENCY_STOP' ? 'text-red-500' : 'text-green-500'}`}>
                  {metrics.state}
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-gray-500">Speed</div>
                  <div className="text-lg">{(metrics.velocity * 3.6).toFixed(1)} km/h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Latency</div>
                  <div className="text-lg">{metrics.latency.toFixed(2)} ms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase">Perception</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-400">Camera:</span>
                <span>{metrics.cam} obj</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-400">LiDAR:</span>
                <span>{metrics.lidar} obj</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-gray-400">Radar:</span>
                <span>{metrics.radar} obj</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-gray-400 font-bold">Fused:</span>
                <span className="font-bold">{metrics.fused} obj</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase">Metrics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Min Obstacle Dist:</span>
                <span className={metrics.minDist < 3 ? 'text-red-400' : 'text-gray-100'}>
                  {metrics.minDist === Infinity ? '-' : metrics.minDist.toFixed(1) + ' m'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Collisions:</span>
                <span className={metrics.collisions > 0 ? 'text-red-400' : 'text-gray-100'}>{metrics.collisions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Speed:</span>
                <span className="text-gray-100">{(metrics.avgSpeed * 3.6).toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Path Smoothness:</span>
                <span className="text-gray-100">{metrics.smoothness.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                <span className="text-gray-400">Completion Rate:</span>
                <span className="text-sky-400 font-bold">
                  {stats[scenarioIdx]?.completions || 0} / {stats[scenarioIdx]?.attempts || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto bg-gray-800 p-4 rounded-lg border border-red-900/30">
             <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                <AlertTriangle size={18} />
                <h3 className="font-semibold text-sm">Explanation (Gemini Mock)</h3>
             </div>
             <p className="text-xs text-gray-400">
               {metrics.state === 'EMERGENCY_STOP' ? 
                'Critical collision risk detected ahead. Initiating emergency braking to avoid impact.' : 
                metrics.state === 'SLOW_DOWN' ? 
                'Obstacle entering safety margin. Reducing speed to maintain safe following distance.' :
                'Path is clear. Maintaining cruise speed along planned trajectory.'}
             </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow border border-sky-900 mt-4">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="text-sky-400">📊</span> Real Indian Data Reference
            </h2>
            <div className="text-[10px] text-yellow-400 font-bold mb-3 border border-yellow-600/50 p-2 rounded bg-yellow-900/20 leading-tight">
              REAL DATASET REFERENCE/VALIDATION <br/>
              <span className="text-gray-400 font-normal">versus</span> <br/>
              TEAM-CREATED SYNTHETIC CLOSED-LOOP SIMULATION
            </div>
            
            <div className="space-y-4">
              {datasets.map(ds => (
                <div key={ds.id} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sky-300 font-bold text-sm">{ds.name}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${ds.isLoaded ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {ds.isLoaded ? 'Sample Loaded' : 'Referenced Only'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 leading-snug">{ds.purpose}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="text-gray-400">Classes:</span> {ds.relevantClasses.join(', ')}
                  </div>
                  
                  <button 
                    onClick={() => setSelectedDataset(selectedDataset === ds.id ? null : ds.id)}
                    className="mt-2 text-xs bg-sky-900 hover:bg-sky-800 text-sky-100 px-2 py-1 rounded w-full text-center transition-colors"
                  >
                    {selectedDataset === ds.id ? 'Close Dataset Viewer' : 'Open Dataset Viewer'}
                  </button>

                  {selectedDataset === ds.id && (
                    <div className="mt-2 bg-black/50 p-2 rounded border border-gray-700">
                      {ds.isLoaded ? (
                        <div>
                          <img src={`/datasets/${ds.id}/sample_1.jpg`} alt={`${ds.name} Sample`} className="w-full h-auto rounded border border-gray-600 mb-2" />
                          <p className="text-[10px] text-gray-400">Local sample image loaded. Demonstrating authentic object dimensions and environmental characteristics.</p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 space-y-2">
                          <p className="text-yellow-400 font-semibold">⚠️ Manual Import Required</p>
                          <p>Due to licensing and registration requirements, this dataset cannot be downloaded automatically.</p>
                          <p>To view sample data here:</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Visit: <a href={ds.officialUrl} target="_blank" rel="noreferrer" className="text-sky-400 underline">{ds.officialUrl}</a></li>
                            <li>Register and download a sample image.</li>
                            <li>Place it at: <code className="bg-gray-800 px-1 rounded">public/datasets/{ds.id}/sample_1.jpg</code></li>
                            <li>Refresh the page.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow border border-indigo-900 mt-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-indigo-300">
              MathWorks Integration
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                <span>MATLAB Reference</span>
                <span className="px-2 py-0.5 bg-yellow-900/80 text-yellow-300 rounded text-[9px] uppercase font-bold">Reference Ready</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                <span>Simulink / Stateflow</span>
                <span className="px-2 py-0.5 bg-yellow-900/80 text-yellow-300 rounded text-[9px] uppercase font-bold">Reference Ready</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded border border-gray-700">
                <span>RoadRunner</span>
                <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded text-[9px] uppercase font-bold">Not Detected</span>
              </div>
              
              <div className="text-[10px] text-gray-400 mt-2 mb-2 p-1 text-center">
                Browser Simulator → Data Export → MATLAB
              </div>

              <button
                onClick={() => {
                  if (engineRef.current) exportMathWorksData(engineRef.current);
                }}
                className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-xs transition-colors mt-2"
              >
                Export MathWorks Simulation Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
