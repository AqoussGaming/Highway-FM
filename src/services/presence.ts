// HIGHWAY FM live-listener presence
//
// This is wired for Supabase Realtime Presence. It does NOT fabricate a
// listener count. Until real credentials are supplied, `isConfigured()`
// returns false and the UI shows "Connecting..." then a clear
// "not configured" state, per the product spec.
//
// To go live:
//   1. Create a Supabase project.
//   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file.
//   3. npm install @supabase/supabase-js
//   4. Replace the stub below with a real client (see the commented
//      reference implementation at the bottom of this file).

export type PresenceStatus = 'connecting' | 'live' | 'unconfigured' | 'error';

export interface PresenceState {
  status: PresenceStatus;
  totalListeners: number | null;
  currentTrackListeners: number | null;
}

type Listener = (state: PresenceState) => void;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function isConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Minimal presence manager. In the unconfigured state (no backend
 * credentials) it reports honestly instead of inventing a number. Once
 * Supabase credentials are present, swap in the real client from the
 * reference implementation below and this same interface keeps working —
 * no changes needed in the components that consume it.
 */
export class PresenceManager {
  private listeners = new Set<Listener>();
  private state: PresenceState = {
    status: 'connecting',
    totalListeners: null,
    currentTrackListeners: null,
  };
  private sessionId = crypto.randomUUID();
  private heartbeatTimer: number | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.state));
  }

  start(trackId: string) {
    if (!isConfigured()) {
      // Honest fallback: briefly show "connecting", then report that no
      // real-time backend is configured. Never invent a listener count.
      window.setTimeout(() => {
        this.state = { status: 'unconfigured', totalListeners: null, currentTrackListeners: null };
        this.emit();
      }, 900);
      return;
    }
    // Real backend path — see reference implementation below for the
    // Supabase Presence wiring this would call.
    void trackId;
  }

  updateTrack(_trackId: string) {
    // No-op until a real backend is configured; kept for API stability.
  }

  stop() {
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
  }

  getSessionId() {
    return this.sessionId;
  }
}

/*
REFERENCE IMPLEMENTATION (Supabase Realtime Presence)
-------------------------------------------------------
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

start(trackId: string) {
  const channel = supabase.channel('highway-fm-room', {
    config: { presence: { key: this.sessionId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const all = Object.values(presenceState).flat() as { trackId: string }[];
      this.state = {
        status: 'live',
        totalListeners: all.length,
        currentTrackListeners: all.filter((p) => p.trackId === trackId).length,
      };
      this.emit();
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ trackId, joinedAt: Date.now() });
        this.heartbeatTimer = window.setInterval(() => {
          channel.track({ trackId, joinedAt: Date.now() });
        }, 20000);
      }
    });

  this.channel = channel;
}
-------------------------------------------------------
*/
