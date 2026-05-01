import type { Run, ScheduleLane, ScheduledMealActivity } from '../runs/types';

export type Workspace = 'body-status' | 'event-planner';
export type SystemId = 'whole-body' | 'blood-system' | 'digestive-system' | 'lymph-system';
export type LabelMode = 'plain' | 'scientific';
export type SparklineMetricId = 'blood-sugar' | 'gut-sugar' | 'cell-sugar' | 'storage-signal';
export type PlaybackSpeedMultiplier = 1 | 5 | 15 | 60;

export interface ShellSystemItem {
  id: SystemId;
  label: string;
  caption: string;
  isSelected: boolean;
}

export interface ShellSubsystemItem {
  id: string;
  label: string;
  caption: string;
  isEnabled: boolean;
}

export interface ShellDetailCard {
  title: string;
  body: string;
}

export interface ShellOverviewMetric {
  label: string;
  value: string;
}

export interface ShellMonitorCard {
  id: string;
  title: string;
  value: string;
  delta: string;
  note: string;
  sparkline: ShellLiveResultSparkline;
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

export interface ShellFooterLifetimeTimelineEvent {
  id: string;
  label: string;
  laneLabel: string;
  summary: string;
  repeatKind: 'dense' | 'rare';
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
  labelMode: LabelMode;
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
  subsystems: ShellSubsystemItem[];
  bands: {
    header: {
      eyebrow: string;
      highLevelStatus: string;
      viewerStatus: string;
      runChipLabel: string;
      labelModeToggleLabel: string;
      themeToggleLabel: string;
      sparklineMetricLabel: string;
    };
    midsection: {
      title: string;
      copy: string;
      overviewMetrics: ShellOverviewMetric[];
      monitorCards: ShellMonitorCard[];
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
      exactTimestampLabel: string;
      isPlaying: boolean;
      playbackSpeedMultiplier: PlaybackSpeedMultiplier;
      playbackSpeedLabel: string;
      numericalAnimationMs: number;
      minPlaybackTime: number;
      maxPlaybackTime: number;
      playbackStep: number;
      checkpointTimes: number[];
      selectedCheckpointIndex: number;
      lifetimeTimelineEvents: ShellFooterLifetimeTimelineEvent[];
      mealTimelineEvents: ShellFooterMealTimelineEvent[];
      eventReadout: ShellFooterEventReadout;
    };
  };
}

export interface CreateShellSnapshotOptions {
  run: Run;
  workspace: Workspace;
  selectedSystemId: SystemId;
  enabledSubsystemIds: string[];
  labelMode: LabelMode;
  sparklineMetricId?: SparklineMetricId;
  theme: 'light' | 'dark';
  isPlaying: boolean;
  playbackSpeedMultiplier?: PlaybackSpeedMultiplier;
}

const SYSTEMS: Array<{ id: SystemId; plainLabel: string; scientificLabel: string; plainCaption: string; scientificCaption: string }> = [
  { id: 'whole-body', plainLabel: 'Whole Body', scientificLabel: 'Whole Body', plainCaption: 'Overview', scientificCaption: 'System overview' },
  { id: 'blood-system', plainLabel: 'Blood System', scientificLabel: 'Circulation', plainCaption: 'Transport', scientificCaption: 'Cardiovascular transport' },
  { id: 'digestive-system', plainLabel: 'Digestive System', scientificLabel: 'Gastrointestinal Tract', plainCaption: 'Input', scientificCaption: 'Digestive processing' },
  { id: 'lymph-system', plainLabel: 'Lymph System', scientificLabel: 'Lymphatic System', plainCaption: 'Return flow', scientificCaption: 'Interstitial return' },
];

const SUBSYSTEMS_BY_SYSTEM: Record<SystemId, Array<{ id: string; plainLabel: string; scientificLabel: string; plainCaption: string; scientificCaption: string }>> = {
  'whole-body': [
    { id: 'blood-system', plainLabel: 'Blood System', scientificLabel: 'Circulation', plainCaption: 'Transport', scientificCaption: 'Cardiovascular transport' },
    { id: 'digestive-system', plainLabel: 'Digestive System', scientificLabel: 'Gastrointestinal Tract', plainCaption: 'Input', scientificCaption: 'Digestive processing' },
    { id: 'lymph-system', plainLabel: 'Lymph System', scientificLabel: 'Lymphatic System', plainCaption: 'Return flow', scientificCaption: 'Interstitial return' },
  ],
  'blood-system': [
    { id: 'arterial-flow', plainLabel: 'Arterial flow', scientificLabel: 'Arterial circulation', plainCaption: 'Outbound circulation', scientificCaption: 'Arterial distribution' },
    { id: 'venous-return', plainLabel: 'Venous return', scientificLabel: 'Venous circulation', plainCaption: 'Inbound circulation', scientificCaption: 'Venous return' },
    { id: 'storage-signal', plainLabel: 'Storage signal', scientificLabel: 'Insulin', plainCaption: 'Hormone response', scientificCaption: 'Anabolic hormone signal' },
  ],
  'digestive-system': [
    { id: 'stomach-processing', plainLabel: 'Stomach processing', scientificLabel: 'Gastric digestion', plainCaption: 'Meal breakdown', scientificCaption: 'Gastric processing' },
    { id: 'gut-absorption', plainLabel: 'Gut absorption', scientificLabel: 'Intestinal absorption', plainCaption: 'Sugar uptake', scientificCaption: 'Enteric uptake' },
    { id: 'liver-hand-off', plainLabel: 'Liver hand-off', scientificLabel: 'Hepatic first-pass', plainCaption: 'First-pass handling', scientificCaption: 'Hepatic first-pass handling' },
  ],
  'lymph-system': [
    { id: 'lymph-return', plainLabel: 'Lymph return', scientificLabel: 'Lymphatic return', plainCaption: 'Fluid return', scientificCaption: 'Lymphatic return' },
    { id: 'tissue-drainage', plainLabel: 'Tissue drainage', scientificLabel: 'Interstitial drainage', plainCaption: 'Interstitial pickup', scientificCaption: 'Interstitial drainage' },
    { id: 'gut-lacteals', plainLabel: 'Gut lacteals', scientificLabel: 'Intestinal lacteals', plainCaption: 'Fat transport later', scientificCaption: 'Lacteal transport' },
  ],
};

const WORKSPACE_OPTIONS: Array<{ value: Workspace; label: string }> = [
  { value: 'body-status', label: 'Body Status' },
  { value: 'event-planner', label: 'Event Planner' },
];

const SPARKLINE_METRICS: Record<SparklineMetricId, { label: string; unit: string }> = {
  'blood-sugar': { label: 'Blood sugar', unit: 'g' },
  'gut-sugar': { label: 'Gut sugar', unit: 'g' },
  'cell-sugar': { label: 'Cell sugar', unit: 'g' },
  'storage-signal': { label: 'Storage signal', unit: 'µU/mL' },
};

const DEFAULT_SPARKLINE_METRIC_ID: SparklineMetricId = 'blood-sugar';
const DEFAULT_PLAYBACK_SPEED_MULTIPLIER: PlaybackSpeedMultiplier = 1;

const TOP_LEVEL_SYSTEM_IDS: Array<Exclude<SystemId, 'whole-body'>> = ['blood-system', 'digestive-system', 'lymph-system'];

function isTopLevelSystemId(id: string): id is Exclude<SystemId, 'whole-body'> {
  return TOP_LEVEL_SYSTEM_IDS.includes(id as Exclude<SystemId, 'whole-body'>);
}

function isTopLevelSystemEnabled(systemId: Exclude<SystemId, 'whole-body'>, enabledSubsystemIds: string[]): boolean {
  return enabledSubsystemIds.includes(systemId);
}

function getEnabledTopLevelSystemIds(enabledSubsystemIds: string[]): Array<Exclude<SystemId, 'whole-body'>> {
  return TOP_LEVEL_SYSTEM_IDS.filter((systemId) => isTopLevelSystemEnabled(systemId, enabledSubsystemIds));
}

function formatHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function formatBodyAge(seconds: number): string {
  const totalDays = Math.floor(seconds / 86400);
  const years = Math.floor(totalDays / 365);
  const remainingAfterYears = totalDays % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;
  return `${years}y ${months}m ${days}d`;
}

function formatPreciseSimulatorTimestamp(seconds: number): string {
  const totalDays = Math.floor(seconds / 86400);
  const years = Math.floor(totalDays / 365);
  const dayOfYear = totalDays % 365;
  const secondsOfDay = seconds % 86400;
  const hours = Math.floor(secondsOfDay / 3600);
  const minutes = Math.floor((secondsOfDay % 3600) / 60);
  const remainingSeconds = secondsOfDay % 60;
  return `T+${years}y ${dayOfYear.toString().padStart(3, '0')}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getDisplayText(labelMode: LabelMode, plainLabel: string, scientificLabel: string): string {
  return labelMode === 'scientific' ? scientificLabel : plainLabel;
}

function getSystemDisplay(system: (typeof SYSTEMS)[number], labelMode: LabelMode): Pick<ShellSystemItem, 'label' | 'caption'> {
  return {
    label: getDisplayText(labelMode, system.plainLabel, system.scientificLabel),
    caption: getDisplayText(labelMode, system.plainCaption, system.scientificCaption),
  };
}

function getSubsystemDisplay(
  subsystem: (typeof SUBSYSTEMS_BY_SYSTEM)[SystemId][number],
  labelMode: LabelMode,
): Pick<ShellSubsystemItem, 'label' | 'caption'> {
  return {
    label: getDisplayText(labelMode, subsystem.plainLabel, subsystem.scientificLabel),
    caption: getDisplayText(labelMode, subsystem.plainCaption, subsystem.scientificCaption),
  };
}

function formatTimeOfDayFromMinute(totalMinutes: number): string {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatTimeOfDayFromSeconds(totalSeconds: number): string {
  return formatTimeOfDayFromMinute(Math.floor(totalSeconds / 60));
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
        return occurrence.endPlaybackTime <= rangeStartPlaybackTime || occurrence.startPlaybackTime >= rangeEndPlaybackTime ? [] : [occurrence];
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
        if (occurrence.endPlaybackTime <= rangeStartPlaybackTime || occurrence.startPlaybackTime >= rangeEndPlaybackTime) {
          continue;
        }
        occurrences.push(occurrence);
      }

      return occurrences;
    })
    .sort((left, right) => left.startPlaybackTime - right.startPlaybackTime || left.endPlaybackTime - right.endPlaybackTime || left.id.localeCompare(right.id));
}

function createOccurrenceStatus(run: Run, occurrence: MealOccurrence): 'past' | 'active' | 'upcoming' {
  return run.activePlaybackTime >= occurrence.endPlaybackTime
    ? 'past'
    : run.activePlaybackTime < occurrence.startPlaybackTime
      ? 'upcoming'
      : 'active';
}

function createFooterMealTimelineEvents(run: Run): ShellFooterMealTimelineEvent[] {
  const selectedDayStartPlaybackTime = Math.floor(run.activePlaybackTime / 86400) * 86400;
  const selectedDayEndPlaybackTime = selectedDayStartPlaybackTime + 86400;
  const dayDurationSeconds = selectedDayEndPlaybackTime - selectedDayStartPlaybackTime;

  return collectMealOccurrences(run, selectedDayStartPlaybackTime, selectedDayEndPlaybackTime).map((occurrence) => {
    const clampedStartPlaybackTime = Math.min(Math.max(occurrence.startPlaybackTime, selectedDayStartPlaybackTime), selectedDayEndPlaybackTime);
    const clampedEndPlaybackTime = Math.min(Math.max(occurrence.endPlaybackTime, selectedDayStartPlaybackTime), selectedDayEndPlaybackTime);

    return {
      id: occurrence.id,
      label: occurrence.label,
      laneLabel: occurrence.laneLabel,
      startLabel: formatTimeOfDayFromSeconds(occurrence.startPlaybackTime),
      endLabel: formatTimeOfDayFromSeconds(occurrence.endPlaybackTime),
      summary: occurrence.summary,
      status: createOccurrenceStatus(run, occurrence),
      offsetPercent: roundPercent(((clampedStartPlaybackTime - selectedDayStartPlaybackTime) / dayDurationSeconds) * 100),
      widthPercent: roundPercent(((clampedEndPlaybackTime - clampedStartPlaybackTime) / dayDurationSeconds) * 100),
    };
  });
}

function createFooterLifetimeTimelineEvents(run: Run): ShellFooterLifetimeTimelineEvent[] {
  const laneById = new Map(run.scheduleLanes.map((lane) => [lane.id, lane]));
  const lifetimeDurationSeconds = 80 * 365 * 86400;

  return run.scheduledActivities
    .filter((activity): activity is ScheduledMealActivity => activity.type === 'meal')
    .flatMap((activity): ShellFooterLifetimeTimelineEvent[] => {
      const lane = laneById.get(activity.laneId);
      if (!lane) {
        return [];
      }

      if ('startPlaybackTime' in activity) {
        const occurrence = createMealOccurrence(activity, lane, activity.startPlaybackTime);
        return [{
          id: occurrence.id,
          label: occurrence.label,
          laneLabel: occurrence.laneLabel,
          summary: occurrence.summary,
          repeatKind: 'rare',
          status: createOccurrenceStatus(run, occurrence),
          offsetPercent: roundPercent((occurrence.startPlaybackTime / lifetimeDurationSeconds) * 100),
          widthPercent: Math.max(roundPercent(((occurrence.endPlaybackTime - occurrence.startPlaybackTime) / lifetimeDurationSeconds) * 100), 0.2),
        }];
      }

      if (lane.kind !== 'repeating-cycle') {
        return [];
      }

      const patternStartPlaybackTime = activity.startCycleMinute * 60;
      const occurrence = createMealOccurrence(activity, lane, patternStartPlaybackTime);
      const repeatKind = lane.cycleDurationMinutes <= 2880 ? 'dense' : 'rare';

      return [{
        id: `${activity.id}-pattern`,
        label: occurrence.label,
        laneLabel: occurrence.laneLabel,
        summary: `${occurrence.summary} · every ${Math.round(lane.cycleDurationMinutes / 1440)} day${lane.cycleDurationMinutes === 1440 ? '' : 's'}`,
        repeatKind,
        status: 'active',
        offsetPercent: 0,
        widthPercent: 100,
      }];
    })
    .sort((left, right) => left.repeatKind.localeCompare(right.repeatKind) || left.offsetPercent - right.offsetPercent || left.id.localeCompare(right.id));
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

function createRecentHistoryEntries(run: Run): Array<{ playbackTime: number; bloodSugar: number; gutSugar: number; cellSugar: number; storageSignal: number }> {
  const recentWindowStart = Math.max(run.activePlaybackTime - 3600, 0);
  const entries = run.history.checkpoints
    .filter((checkpoint) => checkpoint.playbackTime >= recentWindowStart && checkpoint.playbackTime <= run.activePlaybackTime)
    .sort((left, right) => left.playbackTime - right.playbackTime)
    .map((checkpoint) => ({
      playbackTime: checkpoint.playbackTime,
      bloodSugar: checkpoint.individuals[0]?.state.substances.glucose.blood ?? 0,
      gutSugar: checkpoint.individuals[0]?.state.substances.glucose.gut ?? 0,
      cellSugar: checkpoint.individuals[0]?.state.substances.glucose.cells ?? 0,
      storageSignal: checkpoint.individuals[0]?.state.hormones.insulin ?? 0,
    }));

  if (entries[entries.length - 1]?.playbackTime !== run.activePlaybackTime) {
    entries.push({
      playbackTime: run.activePlaybackTime,
      bloodSugar: run.individuals[0]?.state.substances.glucose.blood ?? 0,
      gutSugar: run.individuals[0]?.state.substances.glucose.gut ?? 0,
      cellSugar: run.individuals[0]?.state.substances.glucose.cells ?? 0,
      storageSignal: run.individuals[0]?.state.hormones.insulin ?? 0,
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

function getMetricPoint(entry: ReturnType<typeof createRecentHistoryEntries>[number], metricId: SparklineMetricId): number {
  switch (metricId) {
    case 'gut-sugar':
      return entry.gutSugar;
    case 'cell-sugar':
      return entry.cellSugar;
    case 'storage-signal':
      return entry.storageSignal;
    case 'blood-sugar':
    default:
      return entry.bloodSugar;
  }
}

function resolveSparklineMetricId(metricId: SparklineMetricId | undefined): SparklineMetricId {
  return metricId && SPARKLINE_METRICS[metricId] ? metricId : DEFAULT_SPARKLINE_METRIC_ID;
}

function createMetricSparkline(run: Run, metricId: SparklineMetricId | undefined): ShellLiveResultSparkline {
  const resolvedMetricId = resolveSparklineMetricId(metricId);
  const metric = SPARKLINE_METRICS[resolvedMetricId];
  const points = createRecentHistoryEntries(run)
    .slice(-12)
    .map((entry) => getMetricPoint(entry, resolvedMetricId));
  const safePoints = points.length ? points : [0];
  const minPoint = Math.min(...safePoints);
  const maxPoint = Math.max(...safePoints);

  return {
    points: safePoints,
    minLabel: `${minPoint.toFixed(1)} ${metric.unit}`,
    maxLabel: `${maxPoint.toFixed(1)} ${metric.unit}`,
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

function createOverviewMetrics(run: Run, labelMode: LabelMode): ShellOverviewMetric[] {
  const currentState = run.individuals[0]?.state;
  return [
    { label: labelMode === 'scientific' ? 'Chronological age' : 'Body age', value: formatBodyAge(run.activePlaybackTime) },
    { label: labelMode === 'scientific' ? 'Plasma glucose' : 'Blood sugar', value: `${(currentState?.substances.glucose.blood ?? 0).toFixed(1)} g` },
    { label: labelMode === 'scientific' ? 'Luminal glucose' : 'Gut sugar', value: `${(currentState?.substances.glucose.gut ?? 0).toFixed(1)} g` },
    { label: labelMode === 'scientific' ? 'Intracellular glucose' : 'Cell sugar', value: `${(currentState?.substances.glucose.cells ?? 0).toFixed(1)} g` },
    { label: labelMode === 'scientific' ? 'Insulin' : 'Storage signal', value: `${(currentState?.hormones.insulin ?? 0).toFixed(1)} µU/mL` },
  ];
}

function createMonitorCards(
  run: Run,
  enabledSubsystemIds: string[],
  labelMode: LabelMode,
): ShellMonitorCard[] {
  const liveResultCards = createLiveResultCards(run);
  const cardByMetric = new Map(liveResultCards.map((card) => [card.title, card]));
  const metricForSystemId: Record<Exclude<SystemId, 'whole-body'>, { plain: string; scientific: string; notePlain: string; noteScientific: string }> = {
    'blood-system': { plain: 'Blood sugar', scientific: 'Plasma glucose', notePlain: 'Whole-body transport monitor', noteScientific: 'Circulating glucose monitor' },
    'digestive-system': { plain: 'Gut sugar', scientific: 'Luminal glucose', notePlain: 'Digestive intake monitor', noteScientific: 'Enteric nutrient monitor' },
    'lymph-system': { plain: 'Cell sugar', scientific: 'Intracellular glucose', notePlain: 'Return-flow monitor', noteScientific: 'Interstitial return monitor' },
  };

  return getEnabledTopLevelSystemIds(enabledSubsystemIds).map((systemId) => {
    const system = SYSTEMS.find((candidate) => candidate.id === systemId);
    const metric = metricForSystemId[systemId];
    const sourceCard = cardByMetric.get(metric.plain) ?? liveResultCards[0];
    const sparklineMetricId: Record<Exclude<SystemId, 'whole-body'>, SparklineMetricId> = {
      'blood-system': 'blood-sugar',
      'digestive-system': 'gut-sugar',
      'lymph-system': 'cell-sugar',
    };
    return {
      id: systemId,
      title: getDisplayText(labelMode, system?.plainLabel ?? systemId, system?.scientificLabel ?? systemId),
      value: sourceCard?.value ?? '0.0 g',
      delta: sourceCard?.delta ?? '±0.0 g vs baseline',
      note: getDisplayText(labelMode, metric.notePlain, metric.noteScientific),
      sparkline: createMetricSparkline(run, sparklineMetricId[systemId]),
    };
  });
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

function createSubsystemItems(selectedSystemId: SystemId, enabledSubsystemIds: string[], labelMode: LabelMode): ShellSubsystemItem[] {
  const enabledSubsystemIdSet = new Set(enabledSubsystemIds);
  const visibleSystems = selectedSystemId === 'whole-body'
    ? getEnabledTopLevelSystemIds(enabledSubsystemIds)
    : getEnabledTopLevelSystemIds(enabledSubsystemIds);

  return visibleSystems.flatMap((systemId) =>
    (SUBSYSTEMS_BY_SYSTEM[systemId] ?? []).map((subsystem) => ({
      id: subsystem.id,
      ...getSubsystemDisplay(subsystem, labelMode),
      isEnabled: enabledSubsystemIdSet.has(subsystem.id),
    })),
  );
}

export function createShellSnapshot(options: CreateShellSnapshotOptions): ShellSnapshot {
  const state = options.run.individuals[0]?.state;
  const sparklineMetricId = resolveSparklineMetricId(options.sparklineMetricId);
  const playbackSpeedMultiplier = options.playbackSpeedMultiplier ?? DEFAULT_PLAYBACK_SPEED_MULTIPLIER;
  const bloodSugar = state?.substances.glucose.blood ?? 0;
  const insulin = state?.hormones.insulin ?? 0;
  const selectedSystem = SYSTEMS.find((system) => system.id === options.selectedSystemId) ?? SYSTEMS[0];
  const selectedSystemDisplay = getSystemDisplay(selectedSystem, options.labelMode);
  const workspaceLabel = options.workspace === 'body-status' ? 'Body Status' : 'Event Planner';
  const oneOffLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'one-off').length;
  const repeatingLaneCount = options.run.scheduleLanes.filter((lane) => lane.kind === 'repeating-cycle').length;
  const bodyStatusLiveResults = {
    cards: createLiveResultCards(options.run),
    sparkline: createMetricSparkline(options.run, sparklineMetricId),
    recentMoments: createRecentMoments(options.run),
  };

  return {
    runName: options.run.name,
    labelMode: options.labelMode,
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
      id: system.id,
      ...getSystemDisplay(system, options.labelMode),
      isSelected: system.id === 'whole-body'
        ? system.id === selectedSystem.id
        : isTopLevelSystemId(system.id) && isTopLevelSystemEnabled(system.id, options.enabledSubsystemIds),
    })),
    subsystems: options.workspace === 'body-status' ? createSubsystemItems(selectedSystem.id, options.enabledSubsystemIds, options.labelMode) : [],
    bands: {
      header: {
        eyebrow: 'Metabolic Simulator',
        highLevelStatus: `Whole body stable · Blood sugar ${bloodSugar.toFixed(1)} g · Storage signal ${insulin.toFixed(1)} µU/mL`,
        viewerStatus:
          options.workspace === 'body-status'
            ? `Viewing ${selectedSystemDisplay.label}`
            : `Planning across ${oneOffLaneCount} one-off lane${oneOffLaneCount === 1 ? '' : 's'} and ${repeatingLaneCount} repeating lane${repeatingLaneCount === 1 ? '' : 's'}`,
        runChipLabel: `Run: ${options.run.name}`,
        labelModeToggleLabel: options.labelMode === 'scientific' ? 'Scientific labels' : 'Plain labels',
        themeToggleLabel: options.theme === 'dark' ? 'Light mode' : 'Dark mode',
        sparklineMetricLabel: `Sparkline: ${SPARKLINE_METRICS[sparklineMetricId].label}`,
      },
      midsection: {
        title: options.workspace === 'body-status' ? 'Body Status' : '',
        copy:
          options.workspace === 'body-status'
            ? ''
            : '',
        overviewMetrics: options.workspace === 'body-status' ? createOverviewMetrics(options.run, options.labelMode) : [],
        monitorCards: options.workspace === 'body-status'
          ? createMonitorCards(options.run, options.enabledSubsystemIds, options.labelMode)
          : [],
        liveResults: bodyStatusLiveResults,
        detailCards: [],
      },
      footer: {
        scrubberStatus: createScrubberStatus(options.run),
        playbackTime: options.run.activePlaybackTime,
        exactTimestampLabel: formatPreciseSimulatorTimestamp(options.run.activePlaybackTime),
        isPlaying: options.isPlaying,
        playbackSpeedMultiplier,
        playbackSpeedLabel: `${playbackSpeedMultiplier}×`,
        numericalAnimationMs: 300,
        minPlaybackTime: 0,
        maxPlaybackTime: createMaxPlaybackTime(options.run),
        playbackStep: 1,
        checkpointTimes: options.run.history.checkpoints.map((checkpoint) => checkpoint.playbackTime),
        selectedCheckpointIndex: createSelectedCheckpointIndex(options.run),
        lifetimeTimelineEvents: createFooterLifetimeTimelineEvents(options.run),
        mealTimelineEvents: createFooterMealTimelineEvents(options.run),
        eventReadout: createFooterEventReadout(options.run),
      },
    },
  };
}
