import { restoreOrCreateActiveRun } from '../persistence/restoreActiveRun';
import type { RunRepository } from '../persistence/runRepository';
import { ensureRunHistory } from '../runs/runFactory';
import type { Run, RunHistoryCheckpoint } from '../runs/types';

export interface EngineHostSnapshot {
  activeRun: Run;
}

export interface EngineHost {
  getSnapshot(): EngineHostSnapshot;
  subscribe(listener: () => void): () => void;
  updateActiveRun(update: (draft: Run) => void): Promise<void>;
  recordHistoryCheckpoint(playbackTime?: number): Promise<void>;
  restorePlaybackTime(playbackTime: number): Promise<void>;
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
    async stepPlayback(stepSeconds = 300) {
      await commit((draft) => {
        const nextPlaybackTime = draft.activePlaybackTime + stepSeconds;
        draft.activePlaybackTime = nextPlaybackTime;
        draft.individuals = draft.individuals.map((individual) => ({
          ...individual,
          state: {
            ...individual.state,
            simulatedTime: nextPlaybackTime,
          },
        }));
        upsertHistoryCheckpoint(draft, nextPlaybackTime);
      });
    },
  };
}
