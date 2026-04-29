import { describe, expect, it } from 'vitest';
import { createRun } from './runs/runFactory';
import { initializeShellApp } from './appBootstrap';
import { createRunRepository, type DocumentStore } from './persistence/runRepository';

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

describe('initializeShellApp', () => {
  it('restores the active run and default shell selections', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Restored Run' });
    await repository.saveRun(run);
    await repository.setActiveRunId(run.id);

    const shell = await initializeShellApp({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
    });

    expect(shell.activeRun).toEqual(run);
    expect(shell.workspace).toBe('body-status');
    expect(shell.selectedSystemId).toBe('whole-body');
  });

  it('creates and activates a default run when nothing is persisted yet', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());

    const shell = await initializeShellApp({
      repository,
      createDefaultRun: () => createRun({ name: 'My First Run' }),
    });

    expect(shell.activeRun.name).toBe('My First Run');
    await expect(repository.getActiveRunId()).resolves.toBe(shell.activeRun.id);
  });
});
