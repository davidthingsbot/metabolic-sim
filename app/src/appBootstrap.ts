import type { Theme } from './theme';
import type { RunRepository } from './persistence/runRepository';
import type { Run } from './runs/types';
import { createShellModel, type ShellModel } from './models/shellModel';
import { createEngineHost } from './runtime/engineHost';
import { createShellStateHost } from './runtime/shellStateHost';

export interface InitializeShellAppOptions {
  repository: RunRepository;
  createDefaultRun: () => Run;
  initialTheme: Theme;
}

export async function initializeShellApp(options: InitializeShellAppOptions): Promise<ShellModel> {
  const engineHost = await createEngineHost({
    repository: options.repository,
    createDefaultRun: options.createDefaultRun,
  });
  const shellStateHost = createShellStateHost({
    initialTheme: options.initialTheme,
  });

  return createShellModel({
    engineHost,
    shellStateHost,
  });
}
