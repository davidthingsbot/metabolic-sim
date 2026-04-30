import { describe, expect, it } from 'vitest';
import { createRun } from '../runs/runFactory';
import { appendScheduledMealActivity, removeScheduledActivity, replaceScheduledMealActivity } from '../runs/scheduledActivities';
import type { CreateScheduledMealActivityInput } from '../runs/types';
import { createShellModel } from './shellModel';

function createSampleRun() {
  const run = createRun({
    name: 'Lunch Replay',
    initialMeal: {
      startPlaybackTime: 5400,
      durationMinutes: 30,
      carbsGrams: 45,
    },
  });
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.substances.glucose.gut = 12.4;
  run.individuals[0].state.substances.glucose.cells = 18.6;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

function createStubSession(run = createSampleRun()) {
  let activeRun = structuredClone(run);
  const listeners = new Set<() => void>();

  return {
    getSnapshot() {
      return { activeRun: structuredClone(activeRun) };
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async updateActiveRun(update: (draft: typeof activeRun) => void) {
      const draft = structuredClone(activeRun);
      update(draft);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async createMealActivity(input: CreateScheduledMealActivityInput) {
      const draft = structuredClone(activeRun);
      appendScheduledMealActivity(draft, input);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async updateMealActivity(activityId: string, input: CreateScheduledMealActivityInput) {
      const draft = structuredClone(activeRun);
      replaceScheduledMealActivity(draft, activityId, input);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async removeScheduledActivity(activityId: string) {
      const draft = structuredClone(activeRun);
      removeScheduledActivity(draft, activityId);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async restorePlaybackTime(playbackTime: number) {
      const checkpoint = activeRun.history.checkpoints.find((entry) => entry.playbackTime === playbackTime);
      if (!checkpoint) {
        return;
      }
      const draft = structuredClone(activeRun);
      draft.activePlaybackTime = playbackTime;
      draft.individuals = structuredClone(checkpoint.individuals);
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async recordHistoryCheckpoint(playbackTime = activeRun.activePlaybackTime) {
      const draft = structuredClone(activeRun);
      draft.activePlaybackTime = playbackTime;
      const existingIndex = draft.history.checkpoints.findIndex((entry) => entry.playbackTime === playbackTime);
      const checkpoint = {
        playbackTime,
        individuals: structuredClone(draft.individuals),
      };
      if (existingIndex >= 0) {
        draft.history.checkpoints[existingIndex] = checkpoint;
      } else {
        draft.history.checkpoints.push(checkpoint);
      }
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
    async branchActiveRunFromPlaybackTime(playbackTime: number, runName?: string) {
      const checkpoint = activeRun.history.checkpoints.find((entry) => entry.playbackTime === playbackTime);
      if (!checkpoint) {
        throw new Error(`Cannot branch run from missing checkpoint at playback time ${playbackTime}`);
      }

      activeRun = {
        ...structuredClone(activeRun),
        id: 'branched-run',
        name: runName ?? `${activeRun.name} Branch`,
        activePlaybackTime: playbackTime,
        individuals: structuredClone(checkpoint.individuals),
        history: {
          checkpoints: [
            {
              playbackTime,
              individuals: structuredClone(checkpoint.individuals),
            },
          ],
        },
        lineage: {
          parentRunId: activeRun.id,
          parentCheckpointTime: playbackTime,
          branchedAtPlaybackTime: playbackTime,
        },
      };
      listeners.forEach((listener) => listener());
    },
    async stepPlayback(stepSeconds = 300) {
      const draft = structuredClone(activeRun);
      const nextPlaybackTime = draft.activePlaybackTime + stepSeconds;
      draft.activePlaybackTime = nextPlaybackTime;
      draft.individuals = draft.individuals.map((individual) => ({
        ...individual,
        state: {
          ...individual.state,
          simulatedTime: nextPlaybackTime,
        },
      }));
      draft.history.checkpoints.push({
        playbackTime: nextPlaybackTime,
        individuals: structuredClone(draft.individuals),
      });
      activeRun = draft;
      listeners.forEach((listener) => listener());
    },
  };
}

function createStubShellStateHost() {
  let snapshot: {
    workspace: 'body-status' | 'event-planner';
    selectedSystemId: 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system';
    enabledSubsystemIds: string[];
    theme: 'light' | 'dark';
    isPlaying: boolean;
  } = {
    workspace: 'body-status',
    selectedSystemId: 'whole-body',
    enabledSubsystemIds: ['blood-system', 'digestive-system', 'lymph-system', 'arterial-flow', 'venous-return', 'storage-signal'],
    theme: 'light',
    isPlaying: false,
  };
  const listeners = new Set<() => void>();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot() {
      return { ...snapshot };
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setWorkspace(workspace: 'body-status' | 'event-planner') {
      snapshot = { ...snapshot, workspace };
      emit();
    },
    selectSystem(selectedSystemId: 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system') {
      snapshot = { ...snapshot, selectedSystemId };
      emit();
    },
    toggleSubsystem(subsystemId: string) {
      snapshot = {
        ...snapshot,
        enabledSubsystemIds: snapshot.enabledSubsystemIds.includes(subsystemId)
          ? snapshot.enabledSubsystemIds.filter((enabledSubsystemId) => enabledSubsystemId !== subsystemId)
          : [...snapshot.enabledSubsystemIds, subsystemId],
      };
      emit();
    },
    setTheme(theme: 'light' | 'dark') {
      snapshot = { ...snapshot, theme };
      emit();
    },
    setPlaying(isPlaying: boolean) {
      snapshot = { ...snapshot, isPlaying };
      emit();
    },
  };
}

describe('createShellModel', () => {
  it('derives the viewer snapshot from the engine host and default shell selections', () => {
    const model = createShellModel({
      engineHost: createStubSession(),
      shellStateHost: createStubShellStateHost(),
    });
    const snapshot = model.getSnapshot();

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.workspace.value).toBe('body-status');
    expect(snapshot.systems.find((system) => system.id === 'whole-body')?.isSelected).toBe(true);
    expect(snapshot.subsystems).toEqual([
      expect.objectContaining({ label: 'Blood System', isEnabled: true }),
      expect.objectContaining({ label: 'Digestive System', isEnabled: true }),
      expect.objectContaining({ label: 'Lymph System', isEnabled: true }),
    ]);
    expect(snapshot.bands.header.viewerStatus).toBe('Viewing Whole Body');
    expect(snapshot.bands.footer.isPlaying).toBe(false);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Current trajectory',
      'Recent checkpoint trail',
      'How to read this',
    ]);
  });

  it('lets the controller toggle live playback state through the authoritative shell host', () => {
    const shellStateHost = createStubShellStateHost();
    const model = createShellModel({
      engineHost: createStubSession(),
      shellStateHost,
    });

    model.setPlaying(true);
    expect(model.getSnapshot().bands.footer.isPlaying).toBe(true);

    model.setPlaying(false);
    expect(model.getSnapshot().bands.footer.isPlaying).toBe(false);
  });

  it('reacts to authoritative host updates from both engine and shell state', async () => {
    const engineHost = createStubSession();
    const shellStateHost = createStubShellStateHost();
    const model = createShellModel({ engineHost, shellStateHost });
    const viewerEvents: string[] = [];

    const unsubscribe = model.subscribe(() => {
      viewerEvents.push(model.getSnapshot().bands.header.highLevelStatus);
    });

    shellStateHost.setWorkspace('event-planner');
    shellStateHost.selectSystem('blood-system');
    await model.stepPlayback();
    await engineHost.updateActiveRun((draft) => {
      draft.individuals[0].state.substances.glucose.blood = 8.5;
    });

    unsubscribe();

    const snapshot = model.getSnapshot();
    expect(snapshot.workspace.value).toBe('event-planner');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Planner timeline',
      'Lane summary · One-Off',
      'Lane summary · Daily',
      'Lane summary · Alternating Days',
      'Lane summary · Weekly',
      'Next planner actions',
    ]);
    expect(snapshot.bands.midsection.detailCards[0].body).toContain('1 scheduled meal');
    expect(snapshot.bands.midsection.detailCards[2].body).toContain('Repeats every 1d 0h');
    expect(snapshot.bands.midsection.detailCards[2].body).toContain('45.0 g carbs');
    expect(snapshot.bands.footer.playbackTime).toBe(5700);
    expect(snapshot.bands.footer.scrubberStatus).toContain('2 checkpoints');
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 8.5 g');
    expect(viewerEvents).toHaveLength(4);
  });

  it('restores the authoritative run state from recorded history when scrubbing to an exact checkpoint', async () => {
    const run = createSampleRun();
    run.history.checkpoints.push({
      playbackTime: 1800,
      individuals: [
        {
          ...structuredClone(run.individuals[0]),
          state: {
            ...structuredClone(run.individuals[0].state),
            simulatedTime: 1800,
            substances: {
              glucose: {
                gut: 4.2,
                blood: 5.8,
                cells: 8.4,
              },
            },
          },
        },
      ],
    });
    const model = createShellModel({
      engineHost: createStubSession(run),
      shellStateHost: createStubShellStateHost(),
    });

    await model.setPlaybackTime(1800);

    const snapshot = model.getSnapshot();
    expect(snapshot.bands.footer.playbackTime).toBe(1800);
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 5.8 g');
  });

  it('creates a meal through the shell model and immediately surfaces it in the planner snapshot', async () => {
    const model = createShellModel({
      engineHost: createStubSession(createRun({ name: 'Editable Run' })),
      shellStateHost: createStubShellStateHost(),
    });

    model.setWorkspace('event-planner');
    await model.createMealActivity({
      laneId: model.getSnapshot().planner.laneOptions[0]?.id ?? '',
      startMinute: 120,
      durationMinutes: 45,
      carbsGrams: 60,
    });

    const snapshot = model.getSnapshot();
    expect(snapshot.workspace.value).toBe('event-planner');
    expect(snapshot.bands.midsection.detailCards[1].body).toContain('1 scheduled meal');
    expect(snapshot.bands.midsection.detailCards[1].body).toContain('First meal starts at 2h 00m');
    expect(snapshot.planner.laneOptions.map((lane) => lane.label)).toEqual([
      'One-Off',
      'Daily',
      'Alternating Days',
      'Weekly',
    ]);
    expect(snapshot.planner.mealOptions).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        label: 'One-Off · day 0 · 02:00 · 45 min · 60 g carbs',
      }),
    ]);
  });

  it('updates an existing meal through the shell model and immediately surfaces the replacement in the planner snapshot', async () => {
    const model = createShellModel({
      engineHost: createStubSession(createRun({ name: 'Editable Run' })),
      shellStateHost: createStubShellStateHost(),
    });

    model.setWorkspace('event-planner');
    await model.createMealActivity({
      laneId: model.getSnapshot().planner.laneOptions[0]?.id ?? '',
      startMinute: 120,
      durationMinutes: 45,
      carbsGrams: 60,
    });

    const createdMealId = model.getSnapshot().planner.mealOptions[0]?.id;
    const weeklyLaneId = model.getSnapshot().planner.laneOptions.find((lane) => lane.label === 'Weekly')?.id ?? '';

    if (!createdMealId) {
      throw new Error('Expected created meal id');
    }

    await model.updateMealActivity(createdMealId, {
      laneId: weeklyLaneId,
      startMinute: 1590,
      durationMinutes: 30,
      carbsGrams: 25,
    });

    expect(model.getSnapshot().planner.mealOptions).toEqual([
      expect.objectContaining({
        id: createdMealId,
        label: 'Weekly · day 1 · 02:30 · 30 min · 25 g carbs',
      }),
    ]);
  });

  it('removes an existing meal through the shell model and immediately clears it from the planner snapshot', async () => {
    const model = createShellModel({
      engineHost: createStubSession(createRun({ name: 'Editable Run' })),
      shellStateHost: createStubShellStateHost(),
    });

    model.setWorkspace('event-planner');
    await model.createMealActivity({
      laneId: model.getSnapshot().planner.laneOptions[0]?.id ?? '',
      startMinute: 120,
      durationMinutes: 45,
      carbsGrams: 60,
    });

    const createdMealId = model.getSnapshot().planner.mealOptions[0]?.id;

    if (!createdMealId) {
      throw new Error('Expected created meal id');
    }

    await model.removeScheduledActivity(createdMealId);

    expect(model.getSnapshot().planner.mealOptions).toEqual([]);
  });

  it('branches the active run from the selected recorded checkpoint through the authoritative host', async () => {
    const run = createSampleRun();
    run.history.checkpoints.push({
      playbackTime: 1800,
      individuals: [
        {
          ...structuredClone(run.individuals[0]),
          state: {
            ...structuredClone(run.individuals[0].state),
            simulatedTime: 1800,
            substances: {
              glucose: {
                gut: 3.4,
                blood: 5.9,
                cells: 8.8,
              },
            },
          },
        },
      ],
    });
    const model = createShellModel({
      engineHost: createStubSession(run),
      shellStateHost: createStubShellStateHost(),
    });

    await model.branchActiveRunFromPlaybackTime(1800);

    const snapshot = model.getSnapshot();
    expect(snapshot.runName).toBe('Lunch Replay Branch');
    expect(snapshot.bands.footer.playbackTime).toBe(1800);
    expect(snapshot.bands.footer.checkpointTimes).toEqual([1800]);
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 5.9 g');
  });
});
