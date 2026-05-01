import type { Theme } from '../theme';
import type { EngineHost } from '../runtime/engineHost';
import type { ShellStateHost } from '../runtime/shellStateHost';
import type { CreateScheduleLaneInput, CreateScheduledMealActivityInput, UpdateScheduledMealActivityInput } from '../runs/types';
import { createShellSnapshot, type LabelMode, type ShellSnapshot, type SystemId, type Workspace } from './shellSnapshot';

export interface ShellModel {
  getSnapshot(): ShellSnapshot;
  subscribe(listener: () => void): () => void;
  setWorkspace(workspace: Workspace): void;
  selectSystem(systemId: SystemId): void;
  toggleSubsystem(subsystemId: string): void;
  setTheme(theme: Theme): void;
  setLabelMode(labelMode: LabelMode): void;
  cycleSparklineMetric(): void;
  setPlaying(isPlaying: boolean): void;
  cyclePlaybackSpeed(): void;
  createScheduleLane(input: CreateScheduleLaneInput): Promise<void>;
  createMealActivity(input: CreateScheduledMealActivityInput): Promise<void>;
  updateMealActivity(activityId: string, input: UpdateScheduledMealActivityInput): Promise<void>;
  removeScheduledActivity(activityId: string): Promise<void>;
  setPlaybackTime(playbackTime: number): Promise<void>;
  branchActiveRunFromPlaybackTime(playbackTime: number, runName?: string): Promise<void>;
  stepPlayback(stepSeconds?: number): Promise<void>;
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
        enabledSubsystemIds: shellStateSnapshot.enabledSubsystemIds,
        labelMode: shellStateSnapshot.labelMode,
        sparklineMetricId: shellStateSnapshot.sparklineMetricId,
        theme: shellStateSnapshot.theme,
        isPlaying: shellStateSnapshot.isPlaying,
        playbackSpeedMultiplier: shellStateSnapshot.playbackSpeedMultiplier,
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
    toggleSubsystem(subsystemId) {
      options.shellStateHost.toggleSubsystem(subsystemId);
    },
    setTheme(nextTheme) {
      options.shellStateHost.setTheme(nextTheme);
    },
    setLabelMode(labelMode) {
      options.shellStateHost.setLabelMode(labelMode);
    },
    cycleSparklineMetric() {
      options.shellStateHost.cycleSparklineMetric();
    },
    setPlaying(isPlaying) {
      options.shellStateHost.setPlaying(isPlaying);
    },
    cyclePlaybackSpeed() {
      options.shellStateHost.cyclePlaybackSpeed();
    },
    async createScheduleLane(input) {
      await options.engineHost.createScheduleLane(input);
    },
    async createMealActivity(input) {
      await options.engineHost.createMealActivity(input);
    },
    async updateMealActivity(activityId, input) {
      await options.engineHost.updateMealActivity(activityId, input);
    },
    async removeScheduledActivity(activityId) {
      await options.engineHost.removeScheduledActivity(activityId);
    },
    async setPlaybackTime(playbackTime) {
      await options.engineHost.restorePlaybackTime(playbackTime);
    },
    async branchActiveRunFromPlaybackTime(playbackTime, runName) {
      await options.engineHost.branchActiveRunFromPlaybackTime(playbackTime, runName);
    },
    async stepPlayback(stepSeconds = 300) {
      await options.engineHost.stepPlayback(stepSeconds);
    },
  };
}