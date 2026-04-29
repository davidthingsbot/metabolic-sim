import { h, type FunctionalComponent } from 'preact';

export interface DividerViewProps {
  className?: string;
}

export const DividerView: FunctionalComponent<DividerViewProps> = ({ className }) =>
  h('div', { class: className ? `shell-divider ${className}` : 'shell-divider', 'aria-hidden': 'true' });
