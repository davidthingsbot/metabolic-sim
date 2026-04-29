import { h, type FunctionalComponent } from 'preact';
import type { ShellSnapshot, SystemId, Workspace } from '../../models/shellSnapshot';
import { SplitView } from './SplitView';

export interface ShellMidsectionViewProps {
  snapshot: ShellSnapshot;
  onSelectWorkspace: (workspace: Workspace) => void;
  onSelectSystem: (systemId: SystemId) => void;
}

export const ShellMidsectionView: FunctionalComponent<ShellMidsectionViewProps> = ({
  snapshot,
  onSelectWorkspace,
  onSelectSystem,
}) =>
  h(SplitView, {
    className: 'shell-midsection',
    start: h('aside', { class: 'systems-rail' }, [
      h('div', { class: 'workspace-selector' }, [
        h('span', { class: 'control-label' }, 'Workspace'),
        h('div', { class: 'workspace-toggle', role: 'tablist', 'aria-label': 'Workspace selector' },
          snapshot.workspace.options.map((option) =>
            h(
              'button',
              {
                key: option.value,
                class: option.isSelected ? 'workspace-button active' : 'workspace-button',
                type: 'button',
                onClick: () => onSelectWorkspace(option.value),
              },
              option.label,
            ),
          ),
        ),
      ]),
      h('div', { class: 'systems-list' }, [
        h('span', { class: 'control-label' }, 'Systems'),
        ...snapshot.systems.map((system) =>
          h(
            'button',
            {
              key: system.id,
              class: system.isSelected ? 'system-chip active' : 'system-chip',
              type: 'button',
              onClick: () => onSelectSystem(system.id),
            },
            [h('strong', null, system.label), h('span', null, system.caption)],
          ),
        ),
      ]),
    ]),
    end: h('section', { class: 'detail-field' }, [
      h('div', { class: 'detail-heading' }, [
        h('p', { class: 'eyebrow' }, snapshot.workspace.label),
        h('h2', null, snapshot.bands.midsection.title),
        h('p', { class: 'detail-copy' }, snapshot.bands.midsection.copy),
      ]),
      h('div', { class: 'detail-card-stack' },
        snapshot.bands.midsection.detailCards.map((card) =>
          h('article', { key: card.title, class: 'detail-card' }, [
            h('h3', null, card.title),
            h('p', null, card.body),
          ]),
        ),
      ),
    ]),
  });
