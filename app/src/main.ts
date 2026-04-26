// Phase 0 base page. The simulator itself begins in Phase 1.

import heroImageUrl from './assets/controls2-hero.png';

const STORAGE_KEY = 'metabolic-sim:theme';

type Theme = 'light' | 'dark';

function preferredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header>
      <h1>Metabolic Simulator</h1>
      <button class="theme-toggle" id="theme-toggle" type="button">Toggle theme</button>
    </header>

    <p class="lede">
      A browser-based simulator that shows, in plain language, what food does once you've eaten it. Drop a hamburger onto a timeline, hit play, and watch — across the bloodstream, the liver, the muscles, the fat tissue, and the brain — what happens over the next twelve hours. <em>Or watch ten years of one lifestyle play out in minutes.</em>
    </p>

    <figure class="hero">
      <img src="${heroImageUrl}" alt="Metabolic simulator interface mockup — figure with annotated organs, life timeline, and meal entry" />
      <figcaption>Mockup, not a screenshot — generated with OpenAI's image generator. The real simulator begins in Phase 1.</figcaption>
    </figure>

    <footer>
      Open source · No accounts · No telemetry · <a class="accent" href="https://github.com/davidthingsbot/metabolic-sim" target="_blank" rel="noopener">source on GitHub</a>
    </footer>
  `;

  const button = document.getElementById('theme-toggle');
  button?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') as Theme;
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

applyTheme(preferredTheme());
render();
