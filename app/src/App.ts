import { h, type FunctionalComponent } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { ShellAppState } from './appBootstrap';
import { createShellViewModel, type SystemId, type Workspace } from './shellViewModel';
import { applyTheme, type Theme } from './theme';

export interface AppProps {
  initialState: ShellAppState;
  initialTheme: Theme;
}

const workspaceOptions: Array<{ value: Workspace; label: string }> = [
  { value: 'body-status', label: 'Body Status' },
  { value: 'event-planner', label: 'Event Planner' },
];

export const App: FunctionalComponent<AppProps> = ({ initialState, initialTheme }) => {
  const [workspace, setWorkspace] = useState<Workspace>(initialState.workspace);
  const [selectedSystemId, setSelectedSystemId] = useState<SystemId>(initialState.selectedSystemId);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const viewModel = useMemo(
    () =>
      createShellViewModel({
        run: initialState.activeRun,
        workspace,
        selectedSystemId,
      }),
    [initialState.activeRun, selectedSystemId, workspace],
  );

  function toggleTheme(): void {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return h('div', { class: 'shell-app' }, [
    h('header', { class: 'shell-band shell-header' }, [
      h('div', { class: 'header-title-group' }, [
        h('p', { class: 'eyebrow' }, 'Metabolic Simulator'),
        h('h1', null, viewModel.runName),
        h('p', { class: 'header-status' }, viewModel.highLevelStatus),
      ]),
      h('div', { class: 'header-controls' }, [
        h('div', { class: 'control-cluster', 'aria-label': 'Sim Bar' }, [
          h('span', { class: 'control-label' }, 'Sim Bar'),
          h('div', { class: 'chip-row' }, [
            h('span', { class: 'control-chip active' }, `Run: ${viewModel.runName}`),
            h('button', { class: 'control-chip', type: 'button' }, 'Pause'),
            h('button', { class: 'control-chip', type: 'button' }, 'Reset'),
            h('button', { class: 'control-chip', type: 'button' }, '1×'),
          ]),
        ]),
        h('div', { class: 'control-cluster', 'aria-label': 'Viewer Bar' }, [
          h('span', { class: 'control-label' }, 'Viewer Bar'),
          h('div', { class: 'chip-row' }, [
            h('span', { class: 'control-chip active' }, viewModel.viewerStatus),
            h('button', { class: 'control-chip', type: 'button' }, 'Plain labels'),
            h('button', { class: 'theme-toggle', type: 'button', onClick: toggleTheme },
              theme === 'dark' ? 'Light mode' : 'Dark mode',
            ),
          ]),
        ]),
      ]),
    ]),
    h('main', { class: 'shell-band shell-midsection' }, [
      h('aside', { class: 'systems-rail' }, [
        h('div', { class: 'workspace-selector' }, [
          h('span', { class: 'control-label' }, 'Workspace'),
          h('div', { class: 'workspace-toggle', role: 'tablist', 'aria-label': 'Workspace selector' },
            workspaceOptions.map((option) =>
              h(
                'button',
                {
                  key: option.value,
                  class: option.value === workspace ? 'workspace-button active' : 'workspace-button',
                  type: 'button',
                  onClick: () => setWorkspace(option.value),
                },
                option.label,
              ),
            ),
          ),
        ]),
        h('div', { class: 'systems-list' }, [
          h('span', { class: 'control-label' }, 'Systems'),
          ...viewModel.systems.map((system) =>
            h(
              'button',
              {
                key: system.id,
                class: system.isSelected ? 'system-chip active' : 'system-chip',
                type: 'button',
                onClick: () => setSelectedSystemId(system.id),
              },
              [
                h('strong', null, system.label),
                h('span', null, system.caption),
              ],
            ),
          ),
        ]),
      ]),
      h('section', { class: 'detail-field' }, [
        h('div', { class: 'detail-heading' }, [
          h('p', { class: 'eyebrow' }, viewModel.workspaceLabel),
          h('h2', null, workspace === 'body-status' ? 'Master / detail shell' : 'Planner shell'),
          h('p', { class: 'detail-copy' },
            workspace === 'body-status'
              ? 'Static body-status placeholders now sit on top of the persisted run model.'
              : 'Static planner placeholders use the same active run and timeline model.',
          ),
        ]),
        h('div', { class: 'detail-card-stack' },
          viewModel.detailCards.map((card) =>
            h('article', { key: card.title, class: 'detail-card' }, [
              h('h3', null, card.title),
              h('p', null, card.body),
            ]),
          ),
        ),
      ]),
    ]),
    h('footer', { class: 'shell-band shell-footer' }, [
      h('div', { class: 'footer-controls' }, [
        h('div', { class: 'control-cluster' }, [
          h('span', { class: 'control-label' }, 'Experiment'),
          h('div', { class: 'chip-row' }, [
            h('button', { class: 'control-chip', type: 'button' }, 'Play'),
            h('button', { class: 'control-chip', type: 'button' }, 'Step'),
            h('button', { class: 'control-chip', type: 'button' }, 'Branch'),
          ]),
        ]),
        h('div', { class: 'timeline-block' }, [
          h('div', { class: 'timeline-header' }, [
            h('span', { class: 'control-label' }, 'Timeline scrubber'),
            h('span', { class: 'timeline-status' }, viewModel.scrubberStatus),
          ]),
          h('input', {
            class: 'timeline-slider',
            type: 'range',
            min: 0,
            max: 43200,
            value: initialState.activeRun.activePlaybackTime,
            step: 300,
          }),
        ]),
      ]),
    ]),
  ]);
};
