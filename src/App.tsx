import { useEffect, useState } from 'react';
import { HighwayScene } from './components/HighwayScene';
import { MusicPlayer } from './components/MusicPlayer';
import { Playlist } from './components/Playlist';
import { LoadingScreen } from './components/LoadingScreen';
import { ListenerCount } from './components/ListenerCount';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { usePresence } from './hooks/usePresence';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const player = useAudioPlayer();
  const presence = usePresence(player.track.id);

  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 1100);
    return () => window.clearTimeout(t);
  }, []);

  const handleToggle = () => {
    setHasInteracted(true);
    player.toggle();
  };

  return (
    <div className="app-root">
      <LoadingScreen visible={booting} />

      <HighwayScene />

      <div className="hud-top">
        <span className="hud-brand">HIGHWAY FM</span>
        <ListenerCount {...presence} />
        <span />
      </div>

      <MusicPlayer
        player={{ ...player, toggle: handleToggle }}
        onOpenPlaylist={() => setPlaylistOpen(true)}
        needsTapToStart={!hasInteracted}
      />

      <Playlist
        open={playlistOpen}
        onClose={() => setPlaylistOpen(false)}
        currentTrackId={player.track.id}
        onSelect={(id) => {
          player.selectTrackById(id);
          setHasInteracted(true);
          setPlaylistOpen(false);
        }}
      />
    </div>
  );
}
