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

export interface ShellLiveResultCard {
  title: string;
  value: string;
  delta: string;
}

export interface ShellLiveResultSparkline {
  points: number[];
  minLabel: string;
  maxLabel: string;
}

export interface ShellRecentMoment {
  label: string;
  playbackLabel: string;
  bloodSugar: string;
  gutSugar: string;
}

export interface ShellWorkspaceOption {
  value: Workspace;
  label: string;
  isSelected: boolean;
}

export interface ShellPlannerLaneOption {
  id: string;
  label: string;
  placementLabel: string;
  cycleDurationMinutes?: number;
}

export interface ShellPlannerMealOption {
  id: string;
  label: string;
  laneId: string;
  day: number;
  timeOfDay: string;
  durationMinutes: number;
  carbsGrams: number;
}

export interface ShellFooterMealTimelineEvent {
  id: string;
  label: string;
  laneLabel: string;
  startLabel: string;
  endLabel: string;
  summary: string;
  status: 'past' | 'active' | 'upcoming';
  offsetPercent: number;
  widthPercent: number;
}

export interface ShellFooterEventReadout {
  current: string;
  mostRecent: string;
  next: string;
}

export interface ShellSnapshot {
  runName: string;
  theme: 'light' | 'dark';
  workspace: {
    value: Workspace;
    label: string;
    options: ShellWorkspaceOption[];
  };
  planner: {
    laneOptions: ShellPlannerLaneOption[];
    mealOptions: ShellPlannerMealOption[];
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
      liveResults: {
        cards: ShellLiveResultCard[];
        sparkline: ShellLiveResultSparkline;
        recentMoments: ShellRecentMoment[];
      };
      detailCards: ShellDetailCard[];
    };
    footer: {
      scrubberStatus: string;
      playbackTime: number;
      isPlaying: boolean;
      minPlaybackTime: number;
      maxPlaybackTime: number;
      playbackStep: number;
      checkpointTimes: number[];
      selectedCheckpointIndex: number;
      mealTimelineEvents: ShellFooterMealTimelineEvent[];
      eventReadout: ShellFooterEventReadout;
    };
  };
}

export interface CreateShellSnapshotOptions {
  run: Run;
  workspace: Workspace;
  selectedSystemId: SystemId;
  theme: 'light' | 'dark';
  isPlaying: boolean;
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

function formatTimeOfDayFromMinute(totalMinutes: number): string {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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

function formatMealSummary(activity: ScheduledMealActivity): string {
  return `${activity.carbsGrams.toFixed(1)} g carbs over ${activity.durationMinutes} min`;
}

function roundPercent(value: number): number {
  return Number(value.toFixed(2));
}

interface MealOccurrence {
  id: string;
  label: string;
  laneLabel: string;
  startPlaybackTime: number;
  endPlaybackTime: number;
  summary: string;
}

function createMealOccurrence(activity: ScheduledMealActivity, lane: ScheduleLane, startPlaybackTime: number): MealOccurrence {
  return {
    id: `${activity.id}-at-${startPlaybackTime}`,
    label: `${lane.name} meal`,
    laneLabel: lane.name,
    startPlaybackTime,
    endPlaybackTime: startPlaybackTime + activity.durationMinutes * 60,
    summary: formatMealSummary(activity),
  };
}

function collectMealOccurrences(run: Run, rangeStartPlaybackTime: number, rangeEndPlaybackTime: number): MealOccurrence[] {
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));

