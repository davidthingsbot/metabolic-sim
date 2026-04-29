import { restoreOrCreateActiveRun } from './persistence/restoreActiveRun';
import type { RunRepository } from './persistence/runRepository';
import type { Run } from './runs/types';
import type { SystemId, Workspace } from './shellViewModel';

export interface ShellAppState {
  activeRun: Run;
  workspace: Workspace;
  selectedSystemId: SystemId;
}

export interface InitializeShellAppOptions {
  repository: RunRepository;
  createDefaultRun: () => Run;
}

export async function initializeShellApp(
  options: InitializeShellAppOptions,
): Promise<ShellAppState> {
  const activeRun = await restoreOrCreateActiveRun({
    repository: options.repository,
    createDefaultRun: options.createDefaultRun,
  });

  return {
    activeRun,
    workspace: 'body-status',
    selectedSystemId: 'whole-body',
  };
}
