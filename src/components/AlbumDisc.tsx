interface Props {
  hue: number;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  size?: number;
}

/** Circular, slowly-rotating album disc — the player's visual anchor. */
export function AlbumDisc({ hue, isPlaying, isLoading, hasError, size = 64 }: Props) {
  return (
    <div className="disc-wrap" style={{ width: size, height: size }}>
      <div
        className={`disc ${isPlaying ? 'spinning' : ''} ${isPlaying ? 'glowing' : ''}`}
        style={{
          background: `radial-gradient(circle at 35% 30%, hsl(${(hue + 30) % 360} 55% 32%), hsl(${hue} 45% 14%) 75%)`,
        }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%">
          <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(244,232,212,0.18)" strokeWidth="1" />
          <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(244,232,212,0.14)" strokeWidth="0.75" />
          <circle cx="32" cy="32" r="14" fill="none" stroke="rgba(244,232,212,0.16)" strokeWidth="0.75" />
          <circle cx="32" cy="32" r="5" fill="rgba(20,16,12,0.85)" stroke="rgba(244,232,212,0.4)" strokeWidth="1" />
          <circle cx="32" cy="32" r="1.6" fill="rgba(244,232,212,0.7)" />
        </svg>
      </div>
      {isLoading && (
        <svg className="disc-ring" viewBox="0 0 68 68" aria-hidden="true">
          <circle cx="34" cy="34" r="31" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeDasharray="40 145" />
        </svg>
      )}
      {hasError && <span className="disc-error-dot" aria-hidden="true" />}
    </div>
  );
}
