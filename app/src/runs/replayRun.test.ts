import { describe, expect, it } from 'vitest';
import { createRun } from './runFactory';
import { replayRunToPlaybackTime } from './replayRun';
import { appendScheduledMealActivity } from './scheduledActivities';

describe('replayRunToPlaybackTime', () => {
  it('rebuilds state and minute checkpoints from the earliest branch checkpoint after a planner edit', () => {
    const run = createRun({ name: 'Branched Replay' });
    run.individuals[0].state.simulatedTime = 120;
    run.history.checkpoints = [{
      playbackTime: 120,
      individuals: structuredClone(run.individuals),
    }];
    run.activePlaybackTime = 120;

    const oneOffLane = run.scheduleLanes.find((lane) => lane.kind === 'one-off');
    if (!oneOffLane) {
      throw new Error('Expected one-off lane');
    }

    appendScheduledMealActivity(run, {
      laneId: oneOffLane.id,
      startMinute: 2,
      durationMinutes: 2,
      carbsGrams: 20,
    });

    run.activePlaybackTime = 240;
    replayRunToPlaybackTime(run, 240);

    expect(run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime)).toEqual([120, 180, 240]);
    expect(run.individuals[0].state.simulatedTime).toBe(240);
    expect(run.individuals[0].state.substances.glucose.gut).toBeGreaterThan(0);
  });
});
