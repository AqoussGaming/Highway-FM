import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LIBRARY } from '../data/playlist';
import { AudioEngine, type PlaybackSource } from '../services/audio';

export type RepeatMode = 'off' | 'playlist' | 'track';

const LS_KEYS = {
  volume: 'hwfm.volume',
  muted: 'hwfm.muted',
  trackId: 'hwfm.trackId',
  shuffle: 'hwfm.shuffle',
  repeat: 'hwfm.repeat',
};

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — preferences just won't persist */
  }
}

function buildShuffleOrder(currentIndex: number, length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== currentIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIndex, ...indices];
}

export function useAudioPlayer() {
  const initialTrackId = readLS<string | null>(LS_KEYS.trackId, null);
  const initialIndex = Math.max(
    0,
    LIBRARY.findIndex((t) => t.id === initialTrackId)
  );

  const [trackIndex, setTrackIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(LIBRARY[initialIndex]?.duration ?? 0);
  const [volume, setVolumeState] = useState(readLS(LS_KEYS.volume, 0.7));
  const [muted, setMutedState] = useState(readLS(LS_KEYS.muted, false));
  const [shuffle, setShuffleState] = useState(readLS(LS_KEYS.shuffle, true));
  const [repeat, setRepeatState] = useState<RepeatMode>(readLS(LS_KEYS.repeat, 'off'));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState<PlaybackSource>('demo');

  const engineRef = useRef<AudioEngine | null>(null);
  const shuffleOrderRef = useRef<number[]>(buildShuffleOrder(initialIndex, LIBRARY.length));
  const shufflePosRef = useRef(0);

  const track = LIBRARY[trackIndex];

  useEffect(() => {
    const engine = new AudioEngine({
      onTime: (cur, dur) => {
        setCurrentTime(cur);
        if (dur > 0) setDuration(dur);
      },
      onEnded: () => handleNext(),
      onError: (msg) => setErrorMessage(msg),
      onReady: () => {
        setReady(true);
        setSource(engine.getMode());
      },
    });
    engineRef.current = engine;
    engine.load(track, 0);
    engine.setVolume(muted ? 0 : volume);
    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTrack = useCallback(
    async (index: number, autoplay: boolean) => {
      const engine = engineRef.current;
      if (!engine) return;
      setReady(false);
      setErrorMessage(null);
      setCurrentTime(0);
      const t = LIBRARY[index];
      setDuration(t.duration);
      await engine.load(t, 0);
      engine.setVolume(muted ? 0 : volume);
      if (autoplay) engine.play();
      setIsPlaying(autoplay);
      writeLS(LS_KEYS.trackId, t.id);
    },
    [muted, volume]
  );

  const play = useCallback(() => {
    engineRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const selectTrack = useCallback(
    (index: number) => {
      setTrackIndex(index);
      shuffleOrderRef.current = buildShuffleOrder(index, LIBRARY.length);
      shufflePosRef.current = 0;
      loadTrack(index, true);
    },
    [loadTrack]
  );

  const selectTrackById = useCallback(
    (id: string) => {
      const index = LIBRARY.findIndex((t) => t.id === id);
      if (index >= 0) selectTrack(index);
    },
    [selectTrack]
  );

  const handleNext = useCallback(() => {
    let nextIndex: number;
    if (shuffle) {
      shufflePosRef.current += 1;
      if (shufflePosRef.current >= shuffleOrderRef.current.length) {
        shuffleOrderRef.current = buildShuffleOrder(trackIndex, LIBRARY.length);
        shufflePosRef.current = 0;
      }
      nextIndex = shuffleOrderRef.current[shufflePosRef.current];
    } else {
      nextIndex = (trackIndex + 1) % LIBRARY.length;
    }
    if (repeat === 'track') {
      loadTrack(trackIndex, true);
      return;
    }
    setTrackIndex(nextIndex);
    loadTrack(nextIndex, true);
  }, [shuffle, repeat, trackIndex, loadTrack]);

  const handlePrevious = useCallback(() => {
    if (currentTime > 5) {
      engineRef.current?.seek(0);
      setCurrentTime(0);
      return;
    }
    const prevIndex = shuffle
      ? shuffleOrderRef.current[Math.max(0, shufflePosRef.current - 1)]
      : (trackIndex - 1 + LIBRARY.length) % LIBRARY.length;
    if (shuffle) shufflePosRef.current = Math.max(0, shufflePosRef.current - 1);
    setTrackIndex(prevIndex);
    loadTrack(prevIndex, true);
  }, [currentTime, shuffle, trackIndex, loadTrack]);

  const restart = useCallback(() => {
    engineRef.current?.seek(0);
    setCurrentTime(0);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    engineRef.current?.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const seekByRatio = useCallback(
    (ratio: number) => {
      seekTo(ratio * duration);
    },
    [duration, seekTo]
  );

  const nudge = useCallback(
    (deltaSeconds: number) => {
      const next = Math.min(Math.max(0, currentTime + deltaSeconds), duration || 0);
      seekTo(next);
    },
    [currentTime, duration, seekTo]
  );

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    writeLS(LS_KEYS.volume, clamped);
    engineRef.current?.setVolume(clamped);
    if (clamped > 0 && muted) {
      setMutedState(false);
      writeLS(LS_KEYS.muted, false);
      engineRef.current?.setMuted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      writeLS(LS_KEYS.muted, next);
      engineRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleState((prev) => {
      const next = !prev;
      writeLS(LS_KEYS.shuffle, next);
      if (next) {
        shuffleOrderRef.current = buildShuffleOrder(trackIndex, LIBRARY.length);
        shufflePosRef.current = 0;
      }
      return next;
    });
  }, [trackIndex]);

  const cycleRepeat = useCallback(() => {
    setRepeatState((prev) => {
      const order: RepeatMode[] = ['off', 'playlist', 'track'];
      const next = order[(order.indexOf(prev) + 1) % order.length];
      writeLS(LS_KEYS.repeat, next);
      return next;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          nudge(-5);
          break;
        case 'ArrowRight':
          nudge(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 0.05);
          break;
        case 'KeyN':
          handleNext();
          break;
        case 'KeyP':
          handlePrevious();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyS':
          toggleShuffle();
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle, nudge, setVolume, volume, handleNext, handlePrevious, toggleMute, toggleShuffle]);

  // Browser Media Session — lock-screen / hardware-key metadata + controls.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'Highway FM',
    });
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    navigator.mediaSession.setActionHandler('previoustrack', handlePrevious);
  }, [track, play, pause, handleNext, handlePrevious]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  const getAnalyser = useCallback(() => engineRef.current?.getAnalyser() ?? null, []);

  return useMemo(
    () => ({
      track,
      trackIndex,
      isPlaying,
      currentTime,
      duration,
      progressRatio,
      volume,
      muted,
      shuffle,
      repeat,
      errorMessage,
      ready,
      source,
      play,
      pause,
      toggle,
      selectTrack,
      selectTrackById,
      next: handleNext,
      previous: handlePrevious,
      restart,
      seekByRatio,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      getAnalyser,
    }),
    [
      track,
      trackIndex,
      isPlaying,
      currentTime,
      duration,
      progressRatio,
      volume,
      muted,
      shuffle,
      repeat,
      errorMessage,
      ready,
      source,
      play,
      pause,
      toggle,
      selectTrack,
      selectTrackById,
      handleNext,
      handlePrevious,
      restart,
      seekByRatio,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      getAnalyser,
    ]
  );
}

export type AudioPlayerState = ReturnType<typeof useAudioPlayer>;
