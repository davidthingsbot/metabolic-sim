import { describe, expect, it } from 'vitest';
import { getMealCarbsForPlaybackWindow } from './scheduledActivities';
import type { ScheduleLane, ScheduledMealActivity } from './types';

describe('getMealCarbsForPlaybackWindow', () => {
  it('applies one-off meal carbs only during the overlapping absolute window', () => {
    const lane: ScheduleLane = {
      id: 'one-off',
      kind: 'one-off',
      name: 'One-Off',
    };
    const activity: ScheduledMealActivity = {
      id: 'meal-1',
      laneId: lane.id,
      type: 'meal',
      startPlaybackTime: 600,
      durationMinutes: 3,
      carbsGrams: 30,
    };

    expect(getMealCarbsForPlaybackWindow(activity, lane, 540, 60)).toBe(0);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 600, 60)).toBe(10);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 720, 60)).toBe(10);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 780, 60)).toBe(0);
  });

  it('repeats a meal on an arbitrary cycle duration without expanding concrete copies', () => {
    const lane: ScheduleLane = {
      id: 'cycle-3',
      kind: 'repeating-cycle',
      name: 'Every 3 Minutes',
      cycleDurationMinutes: 3,
    };
    const activity: ScheduledMealActivity = {
      id: 'meal-1',
      laneId: lane.id,
      type: 'meal',
      startCycleMinute: 1,
      durationMinutes: 2,
      carbsGrams: 20,
    };

    expect(getMealCarbsForPlaybackWindow(activity, lane, 0, 60)).toBe(0);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 60, 60)).toBe(10);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 120, 60)).toBe(10);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 180, 60)).toBe(0);
    expect(getMealCarbsForPlaybackWindow(activity, lane, 240, 60)).toBe(10);
  });
});
