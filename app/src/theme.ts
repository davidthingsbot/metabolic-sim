const STORAGE_KEY = 'metabolic-sim:theme';

export type Theme = 'light' | 'dark';

function hasBrowserStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function hasBrowserDocument(): boolean {
  return typeof document !== 'undefined';
}

function hasMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

export function preferredTheme(): Theme {
  if (hasBrowserStorage()) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }

  if (hasMatchMedia() && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme: Theme): void {
  if (hasBrowserDocument()) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  if (hasBrowserStorage()) {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}
