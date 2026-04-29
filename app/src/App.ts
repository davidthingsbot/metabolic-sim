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

export const App: FunctionalComponent<AppProps> = ({ model }) => {
  const snapshot = useShellSnapshot(model);

  function toggleTheme(): void {
    const nextTheme = snapshot.theme === 'dark' ? 'light' : 'dark';
    model.setTheme(nextTheme);
  }

  return h(ShellView, {
    snapshot,
    onSelectWorkspace: (workspace) => model.setWorkspace(workspace),
    onSelectSystem: (systemId) => model.selectSystem(systemId),
    onSetPlaybackTime: (playbackTime) => void model.setPlaybackTime(playbackTime),
    onToggleTheme: toggleTheme,
  });
};
