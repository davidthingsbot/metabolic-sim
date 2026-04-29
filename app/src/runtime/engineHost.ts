import { restoreOrCreateActiveRun } from '../persistence/restoreActiveRun';
import type { RunRepository } from '../persistence/runRepository';
import type { Run } from '../runs/types';

export interface EngineHostSnapshot {
  activeRun: Run;
}

export interface EngineHost {
  getSnapshot(): EngineHostSnapshot;
  subscribe(listener: () => void): () => void;
  updateActiveRun(update: (draft: Run) => void): Promise<void>;
}

export interface CreateEngineHostOptions {
  repository: RunRepository;
  createDefaultRun: () => Run;
}

export async function createEngineHost(options: CreateEngineHostOptions): Promise<EngineHost> {
  let activeRun = await restoreOrCreateActiveRun({
    repository: options.repository,
    createDefaultRun: options.createDefaultRun,
  });
  const listeners = new Set<() => void>();
  let pendingUpdate = Promise.resolve();

  function emit(): void {
    listeners.forEach((listener) => listener());
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
      const nextUpdate = pendingUpdate.then(async () => {
        const draft = structuredClone(activeRun);
        update(draft);
        activeRun = draft;
        await options.repository.saveRun(activeRun);
        emit();
      });

      pendingUpdate = nextUpdate.catch(() => undefined);
      await nextUpdate;
    },
  };
}