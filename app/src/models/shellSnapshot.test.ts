import { describe, expect, it } from 'vitest';
import { createRun } from '../runs/runFactory';
import { createShellSnapshot } from './shellSnapshot';

function createSampleRun() {
  const run = createRun({ name: 'Lunch Replay' });
  run.individuals[0].state.substances.glucose.gut = 12.4;
  run.individuals[0].state.substances.glucose.cells = 18.6;
  run.individuals[0].state.substances.glucose.blood = 6.2;
  run.individuals[0].state.hormones.insulin = 18;
  run.activePlaybackTime = 5400;
  return run;
}

describe('createShellSnapshot', () => {
  it('builds live body-status results around the chosen run and system', () => {
    const run = createSampleRun();
    run.history.checkpoints.push({
      playbackTime: 5100,
      individuals: [{
        ...structuredClone(run.individuals[0]),
        state: {
          ...structuredClone(run.individuals[0].state),
          simulatedTime: 5100,
          substances: {
            glucose: {
              gut: 14.8,
              blood: 5.7,
              cells: 16.9,
            },
          },
          hormones: {
            insulin: 15.5,
          },
        },
      }],
    });

    const snapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'blood-system',
      enabledSubsystemIds: ['arterial-flow', 'storage-signal'],
      theme: 'light',
      isPlaying: false,
    });

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 6.2 g');
    expect(snapshot.bands.header.highLevelStatus).toContain('signal 18.0 µU/mL');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.subsystems).toEqual([
      expect.objectContaining({ label: 'Arterial flow', isEnabled: true }),
      expect.objectContaining({ label: 'Venous return', isEnabled: false }),
      expect.objectContaining({ label: 'Storage signal', isEnabled: true }),
    ]);
    expect(snapshot.bands.midsection.copy).toContain('Live simulation results');
    expect(snapshot.bands.midsection.detailCards.map((card) => card.title)).toEqual([
      'Current trajectory',
      'Recent checkpoint trail',
      'How to read this',
    ]);
    expect(snapshot.bands.midsection.liveResults.cards).toEqual([
      expect.objectContaining({ title: 'Blood sugar', value: '6.2 g', delta: '+0.5 g vs 5 min ago' }),
      expect.objectContaining({ title: 'Gut sugar', value: '12.4 g', delta: '-2.4 g vs 5 min ago' }),
      expect.objectContaining({ title: 'Cell sugar', value: '18.6 g', delta: '+1.7 g vs 5 min ago' }),
      expect.objectContaining({ title: 'Storage signal', value: '18.0 µU/mL', delta: '+2.5 µU/mL vs 5 min ago' }),
    ]);
    expect(snapshot.bands.midsection.liveResults.sparkline.points).toEqual([5.7, 6.2]);
    expect(snapshot.bands.midsection.liveResults.sparkline.minLabel).toBe('5.7 g');
    expect(snapshot.bands.midsection.liveResults.sparkline.maxLabel).toBe('6.2 g');
    expect(snapshot.bands.midsection.liveResults.recentMoments).toEqual([
      expect.objectContaining({ label: 'Now', playbackLabel: '1h 30m', bloodSugar: '6.2 g', gutSugar: '12.4 g' }),
      expect.objectContaining({ label: '5 min ago', playbackLabel: '1h 25m', bloodSugar: '5.7 g', gutSugar: '14.8 g' }),
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
      enabledSubsystemIds: ['blood-system', 'digestive-system'],
      theme: 'dark',
      isPlaying: false,
    });

    expect(snapshot.workspace.label).toBe('Event Planner');
    expect(snapshot.subsystems).toEqual([]);
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
    expect(snapshot.planner.laneOptions).toEqual([
      expect.objectContaining({
        label: 'One-Off',
        placementLabel: 'Start time',
      }),
      expect.objectContaining({
        label: 'Daily',
        placementLabel: 'Cycle placement',
        cycleDurationMinutes: 1440,
      }),
      expect.objectContaining({
        label: 'Alternating Days',
        placementLabel: 'Cycle placement',
        cycleDurationMinutes: 2880,
      }),
      expect.objectContaining({
        label: 'Weekly',
        placementLabel: 'Cycle placement',
        cycleDurationMinutes: 10080,
      }),
    ]);
    expect(snapshot.planner.mealOptions).toEqual([
      expect.objectContaining({
        id: 'daily-meal',
        label: 'Daily · day 0 · 01:30 · 30 min · 45 g carbs',
      }),
      expect.objectContaining({
        id: 'one-off-meal',
        label: 'One-Off · day 0 · 06:00 · 45 min · 30 g carbs',
      }),
    ]);
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
      enabledSubsystemIds: ['blood-system', 'digestive-system'],
      theme: 'light',
      isPlaying: false,
    });

    expect(snapshot.bands.footer.scrubberStatus).toBe('Timeline 1h 30m · 3 checkpoints · Recorded 0h 00m–1h 30m');
  });

  it('projects scheduled meal spans and explanatory event readout into the footer timeline', () => {
    const run = createSampleRun();
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const dailyLane = run.scheduleLanes.find((lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 1440);

    if (!oneOffLane || !dailyLane || dailyLane.kind !== 'repeating-cycle') {
      throw new Error('Expected one-off and daily lanes');
    }

    run.activePlaybackTime = 5400;
    run.scheduledActivities = [
      {
        id: 'breakfast',
        laneId: oneOffLane.id,
        type: 'meal',
        startPlaybackTime: 1800,
        durationMinutes: 30,
        carbsGrams: 20,
      },
      {
        id: 'lunch',
        laneId: dailyLane.id,
        type: 'meal',
        startCycleMinute: 90,
        durationMinutes: 30,
        carbsGrams: 45,
      },
      {
        id: 'snack',
        laneId: dailyLane.id,
        type: 'meal',
        startCycleMinute: 180,
        durationMinutes: 20,
        carbsGrams: 15,
      },
    ];
    run.history.checkpoints.push({
      playbackTime: 1800,
      individuals: structuredClone(run.individuals),
    });
    run.history.checkpoints.push({
      playbackTime: 5400,
      individuals: structuredClone(run.individuals),
    });
    run.history.checkpoints.push({
      playbackTime: 10800,
      individuals: structuredClone(run.individuals),
    });

    const snapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'whole-body',
      enabledSubsystemIds: ['blood-system', 'digestive-system'],
      theme: 'light',
      isPlaying: true,
    });

    expect(snapshot.bands.footer.mealTimelineEvents).toEqual([
      {
        id: 'breakfast-at-1800',
        label: 'One-Off meal',
        laneLabel: 'One-Off',
        startLabel: '0h 30m',
        endLabel: '1h 00m',
        summary: '20.0 g carbs over 30 min',
        status: 'past',
        offsetPercent: 16.67,
        widthPercent: 16.67,
      },
      {
        id: 'lunch-at-5400',
        label: 'Daily meal',
        laneLabel: 'Daily',
        startLabel: '1h 30m',
        endLabel: '2h 00m',
        summary: '45.0 g carbs over 30 min',
        status: 'active',
        offsetPercent: 50,
        widthPercent: 16.67,
      },
      {
        id: 'snack-at-10800',
        label: 'Daily meal',
        laneLabel: 'Daily',
        startLabel: '3h 00m',
        endLabel: '3h 20m',
        summary: '15.0 g carbs over 20 min',
        status: 'upcoming',
        offsetPercent: 100,
        widthPercent: 0,
      },
    ]);
    expect(snapshot.bands.footer.eventReadout).toEqual({
      current: 'Now: Daily meal is underway · 1h 30m–2h 00m · 45.0 g carbs over 30 min.',
      mostRecent: 'Most recent: One-Off meal finished at 1h 00m · 20.0 g carbs over 30 min.',
      next: 'Next: Daily meal starts at 3h 00m · 15.0 g carbs over 20 min.',
    });
  });
});
