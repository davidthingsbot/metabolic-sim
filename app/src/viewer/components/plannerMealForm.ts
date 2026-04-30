import type { CreateScheduledMealActivityInput } from '../../runs/types';

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

export function createPlannerMealActivityInput(draft: PlannerMealDraft): CreateScheduledMealActivityInput {
  return {
    laneId: draft.laneId,
    startMinute: draft.day * 1440 + parseTimeOfDayMinutes(draft.timeOfDay),
    durationMinutes: draft.durationMinutes,
    carbsGrams: draft.carbsGrams,
  };
}
