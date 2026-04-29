import { createInitialState } from '../engine/state';
import type { CreateRunOptions, IndividualRunState, Run, RunHistory, ScheduleLane } from './types';

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultScheduleLanes(): ScheduleLane[] {
  return [
    { id: createId('lane'), kind: 'daily', name: 'Daily' },
    { id: createId('lane'), kind: 'alternating-days', name: 'Alternating Days' },
    { id: createId('lane'), kind: 'weekly', name: 'Weekly' },
  ];
}

function createDefaultIndividuals(): IndividualRunState[] {
  return [
    {
      id: createId('individual'),
      name: 'Body 1',
      state: createInitialState(),
    },
  ];
}

function createInitialHistory(individuals: IndividualRunState[], playbackTime: number): RunHistory {
  return {
    checkpoints: [
      {
        playbackTime,
        individuals: structuredClone(individuals),
      },
    ],
  };
}

export function ensureRunHistory(run: Run): Run {
  if (run.history?.checkpoints?.length) {
    return run;
  }

  return {
    ...run,
    history: createInitialHistory(run.individuals, run.activePlaybackTime),
  };
}

export function createRun(options: CreateRunOptions): Run {
  const individuals = createDefaultIndividuals();

  return ensureRunHistory({
    id: createId('run'),
    name: options.name,
    individuals,
    scheduleLanes: createDefaultScheduleLanes(),
    activePlaybackTime: 0,
    history: createInitialHistory(individuals, 0),
  });
}
