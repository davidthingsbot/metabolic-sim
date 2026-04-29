import { h, type FunctionalComponent } from 'preact';
import type { ShellSnapshot } from '../../models/shellSnapshot';

export interface ShellHeaderViewProps {
  snapshot: ShellSnapshot;
  onToggleTheme: () => void;
}

export const ShellHeaderView: FunctionalComponent<ShellHeaderViewProps> = ({ snapshot, onToggleTheme }) =>
  h('div', null, [
    h('div', { class: 'header-title-group' }, [
      h('p', { class: 'eyebrow' }, snapshot.bands.header.eyebrow),
      h('h1', null, snapshot.runName),
      h('p', { class: 'header-status' }, snapshot.bands.header.highLevelStatus),
    ]),
    h('div', { class: 'header-controls' }, [
      h('div', { class: 'control-cluster', 'aria-label': 'Sim Bar' }, [
        h('span', { class: 'control-label' }, 'Sim Bar'),
        h('div', { class: 'chip-row' }, [
          h('span', { class: 'control-chip active' }, snapshot.bands.header.runChipLabel),
          h('button', { class: 'control-chip', type: 'button' }, 'Pause'),
          h('button', { class: 'control-chip', type: 'button' }, 'Reset'),
          h('button', { class: 'control-chip', type: 'button' }, '1×'),
        ]),
      ]),
      h('div', { class: 'control-cluster', 'aria-label': 'Viewer Bar' }, [
        h('span', { class: 'control-label' }, 'Viewer Bar'),
        h('div', { class: 'chip-row' }, [
          h('span', { class: 'control-chip active' }, snapshot.bands.header.viewerStatus),
          h('button', { class: 'control-chip', type: 'button' }, 'Plain labels'),
          h('button', { class: 'theme-toggle', type: 'button', onClick: onToggleTheme }, snapshot.bands.header.themeToggleLabel),
        ]),
      ]),
    ]),
  ]);
