import { applyTheme, type Theme } from '../theme';
import type { SystemId, Workspace } from '../models/shellSnapshot';

export interface ShellStateSnapshot {
  workspace: Workspace;
  selectedSystemId: SystemId;
  theme: Theme;
}

export interface ShellStateHost {
  getSnapshot(): ShellStateSnapshot;
  subscribe(listener: () => void): () => void;
  setWorkspace(workspace: Workspace): void;
  selectSystem(systemId: SystemId): void;
  setTheme(theme: Theme): void;
}

export interface CreateShellStateHostOptions {
  initialTheme: Theme;
  initialWorkspace?: Workspace;
  initialSelectedSystemId?: SystemId;
}

export function createShellStateHost(options: CreateShellStateHostOptions): ShellStateHost {
  let snapshot: ShellStateSnapshot = {
    workspace: options.initialWorkspace ?? 'body-status',
    selectedSystemId: options.initialSelectedSystemId ?? 'whole-body',
    theme: options.initialTheme,
  };
  const listeners = new Set<() => void>();

  applyTheme(snapshot.theme);

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot() {
      return { ...snapshot };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setWorkspace(workspace) {
      snapshot = { ...snapshot, workspace };
      emit();
    },
    selectSystem(selectedSystemId) {
      snapshot = { ...snapshot, selectedSystemId };
      emit();
    },
    setTheme(theme) {
      snapshot = { ...snapshot, theme };
      applyTheme(theme);
      emit();
    },
  };
}