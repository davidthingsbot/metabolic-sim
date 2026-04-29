import { h, type ComponentChildren, type FunctionalComponent } from 'preact';
import { DividerView } from './DividerView';

export interface SplitViewProps {
  className?: string;
  start: ComponentChildren;
  end: ComponentChildren;
}

export const SplitView: FunctionalComponent<SplitViewProps> = ({ className, start, end }) =>
  h('div', { class: className ? `shell-split ${className}` : 'shell-split' }, [
    h('div', { class: 'shell-split-pane shell-split-pane-start' }, start),
    h(DividerView, { className: 'shell-split-divider' }),
    h('div', { class: 'shell-split-pane shell-split-pane-end' }, end),
  ]);