  return run.scheduledActivities
    .filter((activity): activity is ScheduledMealActivity => activity.type === 'meal')
    .flatMap((activity) => {
      const lane = laneById.get(activity.laneId);

      if (!lane) {
        return [];
      }

      if ('startPlaybackTime' in activity) {
        const occurrence = createMealOccurrence(activity, lane, activity.startPlaybackTime);
        return occurrence.endPlaybackTime < rangeStartPlaybackTime || occurrence.startPlaybackTime > rangeEndPlaybackTime ? [] : [occurrence];
      }

      if (lane.kind !== 'repeating-cycle') {
        return [];
      }

      const cycleDurationSeconds = lane.cycleDurationMinutes * 60;
      const activityStartOffsetSeconds = activity.startCycleMinute * 60;
      const firstCycleIndex = Math.max(Math.floor((rangeStartPlaybackTime - activityStartOffsetSeconds) / cycleDurationSeconds) - 1, 0);
      const lastCycleIndex = Math.max(Math.floor((rangeEndPlaybackTime - activityStartOffsetSeconds) / cycleDurationSeconds) + 1, 0);
      const occurrences: MealOccurrence[] = [];

      for (let cycleIndex = firstCycleIndex; cycleIndex <= lastCycleIndex; cycleIndex += 1) {
        const occurrence = createMealOccurrence(activity, lane, cycleIndex * cycleDurationSeconds + activityStartOffsetSeconds);
        if (occurrence.endPlaybackTime < rangeStartPlaybackTime || occurrence.startPlaybackTime > rangeEndPlaybackTime) {
          continue;
        }
        occurrences.push(occurrence);
      }

      return occurrences;
    })
    .sort((left, right) => left.startPlaybackTime - right.startPlaybackTime || left.endPlaybackTime - right.endPlaybackTime || left.id.localeCompare(right.id));
}

function createFooterMealTimelineEvents(run: Run): ShellFooterMealTimelineEvent[] {
  const checkpointTimes = run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime).sort((left, right) => left - right);
  const rangeStartPlaybackTime = checkpointTimes[0] ?? run.activePlaybackTime;
  const rangeEndPlaybackTime = checkpointTimes[checkpointTimes.length - 1] ?? run.activePlaybackTime;
  const rangeDurationSeconds = Math.max(rangeEndPlaybackTime - rangeStartPlaybackTime, 1);

  return collectMealOccurrences(run, rangeStartPlaybackTime, rangeEndPlaybackTime).map((occurrence) => {
    const clampedStartPlaybackTime = Math.min(Math.max(occurrence.startPlaybackTime, rangeStartPlaybackTime), rangeEndPlaybackTime);
    const clampedEndPlaybackTime = Math.min(Math.max(occurrence.endPlaybackTime, rangeStartPlaybackTime), rangeEndPlaybackTime);
    const status = run.activePlaybackTime >= occurrence.endPlaybackTime
      ? 'past'
      : run.activePlaybackTime < occurrence.startPlaybackTime
        ? 'upcoming'
        : 'active';

    return {
      id: occurrence.id,
      label: occurrence.label,
      laneLabel: occurrence.laneLabel,
      startLabel: formatHours(occurrence.startPlaybackTime),
      endLabel: formatHours(occurrence.endPlaybackTime),
      summary: occurrence.summary,
      status,
      offsetPercent: roundPercent(((clampedStartPlaybackTime - rangeStartPlaybackTime) / rangeDurationSeconds) * 100),
      widthPercent: roundPercent(((clampedEndPlaybackTime - clampedStartPlaybackTime) / rangeDurationSeconds) * 100),
    };
  });
}

