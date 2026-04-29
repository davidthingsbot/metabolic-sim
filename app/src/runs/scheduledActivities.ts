import type { ScheduledActivity, ScheduledMealActivity } from './types';

function activityEndPlaybackTime(activity: ScheduledActivity): number {
  return activity.startPlaybackTime + activity.durationMinutes * 60;
}

function calculateOverlapSeconds(activity: ScheduledActivity, windowStartPlaybackTime: number, windowEndPlaybackTime: number): number {
  const overlapStart = Math.max(windowStartPlaybackTime, activity.startPlaybackTime);
  const overlapEnd = Math.min(windowEndPlaybackTime, activityEndPlaybackTime(activity));
  return Math.max(overlapEnd - overlapStart, 0);
}

export function getScheduledMealActivities(activities: ScheduledActivity[]): ScheduledMealActivity[] {
  return activities.filter((activity): activity is ScheduledMealActivity => activity.type === 'meal');
}

export function getMealCarbsForPlaybackWindow(
  activity: ScheduledMealActivity,
  windowStartPlaybackTime: number,
  windowDurationSeconds: number,
): number {
  const windowEndPlaybackTime = windowStartPlaybackTime + windowDurationSeconds;
  const overlapSeconds = calculateOverlapSeconds(activity, windowStartPlaybackTime, windowEndPlaybackTime);
  const activityDurationSeconds = activity.durationMinutes * 60;

  if (activityDurationSeconds <= 0 || overlapSeconds <= 0) {
    return 0;
  }

  return (activity.carbsGrams * overlapSeconds) / activityDurationSeconds;
}
