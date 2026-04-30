import { applyTheme, type Theme } from '../theme';
import type { LabelMode, SystemId, Workspace } from '../models/shellSnapshot';

export interface ShellStateSnapshot {
  workspace: Workspace;
  selectedSystemId: SystemId;
  enabledSubsystemIds: string[];
  theme: Theme;
  labelMode: LabelMode;
  isPlaying: boolean;
}

export interface ShellStateHost {
  getSnapshot(): ShellStateSnapshot;
  subscribe(listener: () => void): () => void;
  setWorkspace(workspace: Workspace): void;
  selectSystem(systemId: SystemId): void;
  toggleSubsystem(subsystemId: string): void;
  setTheme(theme: Theme): void;
  setLabelMode(labelMode: LabelMode): void;
  setPlaying(isPlaying: boolean): void;
}

export interface CreateShellStateHostOptions {
  initialTheme: Theme;
  initialWorkspace?: Workspace;
  initialSelectedSystemId?: SystemId;
}

const TOP_LEVEL_SYSTEM_IDS: SystemId[] = ['blood-system', 'digestive-system', 'lymph-system'];
const SYSTEM_SUBTREE_IDS: Record<SystemId, string[]> = {
  'whole-body': [
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
  'blood-system': ['blood-system', 'arterial-flow', 'venous-return', 'storage-signal'],
  'digestive-system': ['digestive-system', 'stomach-processing', 'gut-absorption', 'liver-hand-off'],
  'lymph-system': ['lymph-system', 'lymph-return', 'tissue-drainage', 'gut-lacteals'],
};

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
    labelMode: 'plain',
    isPlaying: false,
  };
  const listeners = new Set<() => void>();

  applyTheme(snapshot.theme);

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  function isSystemEnabled(systemId: SystemId): boolean {
    return SYSTEM_SUBTREE_IDS[systemId].every((id) => snapshot.enabledSubsystemIds.includes(id))
      || snapshot.enabledSubsystemIds.includes(systemId);
  }

  function setSystemEnabled(systemId: Exclude<SystemId, 'whole-body'>, isEnabled: boolean): void {
    const nextEnabledIds = new Set(snapshot.enabledSubsystemIds);
    for (const id of SYSTEM_SUBTREE_IDS[systemId]) {
      if (isEnabled) {
        nextEnabledIds.add(id);
      } else {
        nextEnabledIds.delete(id);
      }
    }
    snapshot = { ...snapshot, enabledSubsystemIds: Array.from(nextEnabledIds) };
  }

  function firstEnabledSystemId(): SystemId {
    return TOP_LEVEL_SYSTEM_IDS.find((systemId) => isSystemEnabled(systemId)) ?? 'blood-system';
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
      if (selectedSystemId === 'whole-body') {
        snapshot = {
          ...snapshot,
          selectedSystemId: snapshot.selectedSystemId === 'whole-body' ? firstEnabledSystemId() : 'whole-body',
        };
        emit();
        return;
      }

      if (snapshot.selectedSystemId === 'whole-body') {
        setSystemEnabled(selectedSystemId, !isSystemEnabled(selectedSystemId));
        emit();
        return;
      }

      const nextEnabledState = !isSystemEnabled(selectedSystemId);
      setSystemEnabled(selectedSystemId, nextEnabledState);
      snapshot = {
        ...snapshot,
        selectedSystemId: nextEnabledState ? snapshot.selectedSystemId : firstEnabledSystemId(),
      };
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
    setLabelMode(labelMode) {
      snapshot = { ...snapshot, labelMode };
      emit();
    },
    setPlaying(isPlaying) {
      snapshot = { ...snapshot, isPlaying };
      emit();
    },
  };
}