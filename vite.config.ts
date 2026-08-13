import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Relative base so the build works from any GitHub Pages project path
// (https://<user>.github.io/<repo>/) without hardcoding a repo name.
// Override with VITE_BASE if you deploy somewhere else (e.g. a custom domain -> '/').
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react()],
})
