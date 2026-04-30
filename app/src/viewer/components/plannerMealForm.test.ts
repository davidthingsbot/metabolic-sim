import { describe, expect, it } from 'vitest';
import type { ScheduledMealActivity } from '../../runs/types';
import { createPlannerMealActivityInput, createPlannerMealDraft } from './plannerMealForm';

describe('createPlannerMealActivityInput', () => {
  it('converts a one-off planner draft into absolute playback minutes', () => {
    expect(createPlannerMealActivityInput({
      laneId: 'one-off-lane',
      day: 1,
      timeOfDay: '02:30',
      durationMinutes: 45,
      carbsGrams: 60,
    })).toEqual({
      laneId: 'one-off-lane',
      startMinute: 1590,
      durationMinutes: 45,
      carbsGrams: 60,
    });
  });

  it('treats cycle placement the same minute-based way for repeating lanes', () => {
    expect(createPlannerMealActivityInput({
      laneId: 'weekly-lane',
      day: 3,
      timeOfDay: '07:15',
      durationMinutes: 30,
      carbsGrams: 25,
    })).toEqual({
      laneId: 'weekly-lane',
      startMinute: 4755,
      durationMinutes: 30,
      carbsGrams: 25,
    });
  });

  it('builds an editable planner draft from an existing one-off scheduled meal', () => {
    const meal: ScheduledMealActivity = {
      id: 'meal-1',
      laneId: 'one-off-lane',
      type: 'meal',
      startPlaybackTime: 1590 * 60,
      durationMinutes: 45,
      carbsGrams: 60,
    };

    expect(createPlannerMealDraft(meal)).toEqual({
      laneId: 'one-off-lane',
      day: 1,
      timeOfDay: '02:30',
      durationMinutes: 45,
      carbsGrams: 60,
    });
  });

  it('builds an editable planner draft from an existing repeating scheduled meal', () => {
    const meal: ScheduledMealActivity = {
      id: 'meal-1',
      laneId: 'weekly-lane',
      type: 'meal',
      startCycleMinute: 4755,
      durationMinutes: 30,
      carbsGrams: 25,
    };

    expect(createPlannerMealDraft(meal)).toEqual({
      laneId: 'weekly-lane',
      day: 3,
      timeOfDay: '07:15',
      durationMinutes: 30,
      carbsGrams: 25,
    });
  });
});
