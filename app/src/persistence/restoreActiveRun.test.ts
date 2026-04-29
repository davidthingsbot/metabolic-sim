import { describe, it, expect } from 'vitest';
import { createRun } from '../runs/runFactory';
import { restoreOrCreateActiveRun } from './restoreActiveRun';
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

describe('restoreOrCreateActiveRun', () => {
  it('returns the active run when one is already selected', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Already Active' });
    await repository.saveRun(run);
    await repository.setActiveRunId(run.id);

    const restored = await restoreOrCreateActiveRun({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback' }),
    });

    expect(restored).toEqual(run);
  });

  it('creates, saves, and activates a default run when nothing exists yet', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());

    const restored = await restoreOrCreateActiveRun({
      repository,
      createDefaultRun: () => createRun({ name: 'Recovered Run' }),
    });

    expect(restored.name).toBe('Recovered Run');
    await expect(repository.getActiveRunId()).resolves.toBe(restored.id);
    await expect(repository.loadRun(restored.id)).resolves.toEqual(restored);
  });
});
