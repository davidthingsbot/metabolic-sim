import type { Run } from './runs/types';

export type Workspace = 'body-status' | 'event-planner';
export type SystemId = 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system';

export interface ShellSystemItem {
  id: SystemId;
  label: string;
  caption: string;
  isSelected: boolean;
}

export interface ShellDetailCard {
  title: string;
  body: string;
}

export interface ShellViewModel {
  runName: string;
  workspaceLabel: string;
  highLevelStatus: string;
  viewerStatus: string;
  scrubberStatus: string;
  systems: ShellSystemItem[];
  detailCards: ShellDetailCard[];
}

export interface CreateShellViewModelOptions {
  run: Run;
  workspace: Workspace;
  selectedSystemId: SystemId;
}

const SYSTEMS: Array<{ id: SystemId; label: string; caption: string }> = [
  { id: 'whole-body', label: 'Whole Body', caption: 'Overview' },
  { id: 'blood-system', label: 'Blood System', caption: 'Transport' },
  { id: 'digestive-system', label: 'Digestive System', caption: 'Input' },
  { id: 'lymph-system', label: 'Lymph System', caption: 'Return flow' },
];

function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function createBodyStatusCards(systemLabel: string, run: Run): ShellDetailCard[] {
  const state = run.individuals[0]?.state;
  const gutSugar = state?.substances.glucose.gut ?? 0;
  const cellSugar = state?.substances.glucose.cells ?? 0;

  return [
    {
      title: `${systemLabel} snapshot`,
      body: `Static shell placeholder for the ${systemLabel.toLowerCase()} workspace. Active body: ${run.individuals[0]?.name ?? 'Body 1'}.`,
    },
    {
      title: 'Current focus',
      body: `Playback at ${formatHours(run.activePlaybackTime)}. Gut sugar ${gutSugar.toFixed(1)} g. Cell uptake ${cellSugar.toFixed(1)} g.`,
    },
    {
      title: 'Next body-status views',
      body: 'Later slices will replace these cards with the anatomical whole-body view, charts, and system-specific detail stacks.',
    },
  ];
}

function createPlannerCards(run: Run): ShellDetailCard[] {
  const laneNames = run.scheduleLanes.map((lane) => lane.name).join(' · ');

  return [
    {
      title: 'Planner timeline',
      body: `Placeholder scheduler for ${run.scheduleLanes.length} repeating lanes: ${laneNames}.`,
    },
    {
      title: 'Selected lane',
      body: 'Direct grid editing and event forms land next. This shell keeps the dedicated planner workspace and persisted run underneath it.',
    },
    {
      title: 'Next planner actions',
      body: 'Add meals, movement, and sleep events here, then replay them through the same timeline scrubber in the footer.',
    },
  ];
}

export function createShellViewModel(options: CreateShellViewModelOptions): ShellViewModel {
  const state = options.run.individuals[0]?.state;
  const bloodSugar = state?.substances.glucose.blood ?? 0;
  const insulin = state?.hormones.insulin ?? 0;
  const selectedSystem = SYSTEMS.find((system) => system.id === options.selectedSystemId) ?? SYSTEMS[0];

  return {
    runName: options.run.name,
    workspaceLabel: options.workspace === 'body-status' ? 'Body Status' : 'Event Planner',
    highLevelStatus: `Whole body stable · Blood sugar ${bloodSugar.toFixed(1)} g · Storage signal ${insulin.toFixed(1)} µU/mL`,
    viewerStatus:
      options.workspace === 'body-status'
        ? `Viewing ${selectedSystem.label}`
        : `Planning on ${options.run.scheduleLanes.length} recurring lanes`,
    scrubberStatus: `Timeline ${formatHours(options.run.activePlaybackTime)}`,
    systems: SYSTEMS.map((system) => ({
      ...system,
      isSelected: system.id === selectedSystem.id,
    })),
    detailCards:
      options.workspace === 'body-status'
        ? createBodyStatusCards(selectedSystem.label, options.run)
        : createPlannerCards(options.run),
  };
}
