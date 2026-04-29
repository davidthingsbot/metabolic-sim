import type { State } from '../engine/state';

export type ScheduleLaneKind = 'daily' | 'alternating-days' | 'weekly';

export interface ScheduleLane {
  id: string;
  kind: ScheduleLaneKind;
  name: string;
}

export interface IndividualRunState {
  id: string;
  name: string;
  state: State;
}

export interface RunHistoryCheckpoint {
  playbackTime: number;
  individuals: IndividualRunState[];
}

export interface RunHistory {
  checkpoints: RunHistoryCheckpoint[];
}

export interface RunLineage {
  parentRunId: string;
  parentCheckpointTime: number;
  branchedAtPlaybackTime: number;
}

export interface ScheduledActivityBase {
  id: string;
  laneId: string;
  startPlaybackTime: number;
  durationMinutes: number;
}

export interface ScheduledMealActivity extends ScheduledActivityBase {
  type: 'meal';
  carbsGrams: number;
}

export type ScheduledActivity = ScheduledMealActivity;

export interface Run {
  id: string;
  name: string;
  individuals: IndividualRunState[];
  scheduleLanes: ScheduleLane[];
  scheduledActivities: ScheduledActivity[];
  activePlaybackTime: number;
  history: RunHistory;
  lineage?: RunLineage;
}

export interface CreateRunOptions {
  name: string;
  initialMeal?: {
    startPlaybackTime: number;
    durationMinutes: number;
    carbsGrams: number;
  };
}
