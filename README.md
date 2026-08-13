# Highway FM

A nostalgic Indian highway music experience — an illustrated roadside dhaba
scene with a floating glass radio player, built with React, TypeScript, and
Vite.

## What's here

- A circular, slowly-rotating album disc and glass-panel player floating
  over the artwork (`src/components/MusicPlayer.tsx`, `AlbumDisc.tsx`)
- Full playback controls: play/pause, next/previous, restart, shuffle,
  repeat (off/all/one), draggable seek, volume/mute — all working, with
  keyboard shortcuts and `localStorage` persistence
- Browser Media Session integration (lock-screen metadata & controls)
- An honest live-listener indicator wired for Supabase Realtime Presence
  (`src/services/presence.ts`) — it never fabricates a number
- A 55-track playlist with category filters (`src/data/playlist.ts`)
- A GitHub Actions workflow that builds and deploys to GitHub Pages on
  every push to `main`

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview   # serve the built dist/ locally to sanity-check it
```

## Deploying to GitHub Pages

This repo ships with `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages automatically on every push to
`main`. To turn it on:

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).

`vite.config.ts` uses a **relative base path** (`base: './'`), so the
build works at `https://<user>.github.io/<repo>/` without you needing to
hardcode the repository name. If you deploy to a custom domain or the
root of a user/org Pages site instead, set the `VITE_BASE` environment
variable (in the workflow or a local `.env`) to `/`.

## Audio source configuration

No YouTube video IDs or hosted audio files are wired up yet. Until you add
one, each track falls back to an honest Web Audio "demo tone" — you'll see
a small amber dot next to the song title while a track is playing this
way. To make a track actually play the real recording, open
`src/data/playlist.ts` and set either:

- `youtubeId` — a YouTube video ID, played via the official YouTube
  IFrame Player API (audio-only, hidden player), or
- `audioSrc` — a path to a licensed/hosted audio file, e.g.
  `/music/song.mp3` (drop the file in `public/music/`)

Do not download or redistribute copyrighted audio from unofficial
sources — only use audio you have the rights to.

## Live listener count (Supabase setup)

The presence system is wired for [Supabase Realtime
Presence](https://supabase.com/docs/guides/realtime/presence) but ships
unconfigured — the UI shows "Connecting…" instead of a fake number until
you add real credentials.

1. Create a free Supabase project.
2. Copy `.env.example` to `.env` and fill in your project's URL and
   **anon** key (Project Settings → API):

   ```bash
   cp .env.example .env
   ```

3. `npm install @supabase/supabase-js`
4. Replace the stub logic in `src/services/presence.ts` with the
   reference implementation commented at the bottom of that file — it's a
   complete, working example of the presence channel wiring.
5. For GitHub Pages, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   as **repository secrets** (Settings → Secrets and variables → Actions)
   rather than committing `.env`. The included workflow already passes
   them through to the build step.

The Supabase anon key is a public, client-safe key by design (access is
governed by Row Level Security policies on the Supabase side) — but never
put a service-role key or any other private credential in this frontend.

## Playlist configuration

Tracks live in `src/data/playlist.ts` as plain objects:

```ts
{
  id, title, artist, album, year,
  youtubeId,   // string | null
  audioSrc,    // string | null
  duration,    // seconds, used until a real source reports one
  artworkHue,  // used for the generated cassette-art placeholder
  categories,  // e.g. ['ALL', '90S', 'ROMANTIC']
}
```

Add, remove, or re-tag tracks freely — the playlist panel's category
filters and shuffle/repeat logic all read from this array.

## Project structure

```text
highway-fm/
├── public/
│   ├── favicon.svg
│   └── artwork/highway-bg.jpg   # the Highway FM background illustration
├── src/
│   ├── components/
│   ├── data/playlist.ts
│   ├── hooks/useAudioPlayer.ts
│   ├── hooks/usePresence.ts
│   ├── services/audio.ts
│   ├── services/presence.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .github/workflows/deploy.yml
├── .env.example
├── vite.config.ts
└── package.json
```
