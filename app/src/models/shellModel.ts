import type { Theme } from '../theme';
import type { EngineHost } from '../runtime/engineHost';
import type { ShellStateHost } from '../runtime/shellStateHost';
import { createShellSnapshot, type ShellSnapshot, type SystemId, type Workspace } from './shellSnapshot';

export interface ShellModel {
  getSnapshot(): ShellSnapshot;
  subscribe(listener: () => void): () => void;
  setWorkspace(workspace: Workspace): void;
  selectSystem(systemId: SystemId): void;
  setTheme(theme: Theme): void;
  setPlaybackTime(playbackTime: number): Promise<void>;
}

export interface CreateShellModelOptions {
  engineHost: EngineHost;
  shellStateHost: ShellStateHost;
  initialWorkspace?: Workspace;
  initialSelectedSystemId?: SystemId;
  initialTheme?: Theme;
}

export function createShellModel(options: CreateShellModelOptions): ShellModel {
  const listeners = new Set<() => void>();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  options.engineHost.subscribe(() => {
    emit();
  });

  options.shellStateHost.subscribe(() => {
    emit();
  });

  return {
    getSnapshot() {
      const sessionSnapshot = options.engineHost.getSnapshot();
      const shellStateSnapshot = options.shellStateHost.getSnapshot();
      return createShellSnapshot({
        run: sessionSnapshot.activeRun,
        workspace: shellStateSnapshot.workspace,
        selectedSystemId: shellStateSnapshot.selectedSystemId,
        theme: shellStateSnapshot.theme,
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setWorkspace(nextWorkspace) {
      options.shellStateHost.setWorkspace(nextWorkspace);
    },
    selectSystem(systemId) {
      options.shellStateHost.selectSystem(systemId);
    },
    setTheme(nextTheme) {
      options.shellStateHost.setTheme(nextTheme);
    },
    async setPlaybackTime(playbackTime) {
      await options.engineHost.updateActiveRun((draft) => {
        draft.activePlaybackTime = playbackTime;
      });
    },
  };
}