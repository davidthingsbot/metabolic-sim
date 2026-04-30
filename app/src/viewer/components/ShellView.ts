import { h, type FunctionalComponent } from 'preact';
import type { CreateScheduledMealActivityInput } from '../../runs/types';
import type { ShellSnapshot, SystemId, Workspace } from '../../models/shellSnapshot';
import { BandView } from './BandView';
import { ShellFooterView } from './ShellFooterView';
import { ShellHeaderView } from './ShellHeaderView';
import { ShellMidsectionView } from './ShellMidsectionView';

export interface ShellViewProps {
  snapshot: ShellSnapshot;
  onSelectWorkspace: (workspace: Workspace) => void;
  onSelectSystem: (systemId: SystemId) => void;
  onCreateMealActivity: (input: CreateScheduledMealActivityInput) => void;
  onSetPlaybackTime: (playbackTime: number) => void;
  onStepPlayback: () => void;
  onBranchPlaybackTime: (playbackTime: number) => void;
  onToggleTheme: () => void;
}

export const ShellView: FunctionalComponent<ShellViewProps> = ({
  snapshot,
  onSelectWorkspace,
  onSelectSystem,
  onCreateMealActivity,
  onSetPlaybackTime,
  onStepPlayback,
  onBranchPlaybackTime,
  onToggleTheme,
}) =>
  h('div', { class: 'shell-app' }, [
    h(BandView, {
      as: 'header',
      className: 'shell-header',
      children: h(ShellHeaderView, { snapshot, onToggleTheme }),
    }),
    h(BandView, {
      as: 'main',
      className: 'shell-midsection-band',
      children: h(ShellMidsectionView, {
        snapshot,
        onSelectWorkspace,
        onSelectSystem,
        onCreateMealActivity,
      }),
    }),
    h(BandView, {
      as: 'footer',
      className: 'shell-footer',
      children: h(ShellFooterView, { snapshot, onSetPlaybackTime, onStepPlayback, onBranchPlaybackTime }),
    }),
  ]);
