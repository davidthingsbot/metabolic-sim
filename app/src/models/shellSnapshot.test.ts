import { describe, expect, it } from 'vitest';
import { createRun } from '../runs/runFactory';
import { createShellSnapshot } from './shellSnapshot';

function createSampleRun() {
  const run = createRun({ name: 'Lunch Replay' });
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

describe('createShellSnapshot', () => {
  it('builds body-status placeholders around the chosen run and system', () => {
    const snapshot = createShellSnapshot({
      run: createSampleRun(),
      workspace: 'body-status',
      selectedSystemId: 'blood-system',
      theme: 'light',
    });

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 6.2 g');
    expect(snapshot.bands.header.highLevelStatus).toContain('signal 18.0 µU/mL');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Blood System snapshot',
      'Current focus',
      'Next body-status views',
    ]);
  });

  it('switches the detail placeholders for the event-planner workspace', () => {
    const run = createSampleRun();
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const repeatingLane = run.scheduleLanes.find((lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 1440);

    if (!oneOffLane || !repeatingLane) {
      throw new Error('Expected one-off and repeating lanes');
    }

    run.scheduledActivities = [
      {
        id: 'one-off-meal',
        laneId: oneOffLane.id,
        type: 'meal',
        startPlaybackTime: 21600,
        durationMinutes: 45,
        carbsGrams: 30,
      },
      {
        id: 'daily-meal',
        laneId: repeatingLane.id,
        type: 'meal',
        startCycleMinute: 90,
        durationMinutes: 30,
        carbsGrams: 45,
      },
    ];
    run.history.checkpoints.push({
      playbackTime: 172800,
      individuals: structuredClone(run.individuals),
    });

    const snapshot = createShellSnapshot({
      run,
      workspace: 'event-planner',
      selectedSystemId: 'whole-body',
      theme: 'dark',
    });

    expect(snapshot.workspace.label).toBe('Event Planner');
    expect(snapshot.bands.header.themeToggleLabel).toBe('Light mode');
    expect(snapshot.theme).toBe('dark');
    expect(snapshot.bands.footer.maxPlaybackTime).toBe(1);
    expect(snapshot.bands.footer.checkpointTimes).toEqual([0, 172800]);
    expect(snapshot.bands.footer.selectedCheckpointIndex).toBe(0);
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Planner timeline',
      'Lane summary · One-Off',
      'Lane summary · Daily',
      'Lane summary · Alternating Days',
      'Lane summary · Weekly',
      'Next planner actions',
    ]);
    expect(snapshot.bands.midsection.detailCards[1].body).toContain('One-off lane');
    expect(snapshot.bands.midsection.detailCards[1].body).toContain('1 scheduled meal');
    expect(snapshot.bands.midsection.detailCards[2].body).toContain('Repeats every 1d 0h');
    expect(snapshot.bands.midsection.detailCards[2].body).toContain('1 scheduled meal');
  });

  it('exposes recorded history details in the footer scrubber status', () => {
    const run = createSampleRun();
    run.history.checkpoints.push({
      playbackTime: 1800,
      individuals: structuredClone(run.individuals),
    });
    run.history.checkpoints.push({
      playbackTime: 5400,
      individuals: structuredClone(run.individuals),
    });

    const snapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'whole-body',
      theme: 'light',
    });

    expect(snapshot.bands.footer.scrubberStatus).toBe('Timeline 1h 30m · 3 checkpoints · Recorded 0h 00m–1h 30m');
  });
});
