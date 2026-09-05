import { SensorObservation, TrackedObject } from '../types';

export class SensorFusion {
  private previousTracks: TrackedObject[] = [];

  fuse(observations: SensorObservation[]): TrackedObject[] {
    const tracks: TrackedObject[] = [];
    const associationThreshold = 3.0; // meters distance to associate observations to the same track
    
    let trackIdCounter = 0;

    for (const obs of observations) {
      // Try to associate with an existing track
      let matchedTrack = null;
      for (const track of tracks) {
        const dist = Math.hypot(track.x - obs.x, track.y - obs.y);
        if (dist < associationThreshold) {
          matchedTrack = track;
          break;
        }
      }

      if (matchedTrack) {
        // Fuse new observation into matched track
        matchedTrack.sensorSources.push(obs.sensorType);
        
        // Update position (LiDAR is most trusted for position)
        if (obs.sensorType === 'lidar' || (obs.sensorType === 'camera' && !matchedTrack.sensorSources.includes('lidar'))) {
          matchedTrack.x = obs.x;
          matchedTrack.y = obs.y;
        }
        
        // Update velocity (Radar is most trusted for velocity)
        if (obs.sensorType === 'radar') {
          matchedTrack.velocity = obs.velocity || 0;
          matchedTrack.heading = obs.heading || 0;
        }
        
        // Update class (Camera is most trusted for class)
        if (obs.sensorType === 'camera' && obs.type) {
          matchedTrack.type = obs.type;
        }
        
        if (obs.width) matchedTrack.width = obs.width;
        if (obs.length) matchedTrack.length = obs.length;
        
        // Increase confidence if multiple sensors agree
        matchedTrack.confidence = Math.min(1.0, matchedTrack.confidence + obs.confidence * 0.2);
        
        const isErratic = matchedTrack.type === 'cattle' || matchedTrack.type === 'pedestrian';
        matchedTrack.uncertaintyRadius = isErratic ? 1.0 : 0.2;
        
      } else {
        const isErratic = obs.type === 'cattle' || obs.type === 'pedestrian';
        // Create new track
        tracks.push({
          id: `track_${trackIdCounter++}`,
          x: obs.x,
          y: obs.y,
          velocity: obs.velocity || 0, // Fallback if no radar
          heading: obs.heading || 0, // Fallback if no radar
          width: obs.width || 1, // Fallback dimension
          length: obs.length || 1,
          type: obs.type || 'unknown',
          confidence: obs.confidence,
          sensorSources: [obs.sensorType],
          uncertaintyRadius: isErratic ? 1.0 : 0.2
        });
      }
    }
    
    // Apply Temporal Smoothing for Visualization
    const alpha = 0.15; // Smooth heavily for visualization
    for (const track of tracks) {
      // Find matching track from previous frame
      let prevMatch = null;
      let minDist = Infinity;
      for (const prev of this.previousTracks) {
        const d = Math.hypot(prev.x - track.x, prev.y - track.y);
        // Use a larger threshold between frames to account for motion
        if (d < associationThreshold * 1.5 && d < minDist) {
          prevMatch = prev;
          minDist = d;
        }
      }

      if (prevMatch) {
        const prevVX = prevMatch.visualX ?? prevMatch.x;
        const prevVY = prevMatch.visualY ?? prevMatch.y;
        track.visualX = alpha * track.x + (1 - alpha) * prevVX;
        track.visualY = alpha * track.y + (1 - alpha) * prevVY;
        
        // Maintain consistent ID if matched across frames for stability
        track.id = prevMatch.id;
      } else {
        track.visualX = track.x;
        track.visualY = track.y;
      }
    }

    this.previousTracks = tracks;
    
    // Filter out low confidence tracks if needed, but for now return all
    return tracks;
  }
}
