import { ListMusic } from 'lucide-react';
import type { AudioPlayerState } from '../hooks/useAudioPlayer';
import { AlbumDisc } from './AlbumDisc';
import { Equalizer } from './Equalizer';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';

interface Props {
  player: AudioPlayerState;
  onOpenPlaylist: () => void;
  needsTapToStart: boolean;
}

export function MusicPlayer({ player, onOpenPlaylist, needsTapToStart }: Props) {
  const isLoading = !player.ready && !player.errorMessage;

  return (
    <section className="music-player" aria-label="Highway FM player">
      <div className="player-main-row">
        <AlbumDisc
          hue={player.track.artworkHue}
          isPlaying={player.isPlaying}
          isLoading={isLoading}
          hasError={Boolean(player.errorMessage)}
        />

        <div className="player-center">
          <div className="track-line">
            <h2 className="track-title" key={player.track.id}>
              {player.track.title}
              {player.source === 'demo' && <span className="demo-dot" title="Demo tone — real audio source not yet configured" />}
            </h2>
            <Equalizer isPlaying={player.isPlaying} />
          </div>
          <p className="track-meta">{player.track.artist}</p>

          <ProgressBar
            ratio={player.progressRatio}
            currentTime={player.currentTime}
            duration={player.duration}
            onSeekRatio={player.seekByRatio}
          />

          {needsTapToStart && !player.isPlaying && !player.errorMessage && (
            <p className="tap-hint">TAP TO TUNE IN</p>
          )}
          {player.errorMessage && <p className="error-hint">{player.errorMessage}</p>}
        </div>
      </div>

      <div className="player-bottom-row">
        <PlayerControls
          isPlaying={player.isPlaying}
          shuffle={player.shuffle}
          repeat={player.repeat}
          onToggle={player.toggle}
          onNext={player.next}
          onPrevious={player.previous}
          onRestart={player.restart}
          onToggleShuffle={player.toggleShuffle}
          onCycleRepeat={player.cycleRepeat}
        />
        <div className="player-bottom-right">
          <VolumeControl volume={player.volume} muted={player.muted} onChange={player.setVolume} onToggleMute={player.toggleMute} />
          <button className="icon-btn small playlist-btn" onClick={onOpenPlaylist} aria-label="Open playlist" title="Playlist">
            <ListMusic size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
