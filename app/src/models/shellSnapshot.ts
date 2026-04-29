import type { Run } from '../runs/types';

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

export interface ShellWorkspaceOption {
  value: Workspace;
  label: string;
  isSelected: boolean;
}

export interface ShellSnapshot {
  runName: string;
  theme: 'light' | 'dark';
  workspace: {
    value: Workspace;
    label: string;
    options: ShellWorkspaceOption[];
  };
  systems: ShellSystemItem[];
  bands: {
    header: {
      eyebrow: string;
      highLevelStatus: string;
      viewerStatus: string;
      runChipLabel: string;
      themeToggleLabel: string;
    };
    midsection: {
      title: string;
      copy: string;
      detailCards: ShellDetailCard[];
    };
    footer: {
      scrubberStatus: string;
      playbackTime: number;
      minPlaybackTime: number;
      maxPlaybackTime: number;
      playbackStep: number;
    };
  };
}

export interface CreateShellSnapshotOptions {
  run: Run;
  workspace: Workspace;
  selectedSystemId: SystemId;
  theme: 'light' | 'dark';
}

const SYSTEMS: Array<{ id: SystemId; label: string; caption: string }> = [
  { id: 'whole-body', label: 'Whole Body', caption: 'Overview' },
  { id: 'blood-system', label: 'Blood System', caption: 'Transport' },
  { id: 'digestive-system', label: 'Digestive System', caption: 'Input' },
  { id: 'lymph-system', label: 'Lymph System', caption: 'Return flow' },
];

const WORKSPACE_OPTIONS: Array<{ value: Workspace; label: string }> = [
  { value: 'body-status', label: 'Body Status' },
  { value: 'event-planner', label: 'Event Planner' },
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

export function createShellSnapshot(options: CreateShellSnapshotOptions): ShellSnapshot {
  const state = options.run.individuals[0]?.state;
  const bloodSugar = state?.substances.glucose.blood ?? 0;
  const insulin = state?.hormones.insulin ?? 0;
  const selectedSystem = SYSTEMS.find((system) => system.id === options.selectedSystemId) ?? SYSTEMS[0];
  const workspaceLabel = options.workspace === 'body-status' ? 'Body Status' : 'Event Planner';

  return {
    runName: options.run.name,
    theme: options.theme,
    workspace: {
      value: options.workspace,
      label: workspaceLabel,
      options: WORKSPACE_OPTIONS.map((option) => ({
        ...option,
        isSelected: option.value === options.workspace,
      })),
    },
    systems: SYSTEMS.map((system) => ({
      ...system,
      isSelected: system.id === selectedSystem.id,
    })),
    bands: {
      header: {
        eyebrow: 'Metabolic Simulator',
        highLevelStatus: `Whole body stable · Blood sugar ${bloodSugar.toFixed(1)} g · Storage signal ${insulin.toFixed(1)} µU/mL`,
        viewerStatus:
          options.workspace === 'body-status'
            ? `Viewing ${selectedSystem.label}`
            : `Planning on ${options.run.scheduleLanes.length} recurring lanes`,
        runChipLabel: `Run: ${options.run.name}`,
        themeToggleLabel: options.theme === 'dark' ? 'Light mode' : 'Dark mode',
      },
      midsection: {
        title: options.workspace === 'body-status' ? 'Master / detail shell' : 'Planner shell',
        copy:
          options.workspace === 'body-status'
            ? 'Static body-status placeholders now sit on top of the persisted run model.'
            : 'Static planner placeholders use the same active run and timeline model.',
        detailCards:
          options.workspace === 'body-status'
            ? createBodyStatusCards(selectedSystem.label, options.run)
            : createPlannerCards(options.run),
      },
      footer: {
        scrubberStatus: `Timeline ${formatHours(options.run.activePlaybackTime)}`,
        playbackTime: options.run.activePlaybackTime,
        minPlaybackTime: 0,
        maxPlaybackTime: 43200,
        playbackStep: 300,
      },
    },
  };
}