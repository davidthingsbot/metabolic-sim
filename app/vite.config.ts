import { defineConfig } from 'vite';

// Local dev serves at `/`; GitHub Pages serves the project at `/metabolic-sim/`.
// The GITHUB_ACTIONS env var is true only when running inside the deploy workflow.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/metabolic-sim/' : '/',
  server: {
    allowedHosts: ['dw-x1pro-linux'],
  },
});
