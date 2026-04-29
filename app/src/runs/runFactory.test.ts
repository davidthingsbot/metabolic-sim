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

  it('starts with a daily, alternating-days, and weekly schedule lane', () => {
    const run = createRun({ name: 'Schedule Test' });

    expect(run.scheduleLanes.map((lane) => lane.kind)).toEqual([
      'daily',
      'alternating-days',
      'weekly',
    ]);
  });

  it('starts in a single-body configuration but with a plural individuals model', () => {
    const run = createRun({ name: 'Plural Model Test' });

    expect(Array.isArray(run.individuals)).toBe(true);
    expect(run.individuals[0].name).toBe('Body 1');
  });

  it('can seed a new run with initial gut glucose so first playback steps are visibly meaningful', () => {
    const run = createRun({
      name: 'Seeded Run',
      initialMealCarbsGrams: 50,
    });

    expect(run.individuals[0].state.substances.glucose.gut).toBe(50);
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
  });
});
