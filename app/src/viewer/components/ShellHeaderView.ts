import { h, type FunctionalComponent } from 'preact';
import type { ShellSnapshot } from '../../models/shellSnapshot';

export interface ShellHeaderViewProps {
  snapshot: ShellSnapshot;
  onToggleTheme: () => void;
  onToggleLabelMode: () => void;
}

export const ShellHeaderView: FunctionalComponent<ShellHeaderViewProps> = ({ snapshot, onToggleTheme, onToggleLabelMode }) =>
  h('div', { class: 'header-top-row' }, [
    h('div', { class: 'header-brand' }, [
      h('img', {
        class: 'header-brand-icon',
        src: '/metabolic-sim-icon.png',
        width: 64,
        height: 64,
        alt: 'Metabolic Simulator icon',
      }),
      h('h1', null, snapshot.bands.header.eyebrow),
    ]),
    h('div', { class: 'header-viewer-controls' }, [
      h('button', { class: 'control-chip', type: 'button', onClick: onToggleLabelMode }, snapshot.bands.header.labelModeToggleLabel),
      h('button', { class: 'theme-toggle', type: 'button', onClick: onToggleTheme }, snapshot.bands.header.themeToggleLabel),
    ]),
  ]);
