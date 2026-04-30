import { applyEvent } from '../engine/events';
import { step } from '../engine/step';
import { getMealCarbsForPlaybackWindow, getScheduledMealActivities } from './scheduledActivities';
import type { Run, RunHistoryCheckpoint } from './types';

function createHistoryCheckpoint(run: Run, playbackTime: number): RunHistoryCheckpoint {
  return {
    playbackTime,
    individuals: structuredClone(run.individuals),
  };
}

function upsertHistoryCheckpoint(run: Run, playbackTime: number): void {
  const existingIndex = run.history.checkpoints.findIndex((checkpoint) => checkpoint.playbackTime === playbackTime);
  const nextCheckpoint = createHistoryCheckpoint(run, playbackTime);

  if (existingIndex >= 0) {
    run.history.checkpoints[existingIndex] = nextCheckpoint;
    return;
  }

  run.history.checkpoints.push(nextCheckpoint);
  run.history.checkpoints.sort((left, right) => left.playbackTime - right.playbackTime);
}

function applyScheduledActivitiesForPlaybackWindow(run: Run, playbackTime: number, stepSeconds: number): void {
  const mealActivities = getScheduledMealActivities(run.scheduledActivities);
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));

  if (!mealActivities.length) {
    return;
  }

  run.individuals.forEach((individual) => {
    mealActivities.forEach((activity) => {
      const lane = laneById.get(activity.laneId);
      if (!lane) {
        return;
      }

      const carbsGrams = getMealCarbsForPlaybackWindow(activity, lane, playbackTime, stepSeconds);
      if (carbsGrams > 0) {
        applyEvent(individual.state, { type: 'meal', carbsGrams });
      }
    });
  });
}

export function replayRunToPlaybackTime(run: Run, playbackTime = run.activePlaybackTime): void {
  const baselineCheckpoint = run.history.checkpoints[0];

  if (!baselineCheckpoint) {
    return;
  }

  run.individuals = structuredClone(baselineCheckpoint.individuals);
  run.activePlaybackTime = baselineCheckpoint.playbackTime;
  run.history = {
    checkpoints: [createHistoryCheckpoint(run, baselineCheckpoint.playbackTime)],
  };

  let remainingStepSeconds = Math.max(playbackTime - baselineCheckpoint.playbackTime, 0);

  while (remainingStepSeconds > 0) {
    const minuteStepSeconds = Math.min(60, remainingStepSeconds);
    applyScheduledActivitiesForPlaybackWindow(run, run.activePlaybackTime, minuteStepSeconds);

    run.individuals.forEach((individual) => {
      step(individual.state, minuteStepSeconds);
    });

    run.activePlaybackTime += minuteStepSeconds;
    upsertHistoryCheckpoint(run, run.activePlaybackTime);
    remainingStepSeconds -= minuteStepSeconds;
  }
}
