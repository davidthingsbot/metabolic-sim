import { describe, it, expect } from 'vitest';
import { createRun, ensureRunHistory } from './runFactory';

describe('createRun', () => {
  it('creates a named run with one default individual', () => {
    const run = createRun({ name: 'Single Hamburger' });

    expect(run.name).toBe('Single Hamburger');
    expect(run.individuals).toHaveLength(1);
    expect(run.individuals[0].id).toBeTruthy();
    expect(run.individuals[0].state.simulatedTime).toBe(0);
    expect(run.activePlaybackTime).toBe(0);
    expect(run.history.checkpoints).toEqual([
      {
        playbackTime: 0,
        individuals: run.individuals,
      },
    ]);
  });

  it('starts with one-off and daily schedule lanes only', () => {
    const run = createRun({ name: 'Schedule Test' });

    expect(run.scheduleLanes).toEqual([
      expect.objectContaining({
        kind: 'one-off',
        name: 'One-Off',
      }),
      expect.objectContaining({
        kind: 'repeating-cycle',
        name: 'Daily',
        cycleDurationMinutes: 1440,
      }),
    ]);
  });

  it('starts in a single-body configuration but with a plural individuals model', () => {
    const run = createRun({ name: 'Plural Model Test' });

    expect(Array.isArray(run.individuals)).toBe(true);
    expect(run.individuals[0].name).toBe('Body 1');
  });

  it('can seed a new run with a repeating scheduled meal activity so first playback steps are visibly meaningful', () => {
    const run = createRun({
      name: 'Seeded Run',
      initialMeal: {
        startPlaybackTime: 0,
        durationMinutes: 30,
        carbsGrams: 50,
      },
    });

    expect(run.individuals[0].state.substances.glucose.gut).toBe(0);
    expect(run.scheduledActivities).toEqual([
      expect.objectContaining({
        type: 'meal',
        startCycleMinute: 0,
        durationMinutes: 30,
        carbsGrams: 50,
      }),
    ]);
    expect(run.history.checkpoints).toEqual([
      {
        playbackTime: 0,
        individuals: run.individuals,
      },
    ]);
  });

  it('backfills missing history for older persisted runs', () => {
    const run = createRun({ name: 'Legacy Run' });
    const legacyRun = {
      ...run,
      history: undefined,
    } as unknown as typeof run;

    const normalizedRun = ensureRunHistory(legacyRun);

    expect(normalizedRun.history.checkpoints).toEqual([
      {
        playbackTime: 0,
        individuals: normalizedRun.individuals,
      },
    ]);
    expect(normalizedRun.scheduledActivities).toEqual([]);
  });

  it('backfills legacy lanes and legacy activity placement into the cycle-lane model', () => {
    const run = createRun({ name: 'Legacy Schedule Run' });
    const legacyRun = {
      ...run,
      scheduleLanes: [
        { id: 'lane-daily', kind: 'daily', name: 'Daily' },
        { id: 'lane-weekly', kind: 'weekly', name: 'Weekly' },
      ],
      scheduledActivities: [
        {
          id: 'meal-1',
          laneId: 'lane-daily',
          type: 'meal',
          startPlaybackTime: 5400,
          durationMinutes: 30,
          carbsGrams: 45,
        },
        {
          id: 'meal-2',
          laneId: 'missing-lane',
          type: 'meal',
          startPlaybackTime: 7200,
          durationMinutes: 20,
          carbsGrams: 20,
        },
      ],
    } as unknown as typeof run;

    const normalizedRun = ensureRunHistory(legacyRun);

    expect(normalizedRun.scheduleLanes).toEqual([
      expect.objectContaining({ id: 'lane-daily', kind: 'repeating-cycle', cycleDurationMinutes: 1440 }),
      expect.objectContaining({ id: 'lane-weekly', kind: 'repeating-cycle', cycleDurationMinutes: 10080 }),
      expect.objectContaining({ kind: 'one-off', name: 'One-Off' }),
    ]);
    expect(normalizedRun.scheduledActivities).toEqual([
      expect.objectContaining({
        id: 'meal-1',
        laneId: 'lane-daily',
        startCycleMinute: 90,
        durationMinutes: 30,
        carbsGrams: 45,
      }),
      expect.objectContaining({
        id: 'meal-2',
        startPlaybackTime: 7200,
        durationMinutes: 20,
        carbsGrams: 20,
      }),
    ]);
  });
});
