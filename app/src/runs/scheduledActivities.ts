import type {
  CreateScheduledMealActivityInput,
  RepeatingCycleScheduleLane,
  Run,
  ScheduleLane,
  ScheduledActivity,
  ScheduledMealActivity,
  UpdateScheduledMealActivityInput,
} from './types';

function createScheduledActivityId(): string {
  return `activity-${Math.random().toString(36).slice(2, 10)}`;
}

function hasStartPlaybackTime(activity: ScheduledActivity): activity is ScheduledMealActivity & { startPlaybackTime: number } {
  return 'startPlaybackTime' in activity;
}

function activityDurationSeconds(activity: ScheduledActivity): number {
  return activity.durationMinutes * 60;
}

function calculateOverlapSeconds(activityStartPlaybackTime: number, activityDuration: number, windowStartPlaybackTime: number, windowEndPlaybackTime: number): number {
  const overlapStart = Math.max(windowStartPlaybackTime, activityStartPlaybackTime);
  const overlapEnd = Math.min(windowEndPlaybackTime, activityStartPlaybackTime + activityDuration);
  return Math.max(overlapEnd - overlapStart, 0);
}

function calculateOneOffOverlapSeconds(
  activity: ScheduledMealActivity & { startPlaybackTime: number },
  windowStartPlaybackTime: number,
  windowEndPlaybackTime: number,
): number {
  return calculateOverlapSeconds(activity.startPlaybackTime, activityDurationSeconds(activity), windowStartPlaybackTime, windowEndPlaybackTime);
}

function calculateRepeatingOverlapSeconds(
  activity: ScheduledMealActivity & { startCycleMinute: number },
  lane: RepeatingCycleScheduleLane,
  windowStartPlaybackTime: number,
  windowEndPlaybackTime: number,
): number {
  const cycleDurationSeconds = lane.cycleDurationMinutes * 60;
  const activityStartOffsetSeconds = activity.startCycleMinute * 60;
  const durationSeconds = activityDurationSeconds(activity);
  const firstCycleIndex = Math.max(Math.floor((windowStartPlaybackTime - activityStartOffsetSeconds) / cycleDurationSeconds) - 1, 0);
  const lastCycleIndex = Math.max(Math.floor((windowEndPlaybackTime - activityStartOffsetSeconds) / cycleDurationSeconds) + 1, 0);
  let overlapSeconds = 0;

  for (let cycleIndex = firstCycleIndex; cycleIndex <= lastCycleIndex; cycleIndex += 1) {
    const occurrenceStartPlaybackTime = cycleIndex * cycleDurationSeconds + activityStartOffsetSeconds;
    overlapSeconds += calculateOverlapSeconds(
      occurrenceStartPlaybackTime,
      durationSeconds,
      windowStartPlaybackTime,
      windowEndPlaybackTime,
    );
  }

  return overlapSeconds;
}

export function getScheduledMealActivities(activities: ScheduledActivity[]): ScheduledMealActivity[] {
  return activities.filter((activity): activity is ScheduledMealActivity => activity.type === 'meal');
}

export function appendScheduledMealActivity(run: Run, input: CreateScheduledMealActivityInput): ScheduledMealActivity {
  const lane = run.scheduleLanes.find((candidate) => candidate.id === input.laneId);

  if (!lane) {
    throw new Error(`Cannot create meal for missing lane ${input.laneId}`);
  }

  const scheduledMealActivity: ScheduledMealActivity = lane.kind === 'repeating-cycle'
    ? {
        id: createScheduledActivityId(),
        laneId: lane.id,
        type: 'meal',
        startCycleMinute: ((input.startMinute % lane.cycleDurationMinutes) + lane.cycleDurationMinutes) % lane.cycleDurationMinutes,
        durationMinutes: input.durationMinutes,
        carbsGrams: input.carbsGrams,
      }
    : {
        id: createScheduledActivityId(),
        laneId: lane.id,
        type: 'meal',
        startPlaybackTime: input.startMinute * 60,
        durationMinutes: input.durationMinutes,
        carbsGrams: input.carbsGrams,
      };

  run.scheduledActivities.push(scheduledMealActivity);
  return scheduledMealActivity;
}

export function replaceScheduledMealActivity(run: Run, activityId: string, input: UpdateScheduledMealActivityInput): ScheduledMealActivity {
  const activityIndex = run.scheduledActivities.findIndex((activity) => activity.id === activityId);

  if (activityIndex < 0) {
    throw new Error(`Cannot update missing activity ${activityId}`);
  }

  const scratchRun: Run = {
    ...run,
    scheduledActivities: [],
  };
  const nextActivity = appendScheduledMealActivity(scratchRun, input);
  nextActivity.id = activityId;
  run.scheduledActivities[activityIndex] = nextActivity;
  return nextActivity;
}

export function removeScheduledActivity(run: Run, activityId: string): void {
  const activityIndex = run.scheduledActivities.findIndex((activity) => activity.id === activityId);

  if (activityIndex < 0) {
    throw new Error(`Cannot remove missing activity ${activityId}`);
  }

  run.scheduledActivities.splice(activityIndex, 1);
}

export function getMealCarbsForPlaybackWindow(
  activity: ScheduledMealActivity,
  lane: ScheduleLane,
  windowStartPlaybackTime: number,
  windowDurationSeconds: number,
): number {
  const windowEndPlaybackTime = windowStartPlaybackTime + windowDurationSeconds;
  const durationSeconds = activityDurationSeconds(activity);

  if (durationSeconds <= 0) {
    return 0;
  }

  const overlapSeconds = hasStartPlaybackTime(activity)
    ? calculateOneOffOverlapSeconds(activity, windowStartPlaybackTime, windowEndPlaybackTime)
    : lane.kind === 'repeating-cycle'
      ? calculateRepeatingOverlapSeconds(activity, lane, windowStartPlaybackTime, windowEndPlaybackTime)
      : 0;

  if (overlapSeconds <= 0) {
    return 0;
  }

  return (activity.carbsGrams * overlapSeconds) / durationSeconds;
}