function createFooterEventReadout(run: Run): ShellFooterEventReadout {
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));
  let currentOccurrence: MealOccurrence | undefined;
  let mostRecentOccurrence: MealOccurrence | undefined;
  let nextOccurrence: MealOccurrence | undefined;

  run.scheduledActivities
    .filter((activity): activity is ScheduledMealActivity => activity.type === 'meal')
    .forEach((activity) => {
      const lane = laneById.get(activity.laneId);
      if (!lane) {
        return;
      }

      if ('startPlaybackTime' in activity) {
        const occurrence = createMealOccurrence(activity, lane, activity.startPlaybackTime);
        if (run.activePlaybackTime >= occurrence.startPlaybackTime && run.activePlaybackTime < occurrence.endPlaybackTime) {
          currentOccurrence = !currentOccurrence || occurrence.startPlaybackTime > currentOccurrence.startPlaybackTime ? occurrence : currentOccurrence;
        }
        if (occurrence.endPlaybackTime <= run.activePlaybackTime) {
          mostRecentOccurrence = !mostRecentOccurrence || occurrence.endPlaybackTime > mostRecentOccurrence.endPlaybackTime ? occurrence : mostRecentOccurrence;
        }
        if (occurrence.startPlaybackTime > run.activePlaybackTime) {
          nextOccurrence = !nextOccurrence || occurrence.startPlaybackTime < nextOccurrence.startPlaybackTime ? occurrence : nextOccurrence;
        }
        return;
      }

      if (lane.kind !== 'repeating-cycle') {
        return;
      }

      const cycleDurationSeconds = lane.cycleDurationMinutes * 60;
      const activityStartOffsetSeconds = activity.startCycleMinute * 60;
      const currentCycleIndex = Math.floor((run.activePlaybackTime - activityStartOffsetSeconds) / cycleDurationSeconds);
      const currentCycleOccurrence = currentCycleIndex >= 0 ? createMealOccurrence(activity, lane, currentCycleIndex * cycleDurationSeconds + activityStartOffsetSeconds) : undefined;

      if (currentCycleOccurrence && run.activePlaybackTime >= currentCycleOccurrence.startPlaybackTime && run.activePlaybackTime < currentCycleOccurrence.endPlaybackTime) {
        currentOccurrence = !currentOccurrence || currentCycleOccurrence.startPlaybackTime > currentOccurrence.startPlaybackTime
          ? currentCycleOccurrence
          : currentOccurrence;
      }

      const recentCycleIndex = currentCycleOccurrence && currentCycleOccurrence.endPlaybackTime <= run.activePlaybackTime
        ? currentCycleIndex
        : currentCycleIndex - 1;
      if (recentCycleIndex >= 0) {
        const recentOccurrence = createMealOccurrence(activity, lane, recentCycleIndex * cycleDurationSeconds + activityStartOffsetSeconds);
        if (recentOccurrence.endPlaybackTime <= run.activePlaybackTime) {
          mostRecentOccurrence = !mostRecentOccurrence || recentOccurrence.endPlaybackTime > mostRecentOccurrence.endPlaybackTime
            ? recentOccurrence
            : mostRecentOccurrence;
        }
      }

      const baseNextCycleIndex = Math.max(currentCycleIndex, 0);
      const nextStartPlaybackTime = baseNextCycleIndex * cycleDurationSeconds + activityStartOffsetSeconds;
      const nextOccurrenceCandidate = createMealOccurrence(
        activity,
        lane,
        nextStartPlaybackTime > run.activePlaybackTime ? nextStartPlaybackTime : nextStartPlaybackTime + cycleDurationSeconds,
      );
      nextOccurrence = !nextOccurrence || nextOccurrenceCandidate.startPlaybackTime < nextOccurrence.startPlaybackTime
        ? nextOccurrenceCandidate
        : nextOccurrence;
    });

  return {
    current: currentOccurrence
      ? `Now: ${currentOccurrence.label} is underway · ${formatHours(currentOccurrence.startPlaybackTime)}–${formatHours(currentOccurrence.endPlaybackTime)} · ${currentOccurrence.summary}.`
      : `Now: No meal is active at ${formatHours(run.activePlaybackTime)}.`,
    mostRecent: mostRecentOccurrence
      ? `Most recent: ${mostRecentOccurrence.label} finished at ${formatHours(mostRecentOccurrence.endPlaybackTime)} · ${mostRecentOccurrence.summary}.`
      : 'Most recent: No meal has finished yet.',
    next: nextOccurrence
      ? `Next: ${nextOccurrence.label} starts at ${formatHours(nextOccurrence.startPlaybackTime)} · ${nextOccurrence.summary}.`
      : 'Next: No future meal is scheduled.',
  };
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

function formatSignedDelta(value: number, fractionDigits: number, unit: string): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '±';
  return `${sign}${Math.abs(value).toFixed(fractionDigits)} ${unit}`;
}

function createPreviousCheckpoint(run: Run): Run['history']['checkpoints'][number] | undefined {
  const checkpoints = [...run.history.checkpoints].sort((left, right) => right.playbackTime - left.playbackTime);
  return checkpoints.find((checkpoint) => checkpoint.playbackTime < run.activePlaybackTime);
}

