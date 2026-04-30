import { describe, expect, it } from 'vitest';
import { step } from '../engine/step';
import { createRun } from '../runs/runFactory';
import { createRunRepository, type DocumentStore, type RunRepository } from '../persistence/runRepository';
import { createEngineHost } from './engineHost';

class InMemoryDocumentStore implements DocumentStore {
  private readonly documents = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.documents.get(key) as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.documents.set(key, structuredClone(value));
  }

  async delete(key: string): Promise<void> {
    this.documents.delete(key);
  }

  async list<T>(prefix: string): Promise<Array<{ key: string; value: T }>> {
    return [...this.documents.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, value]) => ({ key, value: structuredClone(value) as T }));
  }
}

class DelayedRunRepository implements RunRepository {
  private activeRun: ReturnType<typeof createRun> | null = null;
  private activeRunId: string | null = null;

  constructor(initialRun: ReturnType<typeof createRun>) {
    this.activeRun = structuredClone(initialRun);
    this.activeRunId = initialRun.id;
  }

  async saveRun(run: ReturnType<typeof createRun>): Promise<void> {
    if (run.activePlaybackTime === 300) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    this.activeRun = structuredClone(run);
  }

  async loadRun(runId: string) {
    if (this.activeRun?.id !== runId) return null;
    return structuredClone(this.activeRun);
  }

  async listRuns() {
    return this.activeRun ? [structuredClone(this.activeRun)] : [];
  }

  async deleteRun(runId: string) {
    if (this.activeRun?.id === runId) {
      this.activeRun = null;
      this.activeRunId = null;
    }
  }

  async setActiveRunId(runId: string | null) {
    this.activeRunId = runId;
  }

  async getActiveRunId() {
    return this.activeRunId;
  }

  async loadActiveRun() {
    if (!this.activeRunId || this.activeRun?.id !== this.activeRunId) {
      return null;
    }
    return structuredClone(this.activeRun);
  }
}

