import { createInitialState } from '../engine/state';
import type { CreateRunOptions, Run, ScheduleLane } from './types';

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

export function createRun(options: CreateRunOptions): Run {
  return {
    id: createId('run'),
    name: options.name,
    individuals: [
      {
        id: createId('individual'),
        name: 'Body 1',
        state: createInitialState(),
      },
    ],
    scheduleLanes: createDefaultScheduleLanes(),
    activePlaybackTime: 0,
  };
}
