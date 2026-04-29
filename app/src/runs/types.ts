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

export interface Run {
  id: string;
  name: string;
  individuals: IndividualRunState[];
  scheduleLanes: ScheduleLane[];
  activePlaybackTime: number;
}

export interface CreateRunOptions {
  name: string;
}
