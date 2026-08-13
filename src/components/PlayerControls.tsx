import { Pause, Play, Repeat, Repeat1, RotateCcw, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import type { RepeatMode } from '../hooks/useAudioPlayer';

interface Props {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRestart: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
}

export function PlayerControls({
  isPlaying,
  shuffle,
  repeat,
  onToggle,
  onNext,
  onPrevious,
  onRestart,
  onToggleShuffle,
  onCycleRepeat,
}: Props) {
  const RepeatIcon = repeat === 'track' ? Repeat1 : Repeat;

  return (
    <div className="player-controls">
      <button className={`icon-btn small ${shuffle ? 'active' : ''}`} onClick={onToggleShuffle} aria-pressed={shuffle} aria-label="Shuffle" title="Shuffle (S)">
        <Shuffle size={14} />
      </button>
      <button className="icon-btn" onClick={onPrevious} aria-label="Previous track" title="Previous (P)">
        <SkipBack size={16} />
      </button>
      <button className="icon-btn small" onClick={onRestart} aria-label="Restart track" title="Restart">
        <RotateCcw size={14} />
      </button>
      <button className="icon-btn play-btn" onClick={onToggle} aria-label={isPlaying ? 'Pause' : 'Play'} title="Play/Pause (Space)">
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button className="icon-btn" onClick={onNext} aria-label="Next track" title="Next (N)">
        <SkipForward size={16} />
      </button>
      <button className={`icon-btn small ${repeat !== 'off' ? 'active' : ''}`} onClick={onCycleRepeat} aria-label={`Repeat: ${repeat}`} title={`Repeat: ${repeat}`}>
        <RepeatIcon size={14} />
      </button>
    </div>
  );
}
