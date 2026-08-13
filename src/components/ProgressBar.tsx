import { useCallback, useRef, useState } from 'react';

interface Props {
  ratio: number;
  currentTime: number;
  duration: number;
  onSeekRatio: (ratio: number) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ProgressBar({ ratio, currentTime, duration, onSeekRatio }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewRatio, setPreviewRatio] = useState<number | null>(null);

  const ratioFromEvent = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const commit = useCallback(
    (clientX: number) => {
      const r = ratioFromEvent(clientX);
      onSeekRatio(r);
      return r;
    },
    [ratioFromEvent, onSeekRatio]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setPreviewRatio(commit(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setPreviewRatio(ratioFromEvent(e.clientX));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    commit(e.clientX);
    setDragging(false);
    setPreviewRatio(null);
  };

  const displayRatio = previewRatio ?? ratio;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') onSeekRatio(Math.min(1, ratio + 0.02));
    if (e.key === 'ArrowLeft') onSeekRatio(Math.max(0, ratio - 0.02));
  };

  return (
    <div className="progress-row">
      <span className="progress-time" aria-hidden="true">
        {formatTime(previewRatio !== null ? previewRatio * duration : currentTime)}
      </span>
      <div
        className="progress-track"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayRatio * 100)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <div className="progress-fill" style={{ width: `${displayRatio * 100}%` }} />
        <div className="progress-thumb" style={{ left: `${displayRatio * 100}%` }} />
      </div>
      <span className="progress-time" aria-hidden="true">
        -{formatTime(Math.max(0, duration - (previewRatio !== null ? previewRatio * duration : currentTime)))}
      </span>
    </div>
  );
}
