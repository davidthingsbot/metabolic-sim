import { createInitialState } from '../engine/state';
import type {
  CreateRunOptions,
  IndividualRunState,
  Run,
  RunHistory,
  ScheduleLane,
  ScheduledActivity,
  ScheduledMealActivity,
} from './types';

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

function createScheduledMealActivity(laneId: string, options: NonNullable<CreateRunOptions['initialMeal']>): ScheduledMealActivity {
  return {
    id: createId('activity'),
    laneId,
    type: 'meal',
    startPlaybackTime: options.startPlaybackTime,
    durationMinutes: options.durationMinutes,
    carbsGrams: options.carbsGrams,
  };
}

function createDefaultIndividuals(): IndividualRunState[] {
  const state = createInitialState();
  return [
    {
      id: createId('individual'),
      name: 'Body 1',
      state,
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
  const scheduledActivities = Array.isArray(run.scheduledActivities) ? run.scheduledActivities : [];

  if (run.history?.checkpoints?.length) {
    return {
      ...run,
      scheduledActivities,
    };
  }

  return {
    ...run,
    scheduledActivities,
    history: createInitialHistory(run.individuals, run.activePlaybackTime),
  };
}

export function createRun(options: CreateRunOptions): Run {
  const scheduleLanes = createDefaultScheduleLanes();
  const individuals = createDefaultIndividuals();
  const scheduledActivities: ScheduledActivity[] = options.initialMeal
    ? [createScheduledMealActivity(scheduleLanes[0].id, options.initialMeal)]
    : [];

  return ensureRunHistory({
    id: createId('run'),
    name: options.name,
    individuals,
    scheduleLanes,
    scheduledActivities,
    activePlaybackTime: 0,
    history: createInitialHistory(individuals, 0),
  });
}
