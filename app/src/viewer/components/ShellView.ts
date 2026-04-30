import { h, type FunctionalComponent } from 'preact';
import type { CreateScheduledMealActivityInput, UpdateScheduledMealActivityInput } from '../../runs/types';
import type { ShellSnapshot, SystemId, Workspace } from '../../models/shellSnapshot';
import { BandView } from './BandView';
import { ShellFooterView } from './ShellFooterView';
import { ShellHeaderView } from './ShellHeaderView';
import { ShellMidsectionView } from './ShellMidsectionView';

export interface ShellViewProps {
  snapshot: ShellSnapshot;
  onSelectWorkspace: (workspace: Workspace) => void;
  onSelectSystem: (systemId: SystemId) => void;
  onToggleSubsystem: (subsystemId: string) => void;
  onCreateMealActivity: (input: CreateScheduledMealActivityInput) => void;
  onUpdateMealActivity: (activityId: string, input: UpdateScheduledMealActivityInput) => void;
  onRemoveScheduledActivity: (activityId: string) => void;
  onSetPlaybackTime: (playbackTime: number) => void;
  onStepPlayback: () => void;
  onTogglePlaying: () => void;
  onBranchPlaybackTime: (playbackTime: number) => void;
  onToggleTheme: () => void;
}

export const ShellView: FunctionalComponent<ShellViewProps> = ({
  snapshot,
  onSelectWorkspace,
  onSelectSystem,
  onToggleSubsystem,
  onCreateMealActivity,
  onUpdateMealActivity,
  onRemoveScheduledActivity,
  onSetPlaybackTime,
  onStepPlayback,
  onTogglePlaying,
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
        onToggleSubsystem,
        onCreateMealActivity,
        onUpdateMealActivity,
        onRemoveScheduledActivity,
      }),
    }),
    h(BandView, {
      as: 'footer',
      className: 'shell-footer',
      children: h(ShellFooterView, { snapshot, onSetPlaybackTime, onStepPlayback, onTogglePlaying, onBranchPlaybackTime }),
    }),
  ]);
