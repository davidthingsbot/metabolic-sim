import { applyTheme, type Theme } from '../theme';
import type { SystemId, Workspace } from '../models/shellSnapshot';

export interface ShellStateSnapshot {
  workspace: Workspace;
  selectedSystemId: SystemId;
  enabledSubsystemIds: string[];
  theme: Theme;
  isPlaying: boolean;
}

export interface ShellStateHost {
  getSnapshot(): ShellStateSnapshot;
  subscribe(listener: () => void): () => void;
  setWorkspace(workspace: Workspace): void;
  selectSystem(systemId: SystemId): void;
  toggleSubsystem(subsystemId: string): void;
  setTheme(theme: Theme): void;
  setPlaying(isPlaying: boolean): void;
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
    enabledSubsystemIds: [
      'blood-system',
      'digestive-system',
      'lymph-system',
      'arterial-flow',
      'venous-return',
      'storage-signal',
      'stomach-processing',
      'gut-absorption',
      'liver-hand-off',
      'lymph-return',
      'tissue-drainage',
      'gut-lacteals',
    ],
    theme: options.initialTheme,
    isPlaying: false,
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
    toggleSubsystem(subsystemId) {
      const isEnabled = snapshot.enabledSubsystemIds.includes(subsystemId);
      snapshot = {
        ...snapshot,
        enabledSubsystemIds: isEnabled
          ? snapshot.enabledSubsystemIds.filter((enabledSubsystemId) => enabledSubsystemId !== subsystemId)
          : [...snapshot.enabledSubsystemIds, subsystemId],
      };
      emit();
    },
    setTheme(theme) {
      snapshot = { ...snapshot, theme };
      applyTheme(theme);
      emit();
    },
    setPlaying(isPlaying) {
      snapshot = { ...snapshot, isPlaying };
      emit();
    },
  };
}