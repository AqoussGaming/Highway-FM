import { useEffect, useRef, useState } from 'react';
import { PresenceManager, type PresenceState } from '../services/presence';

export function usePresence(trackId: string) {
  const managerRef = useRef<PresenceManager | null>(null);
  const [state, setState] = useState<PresenceState>({
    status: 'connecting',
    totalListeners: null,
    currentTrackListeners: null,
  });

  useEffect(() => {
    const manager = new PresenceManager();
    managerRef.current = manager;
    const unsubscribe = manager.subscribe(setState);
    manager.start(trackId);
    return () => {
      unsubscribe();
      manager.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    managerRef.current?.updateTrack(trackId);
  }, [trackId]);

  return state;
}
