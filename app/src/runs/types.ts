import type { State } from '../engine/state';

export type LegacyScheduleLaneKind = 'daily' | 'alternating-days' | 'weekly';
export type ScheduleLaneKind = 'one-off' | 'repeating-cycle' | LegacyScheduleLaneKind;

export interface OneOffScheduleLane {
  id: string;
  kind: 'one-off';
  name: string;
}

export interface RepeatingCycleScheduleLane {
  id: string;
  kind: 'repeating-cycle';
  name: string;
  cycleDurationMinutes: number;
}

export interface LegacyScheduleLane {
  id: string;
  kind: LegacyScheduleLaneKind;
  name: string;
}

export type ScheduleLane = OneOffScheduleLane | RepeatingCycleScheduleLane | LegacyScheduleLane;

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
  durationMinutes: number;
}

export interface OneOffScheduledActivityPlacement {
  startPlaybackTime: number;
}

export interface RepeatingScheduledActivityPlacement {
  startCycleMinute: number;
}

export interface ScheduledMealActivityBase extends ScheduledActivityBase {
  type: 'meal';
  carbsGrams: number;
}

export interface ScheduledMealActivityInput {
  laneId: string;
  startMinute: number;
  durationMinutes: number;
  carbsGrams: number;
}

export type CreateScheduledMealActivityInput = ScheduledMealActivityInput;
export type UpdateScheduledMealActivityInput = ScheduledMealActivityInput;

export interface CreateScheduleLaneInput {
  durationMinutes: number;
}

export type ScheduledMealActivity =
  | (ScheduledMealActivityBase & OneOffScheduledActivityPlacement)
  | (ScheduledMealActivityBase & RepeatingScheduledActivityPlacement);

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
