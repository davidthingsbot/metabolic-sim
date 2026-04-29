import { describe, it, expect } from 'vitest';
import { createRun } from '../runs/runFactory';
import { createRunRepository, type DocumentStore } from './runRepository';

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

describe('run repository', () => {
  it('saves and loads a run by id', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Persistence Test' });

    await repository.saveRun(run);

    await expect(repository.loadRun(run.id)).resolves.toEqual(run);
  });

  it('tracks and restores the active run id', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Active Run Test' });
    await repository.saveRun(run);

    await repository.setActiveRunId(run.id);

    await expect(repository.getActiveRunId()).resolves.toBe(run.id);
    await expect(repository.loadActiveRun()).resolves.toEqual(run);
  });

  it('lists saved runs without losing their names', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const breakfast = createRun({ name: 'Breakfast' });
    const workout = createRun({ name: 'Workout' });

    await repository.saveRun(breakfast);
    await repository.saveRun(workout);

    const runs = await repository.listRuns();

    expect(runs.map((run) => run.name).sort()).toEqual(['Breakfast', 'Workout']);
  });

  it('clears the active run id if that run is deleted', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Delete Active Run Test' });
    await repository.saveRun(run);
    await repository.setActiveRunId(run.id);

    await repository.deleteRun(run.id);

    await expect(repository.getActiveRunId()).resolves.toBeNull();
    await expect(repository.loadActiveRun()).resolves.toBeNull();
  });
});
