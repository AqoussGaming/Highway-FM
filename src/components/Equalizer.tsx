interface Props {
  isPlaying: boolean;
}

/** Tiny animated bar equalizer next to the song info. */
export function Equalizer({ isPlaying }: Props) {
  return (
    <div className={`eq ${isPlaying ? 'active' : ''}`} aria-hidden="true">
      <span style={{ animationDelay: '0s' }} />
      <span style={{ animationDelay: '0.15s' }} />
      <span style={{ animationDelay: '0.05s' }} />
      <span style={{ animationDelay: '0.2s' }} />
      <span style={{ animationDelay: '0.1s' }} />
    </div>
  );
}
