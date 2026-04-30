import { createInitialState } from '../engine/state';
import type {
  CreateScheduleLaneInput,
  CreateRunOptions,
  IndividualRunState,
  LegacyScheduleLaneKind,
  Run,
  RunHistory,
  ScheduleLane,
  ScheduledActivity,
  ScheduledMealActivity,
} from './types';

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const LEGACY_CYCLE_DURATION_MINUTES: Record<LegacyScheduleLaneKind, number> = {
  daily: 1440,
  'alternating-days': 2880,
  weekly: 10080,
};

function createDefaultScheduleLanes(): ScheduleLane[] {
  return [
    { id: createId('lane'), kind: 'one-off', name: 'One-Off' },
    { id: createId('lane'), kind: 'repeating-cycle', name: 'Daily', cycleDurationMinutes: 1440 },
  ];
}

function formatCustomLaneName(durationMinutes: number): string {
  const days = Math.floor(durationMinutes / 1440);
  const hours = Math.floor((durationMinutes % 1440) / 60);

  if (days > 0 && hours > 0) {
    return `Custom · ${days} day${days === 1 ? '' : 's'} ${hours}h`;
  }

  if (days > 0) {
    return `Custom · ${days} day${days === 1 ? '' : 's'}`;
  }

  return `Custom · ${Math.max(durationMinutes, 1)} min`;
}

export function appendScheduleLane(run: Run, input: CreateScheduleLaneInput): ScheduleLane {
  const lane: ScheduleLane = {
    id: createId('lane'),
    kind: 'repeating-cycle',
    name: formatCustomLaneName(input.durationMinutes),
    cycleDurationMinutes: input.durationMinutes,
  };
  run.scheduleLanes.push(lane);
  return lane;
}

function normalizeCycleMinute(startPlaybackTime: number, cycleDurationMinutes: number): number {
  const startMinute = Math.floor(startPlaybackTime / 60);
  const normalizedMinute = startMinute % cycleDurationMinutes;
  return normalizedMinute >= 0 ? normalizedMinute : normalizedMinute + cycleDurationMinutes;
}

function createScheduledMealActivity(laneId: string, options: NonNullable<CreateRunOptions['initialMeal']>): ScheduledMealActivity {
  return {
    id: createId('activity'),
    laneId,
    type: 'meal',
    startCycleMinute: normalizeCycleMinute(options.startPlaybackTime, 1440),
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

function normalizeScheduleLanes(scheduleLanes: unknown): ScheduleLane[] {
  const normalizedScheduleLanes = Array.isArray(scheduleLanes)
    ? scheduleLanes
        .map((lane): ScheduleLane | null => {
          if (!lane || typeof lane !== 'object') {
            return null;
          }

          const candidate = lane as Record<string, unknown>;
          if (candidate.kind === 'one-off' && typeof candidate.id === 'string' && typeof candidate.name === 'string') {
            return { id: candidate.id, kind: 'one-off', name: candidate.name };
          }

          if (
            candidate.kind === 'repeating-cycle'
            && typeof candidate.id === 'string'
            && typeof candidate.name === 'string'
            && typeof candidate.cycleDurationMinutes === 'number'
          ) {
            return {
              id: candidate.id,
              kind: 'repeating-cycle',
              name: candidate.name,
              cycleDurationMinutes: candidate.cycleDurationMinutes,
            };
          }

          if (
            (candidate.kind === 'daily' || candidate.kind === 'alternating-days' || candidate.kind === 'weekly')
            && typeof candidate.id === 'string'
            && typeof candidate.name === 'string'
          ) {
            return {
              id: candidate.id,
              kind: 'repeating-cycle',
              name: candidate.name,
              cycleDurationMinutes: LEGACY_CYCLE_DURATION_MINUTES[candidate.kind],
            };
          }

          return null;
        })
        .filter((lane): lane is ScheduleLane => lane !== null)
    : [];

  if (!normalizedScheduleLanes.length) {
    return createDefaultScheduleLanes();
  }

  if (normalizedScheduleLanes.some((lane) => lane.kind === 'one-off')) {
    return normalizedScheduleLanes;
  }

  return [...normalizedScheduleLanes, { id: createId('lane'), kind: 'one-off', name: 'One-Off' }];
}

function normalizeScheduledActivities(scheduleLanes: ScheduleLane[], scheduledActivities: unknown): ScheduledActivity[] {
  const oneOffLane = scheduleLanes.find((lane) => lane.kind === 'one-off');
  const laneById = new Map(scheduleLanes.map((lane) => [lane.id, lane]));

  if (!Array.isArray(scheduledActivities)) {
    return [];
  }

  return scheduledActivities.flatMap((activity): ScheduledActivity[] => {
    if (!activity || typeof activity !== 'object') {
      return [];
    }

    const candidate = activity as Record<string, unknown>;
    if (
      candidate.type !== 'meal'
      || typeof candidate.id !== 'string'
      || typeof candidate.laneId !== 'string'
      || typeof candidate.durationMinutes !== 'number'
      || typeof candidate.carbsGrams !== 'number'
    ) {
      return [];
    }

    const lane = laneById.get(candidate.laneId);
    if (typeof candidate.startCycleMinute === 'number') {
      if (!lane || lane.kind !== 'repeating-cycle') {
        return [];
      }

      return [{
        id: candidate.id,
        laneId: candidate.laneId,
        type: 'meal',
        startCycleMinute: candidate.startCycleMinute,
        durationMinutes: candidate.durationMinutes,
        carbsGrams: candidate.carbsGrams,
      }];
    }

    if (typeof candidate.startPlaybackTime !== 'number') {
      return [];
    }

    if (lane?.kind === 'repeating-cycle') {
      return [{
        id: candidate.id,
        laneId: candidate.laneId,
        type: 'meal',
        startCycleMinute: normalizeCycleMinute(candidate.startPlaybackTime, lane.cycleDurationMinutes),
        durationMinutes: candidate.durationMinutes,
        carbsGrams: candidate.carbsGrams,
      }];
    }

    return [{
      id: candidate.id,
      laneId: lane?.id ?? oneOffLane?.id ?? candidate.laneId,
      type: 'meal',
      startPlaybackTime: candidate.startPlaybackTime,
      durationMinutes: candidate.durationMinutes,
      carbsGrams: candidate.carbsGrams,
    }];
  });
}

export function ensureRunHistory(run: Run): Run {
  const scheduleLanes = normalizeScheduleLanes(run.scheduleLanes);
  const scheduledActivities = normalizeScheduledActivities(scheduleLanes, run.scheduledActivities);

  if (run.history?.checkpoints?.length) {
    return {
      ...run,
      scheduleLanes,
      scheduledActivities,
    };
  }

  return {
    ...run,
    scheduleLanes,
    scheduledActivities,
    history: createInitialHistory(run.individuals, run.activePlaybackTime),
  };
}

export function createRun(options: CreateRunOptions): Run {
  const scheduleLanes = createDefaultScheduleLanes();
  const individuals = createDefaultIndividuals();
  const defaultRepeatingLane = scheduleLanes.find((lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 1440);

  if (!defaultRepeatingLane || defaultRepeatingLane.kind !== 'repeating-cycle') {
    throw new Error('Expected a default daily repeating lane');
  }

  const scheduledActivities: ScheduledActivity[] = options.initialMeal
    ? [createScheduledMealActivity(defaultRepeatingLane.id, options.initialMeal)]
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
