import { Volume1, Volume2, VolumeX } from 'lucide-react';

interface Props {
  volume: number;
  muted: boolean;
  onChange: (v: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({ volume, muted, onChange, onToggleMute }: Props) {
  const effectiveVolume = muted ? 0 : volume;
  const Icon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="volume-control">
      <button
        className="icon-btn small"
        onClick={onToggleMute}
        aria-label={muted ? 'Unmute' : 'Mute'}
        aria-pressed={muted}
      >
        <Icon size={16} />
      </button>
      <input
        type="range"
        className="volume-slider"
        min={0}
        max={1}
        step={0.01}
        value={effectiveVolume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Volume"
      />
    </div>
  );
}
