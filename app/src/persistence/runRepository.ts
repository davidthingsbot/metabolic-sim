import type { Run } from '../runs/types';

export interface DocumentStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  list<T>(prefix: string): Promise<Array<{ key: string; value: T }>>;
}

const RUN_PREFIX = 'run:';
const ACTIVE_RUN_KEY = 'meta:active-run-id';

function runKey(runId: string): string {
  return `${RUN_PREFIX}${runId}`;
}

export interface RunRepository {
  saveRun(run: Run): Promise<void>;
  loadRun(runId: string): Promise<Run | null>;
  listRuns(): Promise<Run[]>;
  deleteRun(runId: string): Promise<void>;
  setActiveRunId(runId: string | null): Promise<void>;
  getActiveRunId(): Promise<string | null>;
  loadActiveRun(): Promise<Run | null>;
}

export function createRunRepository(store: DocumentStore): RunRepository {
  return {
    async saveRun(run) {
      await store.set(runKey(run.id), run);
    },
    async loadRun(runId) {
      return store.get<Run>(runKey(runId));
    },
    async listRuns() {
      const entries = await store.list<Run>(RUN_PREFIX);
      return entries.map((entry) => entry.value);
    },
    async deleteRun(runId) {
      await store.delete(runKey(runId));
      const activeRunId = await store.get<string>(ACTIVE_RUN_KEY);
      if (activeRunId === runId) {
        await store.delete(ACTIVE_RUN_KEY);
      }
    },
    async setActiveRunId(runId) {
      if (runId === null) {
        await store.delete(ACTIVE_RUN_KEY);
        return;
      }
      await store.set(ACTIVE_RUN_KEY, runId);
    },
    async getActiveRunId() {
      return store.get<string>(ACTIVE_RUN_KEY);
    },
    async loadActiveRun() {
      const activeRunId = await store.get<string>(ACTIVE_RUN_KEY);
      if (!activeRunId) {
        return null;
      }
      return store.get<Run>(runKey(activeRunId));
    },
  };
}
