import type { Run } from '../runs/types';
import type { RunRepository } from './runRepository';

export interface RestoreOrCreateActiveRunOptions {
  repository: RunRepository;
  createDefaultRun: () => Run;
}

export async function restoreOrCreateActiveRun(
  options: RestoreOrCreateActiveRunOptions,
): Promise<Run> {
  const existingActiveRun = await options.repository.loadActiveRun();
  if (existingActiveRun) {
    return existingActiveRun;
  }

  const createdRun = options.createDefaultRun();
  await options.repository.saveRun(createdRun);
  await options.repository.setActiveRunId(createdRun.id);
  return createdRun;
}
