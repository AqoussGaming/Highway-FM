import type { Track } from '../data/playlist';

export type PlaybackSource = 'youtube' | 'file' | 'demo';

export type EngineEvents = {
  onTime: (currentTime: number, duration: number) => void;
  onEnded: () => void;
  onError: (message: string) => void;
  onReady: () => void;
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prevCb = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCb?.();
      resolve();
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

/**
 * AudioEngine is the single real playback backend behind the player.
 * It picks a source per-track, in order of preference:
 *   1. youtubeId  -> official YouTube IFrame Player API
 *   2. audioSrc   -> a normal <audio> element (locally hosted / licensed file)
 *   3. otherwise  -> an honest Web Audio "radio tone" placeholder, clearly
 *      surfaced in the UI as DEMO AUDIO until a real source is configured.
 * It never fakes progress: currentTime/duration always come from the
 * backend actually producing sound.
 */
export class AudioEngine {
  private events: EngineEvents;
  private mode: PlaybackSource = 'demo';
  private audioEl: HTMLAudioElement | null = null;
  private ytPlayer: any = null;
  private ytContainer: HTMLDivElement | null = null;

  // Web Audio demo backend
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private demoStartCtxTime = 0;
  private demoElapsedAtStart = 0;
  private demoDuration = 275;
  private demoPlaying = false;
  private rafId: number | null = null;
  private volume = 0.7;
  private muted = false;

  constructor(events: EngineEvents) {
    this.events = events;
  }

  getMode() {
    return this.mode;
  }

  getAnalyser() {
    return this.analyser;
  }

  private ensureCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
    }
    return this.ctx;
  }

  private teardownCurrent() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
      this.audioEl = null;
    }
    if (this.ytPlayer) {
      try {
        this.ytPlayer.stopVideo();
      } catch {
        /* player may already be gone */
      }
    }
    if (this.osc) {
      try {
        this.osc.stop();
      } catch {}
      this.osc.disconnect();
      this.osc = null;
    }
    if (this.osc2) {
      try {
        this.osc2.stop();
      } catch {}
      this.osc2.disconnect();
      this.osc2 = null;
    }
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
    this.demoPlaying = false;
  }

  async load(track: Track, seekToSeconds = 0) {
    this.teardownCurrent();

    if (track.youtubeId) {
      this.mode = 'youtube';
      await this.loadYouTube(track.youtubeId, seekToSeconds);
      return;
    }
    if (track.audioSrc) {
      this.mode = 'file';
      this.loadFile(track.audioSrc, seekToSeconds);
      return;
    }
    this.mode = 'demo';
    this.loadDemo(track.duration, seekToSeconds);
  }

  private loadFile(src: string, seekTo: number) {
    const el = new Audio(src);
    el.preload = 'auto';
    el.volume = this.muted ? 0 : this.volume;
    el.currentTime = seekTo;
    el.addEventListener('loadedmetadata', () => this.events.onReady());
    el.addEventListener('ended', () => this.events.onEnded());
    el.addEventListener('error', () => this.events.onError('RADIO SIGNAL LOST'));
    el.addEventListener('timeupdate', () => {
      this.events.onTime(el.currentTime, el.duration || 0);
    });
    this.audioEl = el;
  }

  private async loadYouTube(videoId: string, seekTo: number) {
    try {
      await loadYouTubeApi();
      if (!this.ytContainer) {
        this.ytContainer = document.createElement('div');
        this.ytContainer.style.position = 'fixed';
        this.ytContainer.style.width = '1px';
        this.ytContainer.style.height = '1px';
        this.ytContainer.style.opacity = '0';
        this.ytContainer.style.pointerEvents = 'none';
        document.body.appendChild(this.ytContainer);
      }
      const mount = document.createElement('div');
      this.ytContainer.appendChild(mount);
      this.ytPlayer = new window.YT!.Player(mount, {
        videoId,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            this.ytPlayer.seekTo(seekTo, true);
            this.ytPlayer.setVolume(this.muted ? 0 : Math.round(this.volume * 100));
            this.events.onReady();
            this.pollYouTube();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT!.PlayerState.ENDED) this.events.onEnded();
          },
          onError: () => this.events.onError('RADIO SIGNAL LOST'),
        },
      });
    } catch {
      this.events.onError('RADIO SIGNAL LOST');
    }
  }

  private pollYouTube = () => {
    if (this.mode !== 'youtube' || !this.ytPlayer) return;
    try {
      const cur = this.ytPlayer.getCurrentTime?.() ?? 0;
      const dur = this.ytPlayer.getDuration?.() ?? 0;
      this.events.onTime(cur, dur);
    } catch {
      /* player not ready yet */
    }
    this.rafId = requestAnimationFrame(this.pollYouTube);
  };

  private loadDemo(duration: number, seekTo: number) {
    const ctx = this.ensureCtx();
    this.demoDuration = duration;
    this.demoElapsedAtStart = seekTo;
    this.gain = ctx.createGain();
    this.gain.gain.value = this.muted ? 0 : this.volume * 0.12; // gentle — this is a placeholder tone, not a song
    this.gain.connect(this.analyser!);
    this.analyser!.connect(ctx.destination);

    this.osc = ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.value = 220;
    this.osc2 = ctx.createOscillator();
    this.osc2.type = 'triangle';
    this.osc2.frequency.value = 277.18; // major third above, warm "radio hum" pad
    this.osc.connect(this.gain);
    this.osc2.connect(this.gain);

    this.events.onReady();
    this.events.onTime(seekTo, duration);
  }

  play() {
    if (this.mode === 'file' && this.audioEl) {
      this.audioEl.play().catch(() => this.events.onError('Tap PLAY to start the journey.'));
      return;
    }
    if (this.mode === 'youtube' && this.ytPlayer) {
      this.ytPlayer.playVideo();
      return;
    }
    if (this.mode === 'demo') {
      const ctx = this.ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (!this.demoPlaying && this.osc && this.osc2) {
        this.demoStartCtxTime = ctx.currentTime;
        try {
          this.osc.start();
          this.osc2.start();
        } catch {
          /* already started */
        }
        this.demoPlaying = true;
        this.tickDemo();
      }
    }
  }

  pause() {
    if (this.mode === 'file' && this.audioEl) this.audioEl.pause();
    if (this.mode === 'youtube' && this.ytPlayer) this.ytPlayer.pauseVideo();
    if (this.mode === 'demo') {
      if (this.ctx) {
        this.demoElapsedAtStart += this.ctx.currentTime - this.demoStartCtxTime;
      }
      this.demoPlaying = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    }
  }

  private tickDemo = () => {
    if (!this.demoPlaying || !this.ctx) return;
    const elapsed = this.demoElapsedAtStart + (this.ctx.currentTime - this.demoStartCtxTime);
    if (elapsed >= this.demoDuration) {
      this.demoPlaying = false;
      this.events.onEnded();
      return;
    }
    this.events.onTime(elapsed, this.demoDuration);
    this.rafId = requestAnimationFrame(this.tickDemo);
  };

  seek(seconds: number) {
    if (this.mode === 'file' && this.audioEl) this.audioEl.currentTime = seconds;
    if (this.mode === 'youtube' && this.ytPlayer) this.ytPlayer.seekTo(seconds, true);
    if (this.mode === 'demo' && this.ctx) {
      this.demoElapsedAtStart = seconds;
      this.demoStartCtxTime = this.ctx.currentTime;
      this.events.onTime(seconds, this.demoDuration);
    }
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.audioEl) this.audioEl.volume = this.muted ? 0 : v;
    if (this.ytPlayer?.setVolume) this.ytPlayer.setVolume(this.muted ? 0 : Math.round(v * 100));
    if (this.gain) this.gain.gain.value = this.muted ? 0 : v * 0.12;
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.setVolume(this.volume);
  }

  destroy() {
    this.teardownCurrent();
    this.ytContainer?.remove();
    this.ytContainer = null;
  }
}
