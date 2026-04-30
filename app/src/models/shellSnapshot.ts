import type { Run, ScheduleLane, ScheduledMealActivity } from '../runs/types';

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
      checkpointTimes: number[];
      selectedCheckpointIndex: number;
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

function formatCycleDurationMinutes(cycleDurationMinutes: number): string {
  const days = Math.floor(cycleDurationMinutes / 1440);
  const remainingMinutes = cycleDurationMinutes % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (minutes === 0) {
    return `${days}d ${hours}h`;
  }

  return `${days}d ${hours}h ${minutes}m`;
}

function createScrubberStatus(run: Run): string {
  const checkpointTimes = run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime);
  const firstCheckpointTime = checkpointTimes[0] ?? run.activePlaybackTime;
  const lastCheckpointTime = checkpointTimes[checkpointTimes.length - 1] ?? run.activePlaybackTime;

  return `Timeline ${formatHours(run.activePlaybackTime)} · ${checkpointTimes.length} checkpoints · Recorded ${formatHours(firstCheckpointTime)}–${formatHours(lastCheckpointTime)}`;
}

function createMaxPlaybackTime(run: Run): number {
  return Math.max(run.history.checkpoints.length - 1, 0);
}

function createSelectedCheckpointIndex(run: Run): number {
  const selectedIndex = run.history.checkpoints.findIndex((checkpoint) => checkpoint.playbackTime === run.activePlaybackTime);
  return selectedIndex >= 0 ? selectedIndex : 0;
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

function describeLaneSummary(lane: ScheduleLane, mealActivities: ScheduledMealActivity[]): string {
  const mealCountLabel = `${mealActivities.length} scheduled meal${mealActivities.length === 1 ? '' : 's'}`;

  if (lane.kind === 'repeating-cycle') {
    return `Repeats every ${formatCycleDurationMinutes(lane.cycleDurationMinutes)} · ${mealCountLabel}.`;
  }

  return `One-off lane · ${mealCountLabel}.`;
}

function describeMealPlacement(activity: ScheduledMealActivity): string {
  if ('startPlaybackTime' in activity) {
    return `First meal starts at ${formatHours(activity.startPlaybackTime)}`;
  }

  return `First meal lands at cycle minute ${activity.startCycleMinute}`;
}

function createPlannerCards(run: Run): ShellDetailCard[] {
  const mealActivities = run.scheduledActivities.filter((activity): activity is ScheduledMealActivity => activity.type === 'meal');
  const laneCards = run.scheduleLanes.map((lane) => {
    const laneMealActivities = mealActivities.filter((activity) => activity.laneId === lane.id);
    const firstLaneMeal = laneMealActivities[0];

    return {
      title: `Lane summary · ${lane.name}`,
      body: firstLaneMeal
        ? `${describeLaneSummary(lane, laneMealActivities)} ${describeMealPlacement(firstLaneMeal)} and runs for ${firstLaneMeal.durationMinutes} min at ${firstLaneMeal.carbsGrams.toFixed(1)} g carbs.`
        : `${describeLaneSummary(lane, laneMealActivities)} No meals scheduled yet.`,
    };
  });

  return [
    {
      title: 'Planner timeline',
      body: `Planner tracks ${mealActivities.length} scheduled meal${mealActivities.length === 1 ? '' : 's'} across ${run.scheduleLanes.length} lanes without expanding repeating cycles into concrete copies.`,
    },
    ...laneCards,
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
  const oneOffLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'one-off').length;
  const repeatingLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'repeating-cycle').length;

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
            : `Planning across ${oneOffLaneCount} one-off lane${oneOffLaneCount === 1 ? '' : 's'} and ${repeatingLaneCount} repeating lane${repeatingLaneCount === 1 ? '' : 's'}`,
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
        scrubberStatus: createScrubberStatus(options.run),
        playbackTime: options.run.activePlaybackTime,
        minPlaybackTime: 0,
        maxPlaybackTime: createMaxPlaybackTime(options.run),
        playbackStep: 1,
        checkpointTimes: options.run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime),
        selectedCheckpointIndex: createSelectedCheckpointIndex(options.run),
      },
    },
  };
}
