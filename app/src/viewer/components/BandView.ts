import { h, type ComponentChildren, type FunctionalComponent } from 'preact';

export interface BandViewProps {
  as: 'header' | 'main' | 'footer';
  className: string;
  children: ComponentChildren;
}

export const BandView: FunctionalComponent<BandViewProps> = ({ as, className, children }) =>
  h(as, { class: `shell-band ${className}` }, children);
