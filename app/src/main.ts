import { h, render } from 'preact';
import { App } from './App';
import { initializeShellApp } from './appBootstrap';
import { createBrowserRunRepository } from './persistence/browserRunRepository';
import { createRun } from './runs/runFactory';
import { applyTheme, preferredTheme } from './theme';

function createDefaultRunName(): string {
  return 'Metabolic Run';
}

async function mountApp(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) {
    return;
  }

  const initialTheme = preferredTheme();
  applyTheme(initialTheme);

  render(
    h('div', { class: 'boot-message', role: 'status' }, 'Loading persisted run…'),
    app,
  );

  try {
    const initialState = await initializeShellApp({
      repository: createBrowserRunRepository(),
      createDefaultRun: () => createRun({ name: createDefaultRunName() }),
    });

    render(h(App, { initialState, initialTheme }), app);
  } catch (error) {
    console.error(error);
    render(
      h(
        'div',
        { class: 'boot-message boot-message-error', role: 'alert' },
        'The simulator shell could not restore its browser data.',
      ),
      app,
    );
  }
}

void mountApp();