function createRecentHistoryEntries(run: Run): Array<{ playbackTime: number; bloodSugar: number; gutSugar: number }> {
  const recentWindowStart = Math.max(run.activePlaybackTime - 3600, 0);
  const entries = run.history.checkpoints
    .filter((checkpoint) => checkpoint.playbackTime >= recentWindowStart && checkpoint.playbackTime <= run.activePlaybackTime)
    .sort((left, right) => left.playbackTime - right.playbackTime)
    .map((checkpoint) => ({
      playbackTime: checkpoint.playbackTime,
      bloodSugar: checkpoint.individuals[0]?.state.substances.glucose.blood ?? 0,
      gutSugar: checkpoint.individuals[0]?.state.substances.glucose.gut ?? 0,
    }));

  if (entries[entries.length - 1]?.playbackTime !== run.activePlaybackTime) {
    entries.push({
      playbackTime: run.activePlaybackTime,
      bloodSugar: run.individuals[0]?.state.substances.glucose.blood ?? 0,
      gutSugar: run.individuals[0]?.state.substances.glucose.gut ?? 0,
    });
  }

  return entries;
}

function createLiveResultCards(run: Run): ShellLiveResultCard[] {
  const currentState = run.individuals[0]?.state;
  const previousState = createPreviousCheckpoint(run)?.individuals[0]?.state;
  const minutesAgoLabel = previousState ? `${Math.round((run.activePlaybackTime - (createPreviousCheckpoint(run)?.playbackTime ?? run.activePlaybackTime)) / 60)} min ago` : 'baseline';

  return [
    {
      title: 'Blood sugar',
      value: `${(currentState?.substances.glucose.blood ?? 0).toFixed(1)} g`,
      delta: `${formatSignedDelta((currentState?.substances.glucose.blood ?? 0) - (previousState?.substances.glucose.blood ?? 0), 1, 'g')} vs ${minutesAgoLabel}`,
    },
    {
      title: 'Gut sugar',
      value: `${(currentState?.substances.glucose.gut ?? 0).toFixed(1)} g`,
      delta: `${formatSignedDelta((currentState?.substances.glucose.gut ?? 0) - (previousState?.substances.glucose.gut ?? 0), 1, 'g')} vs ${minutesAgoLabel}`,
    },
    {
      title: 'Cell sugar',
      value: `${(currentState?.substances.glucose.cells ?? 0).toFixed(1)} g`,
      delta: `${formatSignedDelta((currentState?.substances.glucose.cells ?? 0) - (previousState?.substances.glucose.cells ?? 0), 1, 'g')} vs ${minutesAgoLabel}`,
    },
    {
      title: 'Storage signal',
      value: `${(currentState?.hormones.insulin ?? 0).toFixed(1)} µU/mL`,
      delta: `${formatSignedDelta((currentState?.hormones.insulin ?? 0) - (previousState?.hormones.insulin ?? 0), 1, 'µU/mL')} vs ${minutesAgoLabel}`,
    },
  ];
}

function createLiveResultSparkline(run: Run): ShellLiveResultSparkline {
  const points = createRecentHistoryEntries(run)
    .slice(-12)
    .map((entry) => entry.bloodSugar);
  const minPoint = Math.min(...points);
  const maxPoint = Math.max(...points);

  return {
    points,
    minLabel: `${minPoint.toFixed(1)} g`,
    maxLabel: `${maxPoint.toFixed(1)} g`,
  };
}

function createRecentMoments(run: Run): ShellRecentMoment[] {
  return createRecentHistoryEntries(run)
    .sort((left, right) => right.playbackTime - left.playbackTime)
    .slice(0, 3)
    .map((entry, index) => ({
      label: index === 0 ? 'Now' : `${Math.round((run.activePlaybackTime - entry.playbackTime) / 60)} min ago`,
      playbackLabel: formatHours(entry.playbackTime),
      bloodSugar: `${entry.bloodSugar.toFixed(1)} g`,
      gutSugar: `${entry.gutSugar.toFixed(1)} g`,
    }));
}

