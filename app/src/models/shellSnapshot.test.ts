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
      selectedSystemId: 'whole-body',
      enabledSubsystemIds: ['blood-system', 'digestive-system', 'lymph-system', 'arterial-flow', 'venous-return', 'storage-signal', 'stomach-processing', 'gut-absorption', 'liver-hand-off', 'lymph-return', 'tissue-drainage', 'gut-lacteals'],
      labelMode: 'plain',
      theme: 'light',
      isPlaying: false,
    });

    expect(snapshot.runName).toBe('Lunch Replay');
    expect(snapshot.bands.header.highLevelStatus).toContain('Blood sugar 6.2 g');
    expect(snapshot.bands.header.highLevelStatus).toContain('signal 18.0 µU/mL');
    expect(snapshot.bands.header.labelModeToggleLabel).toBe('Plain labels');
    expect(snapshot.systems.find((system) => system.id === 'blood-system')?.isSelected).toBe(true);
    expect(snapshot.systems.find((system) => system.id === 'digestive-system')?.isSelected).toBe(true);
    expect(snapshot.systems.find((system) => system.id === 'lymph-system')?.isSelected).toBe(true);
    expect(snapshot.subsystems).toEqual([
      expect.objectContaining({ label: 'Arterial flow', isEnabled: true }),
      expect.objectContaining({ label: 'Venous return', isEnabled: true }),
      expect.objectContaining({ label: 'Storage signal', isEnabled: true }),
      expect.objectContaining({ label: 'Stomach processing', isEnabled: true }),
      expect.objectContaining({ label: 'Gut absorption', isEnabled: true }),
      expect.objectContaining({ label: 'Liver hand-off', isEnabled: true }),
      expect.objectContaining({ label: 'Lymph return', isEnabled: true }),
      expect.objectContaining({ label: 'Tissue drainage', isEnabled: true }),
      expect.objectContaining({ label: 'Gut lacteals', isEnabled: true }),
    ]);
    expect(snapshot.bands.midsection.copy).toBe('');
    expect(snapshot.bands.midsection.overviewMetrics.map((metric) => metric.label)).toEqual([
      'Body age',
      'Blood sugar',
      'Gut sugar',
      'Cell sugar',
      'Storage signal',
    ]);
    expect(snapshot.bands.midsection.overviewMetrics[0]?.value).toBe('0y 0m 0d');
    expect(snapshot.bands.midsection.monitorCards.map((card) => card.title)).toEqual([
      'Blood System',
      'Digestive System',
      'Lymph System',
    ]);
    expect(snapshot.bands.midsection.monitorCards[0]).toEqual(
      expect.objectContaining({
        title: 'Blood System',
      }),
    );
    expect(snapshot.bands.midsection.detailCards).toEqual([]);
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
      labelMode: 'scientific',
      theme: 'dark',
      isPlaying: false,
    });

    expect(snapshot.workspace.label).toBe('Event Planner');
    expect(snapshot.subsystems).toEqual([]);
    expect(snapshot.systems.map((system) => system.label)).toContain('Circulation');
    expect(snapshot.bands.header.labelModeToggleLabel).toBe('Scientific labels');
    expect(snapshot.bands.header.themeToggleLabel).toBe('Light mode');
    expect(snapshot.theme).toBe('dark');
    expect(snapshot.bands.footer.maxPlaybackTime).toBe(1);
    expect(snapshot.bands.footer.checkpointTimes).toEqual([0, 172800]);
    expect(snapshot.bands.footer.selectedCheckpointIndex).toBe(0);
    expect(snapshot.bands.midsection.detailCards).toEqual([]);
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

  it('surfaces only one-off and daily planner lanes by default and supports custom repeating lanes', () => {
    const run = createSampleRun();
    run.scheduleLanes.push({
      id: 'lane-custom-2d',
      kind: 'repeating-cycle',
      name: 'Custom · 2 days',
      cycleDurationMinutes: 2880,
    });

    const snapshot = createShellSnapshot({
      run,
      workspace: 'event-planner',
      selectedSystemId: 'whole-body',
      enabledSubsystemIds: ['blood-system', 'digestive-system'],
      labelMode: 'plain',
      theme: 'light',
      isPlaying: false,
    });

    expect(snapshot.planner.laneOptions.map((lane) => lane.label)).toEqual([
      'One-Off',
      'Daily',
      'Custom · 2 days',
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
      labelMode: 'plain',
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
      labelMode: 'plain',
      theme: 'light',
      isPlaying: true,
    });

    expect(snapshot.bands.footer.mealTimelineEvents).toEqual([
      {
        id: 'breakfast-at-1800',
        label: 'One-Off meal',
        laneLabel: 'One-Off',
        startLabel: '00:30',
        endLabel: '01:00',
        summary: '20.0 g carbs over 30 min',
        status: 'past',
        offsetPercent: 2.08,
        widthPercent: 2.08,
      },
      {
        id: 'lunch-at-5400',
        label: 'Daily meal',
        laneLabel: 'Daily',
        startLabel: '01:30',
        endLabel: '02:00',
        summary: '45.0 g carbs over 30 min',
        status: 'active',
        offsetPercent: 6.25,
        widthPercent: 2.08,
      },
      {
        id: 'snack-at-10800',
        label: 'Daily meal',
        laneLabel: 'Daily',
        startLabel: '03:00',
        endLabel: '03:20',
        summary: '15.0 g carbs over 20 min',
        status: 'upcoming',
        offsetPercent: 12.5,
        widthPercent: 1.39,
      },
    ]);
    expect(snapshot.bands.footer.eventReadout).toEqual({
      current: 'Now: Daily meal is underway · 1h 30m–2h 00m · 45.0 g carbs over 30 min.',
      mostRecent: 'Most recent: One-Off meal finished at 1h 00m · 20.0 g carbs over 30 min.',
      next: 'Next: Daily meal starts at 3h 00m · 15.0 g carbs over 20 min.',
    });
  });

  it('separates lifetime event bands from selected-day event spans', () => {
    const run = createSampleRun();
    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    const dailyLane = run.scheduleLanes.find((lane) => lane.kind === 'repeating-cycle' && lane.cycleDurationMinutes === 1440);

    if (!oneOffLane || !dailyLane || dailyLane.kind !== 'repeating-cycle') {
      throw new Error('Expected one-off and daily lanes');
    }

    run.activePlaybackTime = 36 * 3600;
    run.scheduledActivities = [
      {
        id: 'breakfast',
        laneId: oneOffLane.id,
        type: 'meal',
        startPlaybackTime: 2 * 86400 + 6 * 3600,
        durationMinutes: 30,
        carbsGrams: 20,
      },
      {
        id: 'daily-lunch',
        laneId: dailyLane.id,
        type: 'meal',
        startCycleMinute: 12 * 60,
        durationMinutes: 45,
        carbsGrams: 45,
      },
    ];

    const snapshot = createShellSnapshot({
      run,
      workspace: 'body-status',
      selectedSystemId: 'whole-body',
      enabledSubsystemIds: ['blood-system', 'digestive-system'],
      labelMode: 'plain',
      theme: 'light',
      isPlaying: true,
    });

    expect(snapshot.bands.footer.lifetimeTimelineEvents).toEqual([
      expect.objectContaining({
        id: 'daily-lunch-pattern',
        label: 'Daily meal',
        repeatKind: 'dense',
        offsetPercent: 0,
        widthPercent: 100,
      }),
      expect.objectContaining({
        id: 'breakfast-at-194400',
        label: 'One-Off meal',
        repeatKind: 'rare',
      }),
    ]);
    expect(snapshot.bands.footer.mealTimelineEvents).toEqual([
      expect.objectContaining({
        id: 'daily-lunch-at-129600',
        label: 'Daily meal',
        startLabel: '12:00',
        endLabel: '12:45',
        offsetPercent: 50,
        widthPercent: 3.13,
      }),
    ]);
  });
});