describe('createEngineHost', () => {
  it('restores or creates the authoritative active run and exposes immutable snapshots', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const restoredRun = createRun({ name: 'Restored Run' });
    await repository.saveRun(restoredRun);
    await repository.setActiveRunId(restoredRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    const firstSnapshot = host.getSnapshot();
    const secondSnapshot = host.getSnapshot();

    expect(firstSnapshot.activeRun).toEqual(restoredRun);
    expect(firstSnapshot.activeRun).not.toBe(restoredRun);
    expect(secondSnapshot.activeRun).not.toBe(firstSnapshot.activeRun);
  });

  it('serializes overlapping run updates before persisting them', async () => {
    const initialRun = createRun({ name: 'Queued Run' });
    const repository = new DelayedRunRepository(initialRun);
    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await Promise.all([
      host.updateActiveRun((draft) => {
        draft.activePlaybackTime = 300;
      }),
      host.updateActiveRun((draft) => {
        draft.activePlaybackTime = 600;
      }),
    ]);

    await expect(repository.loadActiveRun()).resolves.toMatchObject({
      activePlaybackTime: 600,
    });
  });

  it('records history checkpoints and restores exact recorded playback snapshots', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'History Run' }),
    });

    await host.updateActiveRun((draft) => {
      draft.activePlaybackTime = 300;
      draft.individuals[0].state.simulatedTime = 300;
      draft.individuals[0].state.substances.glucose.blood = 7.5;
    });
    await host.recordHistoryCheckpoint();

    await host.updateActiveRun((draft) => {
      draft.activePlaybackTime = 600;
      draft.individuals[0].state.simulatedTime = 600;
      draft.individuals[0].state.substances.glucose.blood = 9.1;
    });
    await host.recordHistoryCheckpoint();

    await host.updateActiveRun((draft) => {
      draft.activePlaybackTime = 900;
      draft.individuals[0].state.simulatedTime = 900;
      draft.individuals[0].state.substances.glucose.blood = 11.2;
    });

    await host.restorePlaybackTime(300);

    const snapshot = host.getSnapshot();
    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.individuals[0].state.simulatedTime).toBe(300);
    expect(snapshot.activeRun.individuals[0].state.substances.glucose.blood).toBe(7.5);
    expect(snapshot.activeRun.history.checkpoints.map((checkpoint) => checkpoint.playbackTime)).toEqual([0, 300, 600]);
  });

  it('backfills history for older persisted runs that did not yet have checkpoints', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const legacyRun = createRun({ name: 'Legacy Run' });
    const persistedLegacyRun = { ...legacyRun, history: undefined } as unknown as typeof legacyRun;
    await repository.saveRun(persistedLegacyRun);
    await repository.setActiveRunId(persistedLegacyRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    expect(host.getSnapshot().activeRun.history.checkpoints.map((checkpoint) => checkpoint.playbackTime)).toEqual([0]);
  });

  it('steps playback on the one-minute clock, applying only each active meal minute and persisting minute checkpoints', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const seededRun = createRun({
      name: 'Stepping Run',
      initialMeal: {
        startPlaybackTime: 0,
        durationMinutes: 5,
        carbsGrams: 50,
      },
    });
    const expectedState = structuredClone(seededRun.individuals[0].state);
    for (let minute = 0; minute < 5; minute += 1) {
      expectedState.substances.glucose.gut += 10;
      step(expectedState, 60);
    }
    await repository.saveRun(seededRun);
    await repository.setActiveRunId(seededRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.stepPlayback(300);

    const snapshot = host.getSnapshot();
    const checkpoint = snapshot.activeRun.history.checkpoints.find((entry) => entry.playbackTime === 300);

    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.individuals[0].state).toEqual(expectedState);
    expect(checkpoint?.individuals[0].state).toEqual(expectedState);
    expect(snapshot.activeRun.history.checkpoints.map((entry) => entry.playbackTime)).toEqual([0, 60, 120, 180, 240, 300]);
    await expect(repository.loadActiveRun()).resolves.toMatchObject({
      activePlaybackTime: 300,
      history: {
        checkpoints: [
          expect.objectContaining({ playbackTime: 0 }),
          expect.objectContaining({ playbackTime: 60 }),
          expect.objectContaining({ playbackTime: 120 }),
          expect.objectContaining({ playbackTime: 180 }),
          expect.objectContaining({ playbackTime: 240 }),
          expect.objectContaining({ playbackTime: 300 }),
        ],
      },
    });
  });

  it('resolves repeating cycle-lane meal intervals against the current cycle position on each simulated minute', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const seededRun = createRun({ name: 'Cycle Run' });
    const cycleLane = {
      id: 'cycle-3-minute-lane',
      kind: 'repeating-cycle' as const,
      name: 'Every 3 Minutes',
      cycleDurationMinutes: 3,
    };
    seededRun.scheduleLanes = [
      seededRun.scheduleLanes.find((lane) => lane.kind === 'one-off') ?? seededRun.scheduleLanes[0],
      cycleLane,
    ];
    seededRun.scheduledActivities = [
      {
        id: 'cycle-meal',
        laneId: cycleLane.id,
        type: 'meal',
        startCycleMinute: 1,
        durationMinutes: 2,
        carbsGrams: 20,
      },
    ];

    const expectedState = structuredClone(seededRun.individuals[0].state);
    step(expectedState, 60);
    expectedState.substances.glucose.gut += 10;
    step(expectedState, 60);
    expectedState.substances.glucose.gut += 10;
    step(expectedState, 60);
    step(expectedState, 60);
    expectedState.substances.glucose.gut += 10;
    step(expectedState, 60);

    await repository.saveRun(seededRun);
    await repository.setActiveRunId(seededRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.stepPlayback(300);

    const snapshot = host.getSnapshot();
    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.individuals[0].state).toEqual(expectedState);
  });

  it('creates a planned one-off meal through the authoritative host, rebuilds history, and persists the new schedule', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const seededRun = createRun({ name: 'Planner Edit Run' });
    await repository.saveRun(seededRun);
    await repository.setActiveRunId(seededRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.stepPlayback(300);
    await host.createMealActivity({
      laneId: host.getSnapshot().activeRun.scheduleLanes.find((lane) => lane.kind === 'one-off')?.id ?? '',
      startMinute: 0,
      durationMinutes: 5,
      carbsGrams: 50,
    });

    const snapshot = host.getSnapshot();
    const persistedRun = await repository.loadActiveRun();
    const expectedState = createRun({ name: 'Expected Replay' }).individuals[0].state;
    for (let minute = 0; minute < 5; minute += 1) {
      expectedState.substances.glucose.gut += 10;
      step(expectedState, 60);
    }

    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.scheduledActivities).toEqual([
      expect.objectContaining({
        type: 'meal',
        startPlaybackTime: 0,
        durationMinutes: 5,
        carbsGrams: 50,
      }),
    ]);
    expect(snapshot.activeRun.individuals[0].state).toEqual(expectedState);
    expect(snapshot.activeRun.history.checkpoints.map((entry) => entry.playbackTime)).toEqual([0, 60, 120, 180, 240, 300]);
    expect(persistedRun?.scheduledActivities).toEqual(snapshot.activeRun.scheduledActivities);
    expect(persistedRun?.individuals[0].state).toEqual(expectedState);
  });

  it('edits a planned meal through the authoritative host, replays the active run, and persists the replacement', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const seededRun = createRun({ name: 'Planner Edit Run' });
    const oneOffLane = seededRun.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const weeklyLane = seededRun.scheduleLanes.find(
      (lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 10080,
    );

    if (!oneOffLane || !weeklyLane) {
      throw new Error('Expected one-off and weekly lanes');
    }

    seededRun.scheduledActivities = [{
      id: 'editable-meal',
      laneId: oneOffLane.id,
      type: 'meal',
      startPlaybackTime: 0,
      durationMinutes: 5,
      carbsGrams: 50,
    }];
    await repository.saveRun(seededRun);
    await repository.setActiveRunId(seededRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.stepPlayback(300);
    await host.updateMealActivity('editable-meal', {
      laneId: weeklyLane.id,
      startMinute: 1,
      durationMinutes: 2,
      carbsGrams: 20,
    });

    const snapshot = host.getSnapshot();
    const persistedRun = await repository.loadActiveRun();
    const expectedState = createRun({ name: 'Expected Replay' }).individuals[0].state;
    step(expectedState, 60);
    expectedState.substances.glucose.gut += 10;
    step(expectedState, 60);
    expectedState.substances.glucose.gut += 10;
    step(expectedState, 60);
    step(expectedState, 60);
    step(expectedState, 60);

    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.scheduledActivities).toEqual([
      {
        id: 'editable-meal',
        laneId: weeklyLane.id,
        type: 'meal',
        startCycleMinute: 1,
        durationMinutes: 2,
        carbsGrams: 20,
      },
    ]);
    expect(snapshot.activeRun.individuals[0].state).toEqual(expectedState);
    expect(snapshot.activeRun.history.checkpoints.map((entry) => entry.playbackTime)).toEqual([0, 60, 120, 180, 240, 300]);
    expect(persistedRun?.scheduledActivities).toEqual(snapshot.activeRun.scheduledActivities);
    expect(persistedRun?.individuals[0].state).toEqual(expectedState);
  });

  it('removes a planned meal through the authoritative host, replays the active run, and persists the deletion', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const seededRun = createRun({ name: 'Planner Remove Run' });
    const oneOffLane = seededRun.scheduleLanes.find((lane) => lane.kind === 'one-off');

    if (!oneOffLane) {
      throw new Error('Expected one-off lane');
    }

    seededRun.scheduledActivities = [{
      id: 'removable-meal',
      laneId: oneOffLane.id,
      type: 'meal',
      startPlaybackTime: 0,
      durationMinutes: 5,
      carbsGrams: 50,
    }];
    await repository.saveRun(seededRun);
    await repository.setActiveRunId(seededRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.stepPlayback(300);
    await host.removeScheduledActivity('removable-meal');

    const snapshot = host.getSnapshot();
    const persistedRun = await repository.loadActiveRun();
    const expectedState = createRun({ name: 'Expected Replay' }).individuals[0].state;
    for (let minute = 0; minute < 5; minute += 1) {
      step(expectedState, 60);
    }

    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.scheduledActivities).toEqual([]);
    expect(snapshot.activeRun.individuals[0].state).toEqual(expectedState);
    expect(snapshot.activeRun.history.checkpoints.map((entry) => entry.playbackTime)).toEqual([0, 60, 120, 180, 240, 300]);
    expect(persistedRun?.scheduledActivities).toEqual([]);
    expect(persistedRun?.individuals[0].state).toEqual(snapshot.activeRun.individuals[0].state);
  });

  it('branches the active run from a recorded checkpoint, persists the new run, and switches authority to it', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const sourceRun = createRun({ name: 'Source Run' });
    sourceRun.history.checkpoints.push({
      playbackTime: 300,
      individuals: [
        {
          ...structuredClone(sourceRun.individuals[0]),
          state: {
            ...structuredClone(sourceRun.individuals[0].state),
            simulatedTime: 300,
            substances: {
              glucose: {
                gut: 2.5,
                blood: 7.2,
                cells: 9.4,
              },
            },
          },
        },
      ],
    });
    await repository.saveRun(sourceRun);
    await repository.setActiveRunId(sourceRun.id);

    const host = await createEngineHost({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    await host.branchActiveRunFromPlaybackTime(300, 'Source Run Branch');

    const snapshot = host.getSnapshot();
    const persistedRuns = await repository.listRuns();
    const persistedSourceRun = await repository.loadRun(sourceRun.id);

    expect(snapshot.activeRun.id).not.toBe(sourceRun.id);
    expect(snapshot.activeRun.name).toBe('Source Run Branch');
    expect(snapshot.activeRun.lineage).toEqual({
      parentRunId: sourceRun.id,
      parentCheckpointTime: 300,
      branchedAtPlaybackTime: 300,
    });
    expect(snapshot.activeRun.activePlaybackTime).toBe(300);
    expect(snapshot.activeRun.individuals[0].state.substances.glucose.blood).toBe(7.2);
    expect(snapshot.activeRun.history.checkpoints.map((checkpoint) => checkpoint.playbackTime)).toEqual([300]);
    expect(persistedRuns).toHaveLength(2);
    expect(await repository.getActiveRunId()).toBe(snapshot.activeRun.id);
    expect(persistedSourceRun).toEqual(sourceRun);
  });
});
