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
  it('restores the active run into a viewer-facing shell model', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());
    const run = createRun({ name: 'Restored Run' });
    await repository.saveRun(run);
    await repository.setActiveRunId(run.id);

    const model = await initializeShellApp({
      repository,
      createDefaultRun: () => createRun({ name: 'Fallback Run' }),
      initialTheme: 'dark',
    });

    const snapshot = model.getSnapshot();

    expect(snapshot.runName).toBe('Restored Run');
    expect(snapshot.workspace.value).toBe('body-status');
    expect(snapshot.systems.find((system) => system.id === 'whole-body')?.isSelected).toBe(true);
    expect(snapshot.bands.header.themeToggleLabel).toBe('Light mode');
  });

  it('creates and activates a default run when nothing is persisted yet', async () => {
    const repository = createRunRepository(new InMemoryDocumentStore());

    const model = await initializeShellApp({
      repository,
      createDefaultRun: () => createRun({ name: 'My First Run' }),
      initialTheme: 'light',
    });

    const snapshot = model.getSnapshot();

    expect(snapshot.runName).toBe('My First Run');
    await expect(repository.loadActiveRun()).resolves.toMatchObject({ name: 'My First Run' });
  });
});
