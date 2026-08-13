import type { PresenceState } from '../services/presence';

/** Small live-listener badge, kept outside the glass player. Never fabricates a number. */
export function ListenerCount({ status, totalListeners }: PresenceState) {
  return (
    <div className="listener-count" role="status">
      <span className={`live-dot ${status === 'live' ? 'on' : ''}`} aria-hidden="true" />
      {status === 'live' && totalListeners !== null ? <span>{totalListeners} listening</span> : <span>Connecting&hellip;</span>}
    </div>
  );
}