function createBodyStatusCards(systemLabel: string, run: Run): ShellDetailCard[] {
  const recentMoments = createRecentMoments(run);
  const sparkline = createLiveResultSparkline(run);

  return [
    {
      title: 'Current trajectory',
      body: `${systemLabel} is streaming from recorded checkpoints for ${run.individuals[0]?.name ?? 'Body 1'}. Blood sugar ranges ${sparkline.minLabel}–${sparkline.maxLabel} across the visible trail.`,
    },
    {
      title: 'Recent checkpoint trail',
      body: recentMoments
        .map((moment) => `${moment.label} ${moment.playbackLabel}: blood ${moment.bloodSugar}, gut ${moment.gutSugar}`)
        .join(' · '),
    },
    {
      title: 'How to read this',
      body: 'Top cards show current compartment totals and their change since the last recorded checkpoint. The sparkline condenses recent blood-sugar history without introducing a heavy charting system.',
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

function createPlannerLaneOptions(run: Run): ShellPlannerLaneOption[] {
  return run.scheduleLanes.map((lane) =>
    lane.kind === 'repeating-cycle'
      ? {
          id: lane.id,
          label: lane.name,
          placementLabel: 'Cycle placement',
          cycleDurationMinutes: lane.cycleDurationMinutes,
        }
      : {
          id: lane.id,
          label: lane.name,
          placementLabel: 'Start time',
        },
  );
}

function createPlannerMealOptions(run: Run): ShellPlannerMealOption[] {
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));

  return run.scheduledActivities
    .filter((activity): activity is ScheduledMealActivity => activity.type === 'meal')
    .map((activity) => {
      const lane = laneById.get(activity.laneId);
      const startMinute = 'startPlaybackTime' in activity ? Math.floor(activity.startPlaybackTime / 60) : activity.startCycleMinute;
      const day = Math.floor(startMinute / 1440);
      const timeOfDay = formatTimeOfDayFromMinute(startMinute);

      return {
        id: activity.id,
        label: `${lane?.name ?? activity.laneId} · day ${day} · ${timeOfDay} · ${activity.durationMinutes} min · ${activity.carbsGrams} g carbs`,
        laneId: activity.laneId,
        day,
        timeOfDay,
        durationMinutes: activity.durationMinutes,
        carbsGrams: activity.carbsGrams,
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function createShellSnapshot(options: CreateShellSnapshotOptions): ShellSnapshot {
  const state = options.run.individuals[0]?.state;
  const bloodSugar = state?.substances.glucose.blood ?? 0;
  const insulin = state?.hormones.insulin ?? 0;
  const selectedSystem = SYSTEMS.find((system) => system.id === options.selectedSystemId) ?? SYSTEMS[0];
  const workspaceLabel = options.workspace === 'body-status' ? 'Body Status' : 'Event Planner';
  const oneOffLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'one-off').length;
  const repeatingLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'repeating-cycle').length;
  const bodyStatusLiveResults = {
    cards: createLiveResultCards(options.run),
    sparkline: createLiveResultSparkline(options.run),
    recentMoments: createRecentMoments(options.run),
  };

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
    planner: {
      laneOptions: createPlannerLaneOptions(options.run),
      mealOptions: createPlannerMealOptions(options.run),
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
        title: options.workspace === 'body-status' ? 'Live results panel' : 'Planner shell',
        copy:
          options.workspace === 'body-status'
            ? 'Live simulation results stream from the authoritative run history while the shell stays mobile-first.'
            : 'Static planner placeholders use the same active run and timeline model.',
        liveResults: bodyStatusLiveResults,
        detailCards:
          options.workspace === 'body-status'
            ? createBodyStatusCards(selectedSystem.label, options.run)
            : createPlannerCards(options.run),
      },
      footer: {
        scrubberStatus: createScrubberStatus(options.run),
        playbackTime: options.run.activePlaybackTime,
        isPlaying: options.isPlaying,
        minPlaybackTime: 0,
        maxPlaybackTime: createMaxPlaybackTime(options.run),
        playbackStep: 1,
        checkpointTimes: options.run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime),
        selectedCheckpointIndex: createSelectedCheckpointIndex(options.run),
        mealTimelineEvents: createFooterMealTimelineEvents(options.run),
        eventReadout: createFooterEventReadout(options.run),
      },
    },
  };
}
