import { h, type FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { type ShellModel } from './models/shellModel';
import type { ShellSnapshot } from './models/shellSnapshot';
import { ShellView } from './viewer/components/ShellView';

export interface AppProps {
  model: ShellModel;
}

function useShellSnapshot(model: ShellModel): ShellSnapshot {
  const [snapshot, setSnapshot] = useState(() => model.getSnapshot());

  useEffect(() => model.subscribe(() => setSnapshot(model.getSnapshot())), [model]);

  return snapshot;
}

function usePlaybackLoop(model: ShellModel, isPlaying: boolean): void {
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      void model.stepPlayback(60);
    }, 300);

    return () => window.clearInterval(timer);
  }, [isPlaying, model]);
}

export const App: FunctionalComponent<AppProps> = ({ model }) => {
  const snapshot = useShellSnapshot(model);
  usePlaybackLoop(model, snapshot.bands.footer.isPlaying);

  function toggleTheme(): void {
    const nextTheme = snapshot.theme === 'dark' ? 'light' : 'dark';
    model.setTheme(nextTheme);
  }

  function toggleLabelMode(): void {
    const nextLabelMode = snapshot.labelMode === 'plain' ? 'scientific' : 'plain';
    model.setLabelMode(nextLabelMode);
  }

  return h(ShellView, {
    snapshot,
    onSelectWorkspace: (workspace) => model.setWorkspace(workspace),
    onSelectSystem: (systemId) => model.selectSystem(systemId),
    onToggleSubsystem: (subsystemId) => model.toggleSubsystem(subsystemId),
    onCreateMealActivity: (input) => void model.createMealActivity(input),
    onUpdateMealActivity: (activityId, input) => void model.updateMealActivity(activityId, input),
    onRemoveScheduledActivity: (activityId) => void model.removeScheduledActivity(activityId),
    onSetPlaybackTime: (playbackTime) => void model.setPlaybackTime(playbackTime),
    onStepPlayback: () => void model.stepPlayback(),
    onTogglePlaying: () => model.setPlaying(!snapshot.bands.footer.isPlaying),
    onBranchPlaybackTime: (playbackTime) => void model.branchActiveRunFromPlaybackTime(playbackTime),
    onToggleTheme: toggleTheme,
    onToggleLabelMode: toggleLabelMode,
  });
};
