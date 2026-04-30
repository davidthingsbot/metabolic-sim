import type { RepeatingCycleScheduleLane, ScheduleLane, ScheduledActivity, ScheduledMealActivity } from './types';

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
