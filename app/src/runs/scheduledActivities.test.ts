import { describe, expect, it } from 'vitest';
import { createRun } from './runFactory';
import {
  appendScheduledMealActivity,
  getMealCarbsForPlaybackWindow,
  removeScheduledActivity,
  replaceScheduledMealActivity,
} from './scheduledActivities';
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

  it('appends one-off and repeating planned meals in the authoritative lane format', () => {
    const run = createRun({ name: 'Append Test' });
    run.scheduleLanes.push({
      id: 'lane-custom-2d',
      kind: 'repeating-cycle',
      name: 'Custom · 2 days',
      cycleDurationMinutes: 2880,
    });
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const customLane = run.scheduleLanes.find(
      (lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 2880,
    );

    if (!oneOffLane || !customLane || customLane.kind !== 'repeating-cycle') {
      throw new Error('Expected one-off and custom lanes');
    }

    const oneOffMeal = appendScheduledMealActivity(run, {
      laneId: oneOffLane.id,
      startMinute: 150,
      durationMinutes: 45,
      carbsGrams: 60,
    });
    const repeatingMeal = appendScheduledMealActivity(run, {
      laneId: customLane.id,
      startMinute: 1590,
      durationMinutes: 30,
      carbsGrams: 25,
    });

    expect(oneOffMeal).toEqual(expect.objectContaining({ startPlaybackTime: 9000 }));
    expect(repeatingMeal).toEqual(expect.objectContaining({ startCycleMinute: 1590 }));
    expect(run.scheduledActivities).toEqual([oneOffMeal, repeatingMeal]);
  });

  it('replaces an existing meal in-place while re-resolving its lane placement format', () => {
    const run = createRun({ name: 'Replace Test' });
    run.scheduleLanes.push({
      id: 'lane-custom-2d',
      kind: 'repeating-cycle',
      name: 'Custom · 2 days',
      cycleDurationMinutes: 2880,
    });
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const customLane = run.scheduleLanes.find(
      (lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 2880,
    );

    if (!oneOffLane || !customLane || customLane.kind !== 'repeating-cycle') {
      throw new Error('Expected one-off and custom lanes');
    }

    const meal = appendScheduledMealActivity(run, {
      laneId: oneOffLane.id,
      startMinute: 150,
      durationMinutes: 45,
      carbsGrams: 60,
    });

    const replacedMeal = replaceScheduledMealActivity(run, meal.id, {
      laneId: customLane.id,
      startMinute: 1590,
      durationMinutes: 30,
      carbsGrams: 25,
    });

    expect(replacedMeal).toEqual({
      id: meal.id,
      laneId: customLane.id,
      type: 'meal',
      startCycleMinute: 1590,
      durationMinutes: 30,
      carbsGrams: 25,
    });
    expect(run.scheduledActivities).toEqual([replacedMeal]);
  });

  it('removes an existing scheduled activity by id', () => {
    const run = createRun({ name: 'Remove Test' });
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');

    if (!oneOffLane) {
      throw new Error('Expected one-off lane');
    }

    const meal = appendScheduledMealActivity(run, {
      laneId: oneOffLane.id,
      startMinute: 150,
      durationMinutes: 45,
      carbsGrams: 60,
    });

    removeScheduledActivity(run, meal.id);

    expect(run.scheduledActivities).toEqual([]);
  });
});
