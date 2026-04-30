import type { CreateScheduledMealActivityInput, ScheduledMealActivity } from '../../runs/types';

export interface PlannerMealDraft {
  laneId: string;
  day: number;
  timeOfDay: string;
  durationMinutes: number;
  carbsGrams: number;
}

function parseTimeOfDayMinutes(timeOfDay: string): number {
  const [hoursText = '0', minutesText = '0'] = timeOfDay.split(':');
  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function formatTimeOfDay(totalMinutes: number): string {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function createPlannerMealDraft(activity: ScheduledMealActivity): PlannerMealDraft {
  const startMinute = 'startPlaybackTime' in activity ? Math.floor(activity.startPlaybackTime / 60) : activity.startCycleMinute;

  return {
    laneId: activity.laneId,
    day: Math.floor(startMinute / 1440),
    timeOfDay: formatTimeOfDay(startMinute),
    durationMinutes: activity.durationMinutes,
    carbsGrams: activity.carbsGrams,
  };
}

export function createPlannerMealActivityInput(draft: PlannerMealDraft): CreateScheduledMealActivityInput {
  return {
    laneId: draft.laneId,
    startMinute: draft.day * 1440 + parseTimeOfDayMinutes(draft.timeOfDay),
    durationMinutes: draft.durationMinutes,
    carbsGrams: draft.carbsGrams,
  };
}
