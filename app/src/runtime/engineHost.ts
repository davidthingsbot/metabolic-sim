import { restoreOrCreateActiveRun } from '../persistence/restoreActiveRun';
import { applyEvent } from '../engine/events';
import { step } from '../engine/step';
import type { RunRepository } from '../persistence/runRepository';
import { branchRunFromSnapshot } from '../runs/branchRun';
import { ensureRunHistory } from '../runs/runFactory';
import { replayRunToPlaybackTime } from '../runs/replayRun';
import { appendScheduledMealActivity, getMealCarbsForPlaybackWindow, getScheduledMealActivities, removeScheduledActivity, replaceScheduledMealActivity } from '../runs/scheduledActivities';
import type { CreateScheduledMealActivityInput, Run, RunHistoryCheckpoint, UpdateScheduledMealActivityInput } from '../runs/types';

export interface EngineHostSnapshot {
  activeRun: Run;
}

export interface EngineHost {
  getSnapshot(): EngineHostSnapshot;
  subscribe(listener: () => void): () => void;
  updateActiveRun(update: (draft: Run) => void): Promise<void>;
  createMealActivity(input: CreateScheduledMealActivityInput): Promise<void>;
  updateMealActivity(activityId: string, input: UpdateScheduledMealActivityInput): Promise<void>;
  removeScheduledActivity(activityId: string): Promise<void>;
  recordHistoryCheckpoint(playbackTime?: number): Promise<void>;
  restorePlaybackTime(playbackTime: number): Promise<void>;
  branchActiveRunFromPlaybackTime(playbackTime: number, runName?: string): Promise<void>;
  stepPlayback(stepSeconds?: number): Promise<void>;
}

export interface CreateEngineHostOptions {
  repository: RunRepository;
  createDefaultRun: () => Run;
}

function createHistoryCheckpoint(run: Run, playbackTime: number): RunHistoryCheckpoint {
  return {
    playbackTime,
    individuals: structuredClone(run.individuals),
  };
}

function upsertHistoryCheckpoint(run: Run, playbackTime: number): void {
  const existingIndex = run.history.checkpoints.findIndex((checkpoint) => checkpoint.playbackTime === playbackTime);
  const nextCheckpoint = createHistoryCheckpoint(run, playbackTime);

  if (existingIndex >= 0) {
    run.history.checkpoints[existingIndex] = nextCheckpoint;
    return;
  }

  run.history.checkpoints.push(nextCheckpoint);
  run.history.checkpoints.sort((left, right) => left.playbackTime - right.playbackTime);
}

function restoreCheckpoint(run: Run, playbackTime: number): boolean {
  const checkpoint = run.history.checkpoints.find((entry) => entry.playbackTime === playbackTime);
  run.activePlaybackTime = playbackTime;

  if (!checkpoint) {
    return false;
  }

  run.individuals = structuredClone(checkpoint.individuals);
  return true;
}

function applyScheduledActivitiesForPlaybackWindow(run: Run, playbackTime: number, stepSeconds: number): void {
  const mealActivities = getScheduledMealActivities(run.scheduledActivities);
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));

  if (!mealActivities.length) {
    return;
  }

  run.individuals.forEach((individual) => {
    mealActivities.forEach((activity) => {
      const lane = laneById.get(activity.laneId);
      if (!lane) {
        return;
      }

      const carbsGrams = getMealCarbsForPlaybackWindow(activity, lane, playbackTime, stepSeconds);
      if (carbsGrams > 0) {
        applyEvent(individual.state, { type: 'meal', carbsGrams });
      }
    });
  });
}

export async function createEngineHost(options: CreateEngineHostOptions): Promise<EngineHost> {
  const restoredRun = await restoreOrCreateActiveRun({
    repository: options.repository,
    createDefaultRun: options.createDefaultRun,
  });
  let activeRun = ensureRunHistory(restoredRun);
  if (!restoredRun.history?.checkpoints?.length) {
    await options.repository.saveRun(activeRun);
  }
  const listeners = new Set<() => void>();
  let pendingUpdate = Promise.resolve();

  function emit(): void {
    listeners.forEach((listener) => listener());
  }

  async function commit(update: (draft: Run) => void): Promise<void> {
    const nextUpdate = pendingUpdate.then(async () => {
      const draft = ensureRunHistory(structuredClone(activeRun));
      update(draft);
      activeRun = draft;
      await options.repository.saveRun(activeRun);
      emit();
    });

    pendingUpdate = nextUpdate.catch(() => undefined);
    await nextUpdate;
  }

  async function replaceActiveRun(nextRun: Run): Promise<void> {
    const nextUpdate = pendingUpdate.then(async () => {
      activeRun = ensureRunHistory(structuredClone(nextRun));
      await options.repository.saveRun(activeRun);
      await options.repository.setActiveRunId(activeRun.id);
      emit();
    });

    pendingUpdate = nextUpdate.catch(() => undefined);
    await nextUpdate;
  }

  return {
    getSnapshot() {
      return {
        activeRun: structuredClone(activeRun),
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async updateActiveRun(update) {
      await commit(update);
    },
    async createMealActivity(input) {
      await commit((draft) => {
        const targetPlaybackTime = draft.activePlaybackTime;
        appendScheduledMealActivity(draft, input);
        replayRunToPlaybackTime(draft, targetPlaybackTime);
      });
    },
    async updateMealActivity(activityId, input) {
      await commit((draft) => {
        const targetPlaybackTime = draft.activePlaybackTime;
        replaceScheduledMealActivity(draft, activityId, input);
        replayRunToPlaybackTime(draft, targetPlaybackTime);
      });
    },
    async removeScheduledActivity(activityId) {
      await commit((draft) => {
        const targetPlaybackTime = draft.activePlaybackTime;
        removeScheduledActivity(draft, activityId);
        replayRunToPlaybackTime(draft, targetPlaybackTime);
      });
    },
    async recordHistoryCheckpoint(playbackTime = activeRun.activePlaybackTime) {
      await commit((draft) => {
        draft.activePlaybackTime = playbackTime;
        upsertHistoryCheckpoint(draft, playbackTime);
      });
    },
    async restorePlaybackTime(playbackTime) {
      await commit((draft) => {
        if (restoreCheckpoint(draft, playbackTime)) {
          return;
        }
      });
    },
    async branchActiveRunFromPlaybackTime(playbackTime, runName) {
      const nextRun = branchRunFromSnapshot({
        sourceRun: activeRun,
        branchedName: runName ?? `${activeRun.name} Branch`,
        snapshotTime: playbackTime,
      });
      await replaceActiveRun(nextRun);
    },
    async stepPlayback(stepSeconds = 300) {
      await commit((draft) => {
        let remainingStepSeconds = stepSeconds;

        while (remainingStepSeconds > 0) {
          const minuteStepSeconds = Math.min(60, remainingStepSeconds);
          applyScheduledActivitiesForPlaybackWindow(draft, draft.activePlaybackTime, minuteStepSeconds);

          draft.individuals.forEach((individual) => {
            step(individual.state, minuteStepSeconds);
          });

          draft.activePlaybackTime += minuteStepSeconds;
          upsertHistoryCheckpoint(draft, draft.activePlaybackTime);
          remainingStepSeconds -= minuteStepSeconds;
        }
      });
    },
  };
}
