import { h, type FunctionalComponent } from 'preact';
import type { ShellFooterLifetimeTimelineEvent, ShellFooterMealTimelineEvent, ShellSnapshot } from '../../models/shellSnapshot';

export interface ShellFooterViewProps {
  snapshot: ShellSnapshot;
  onSetPlaybackTime: (playbackTime: number) => void;
  onStepPlayback: () => void;
  onTogglePlaying: () => void;
  onCyclePlaybackSpeed: () => void;
  onBranchPlaybackTime: (playbackTime: number) => void;
}

function createMealEventClassName(event: ShellFooterMealTimelineEvent): string {
  return `timeline-meal-event timeline-meal-event-${event.status}`;
}

function createMealEventStyle(event: ShellFooterMealTimelineEvent): string {
  const widthPercent = Math.max(event.widthPercent, 0.6);
  return `left:${event.offsetPercent}%;width:${widthPercent}%;`;
}

function createLifetimeEventClassName(event: ShellFooterLifetimeTimelineEvent): string {
  return `timeline-lifetime-event timeline-lifetime-event-${event.repeatKind} timeline-lifetime-event-${event.status}`;
}

function createLifetimeEventStyle(event: ShellFooterLifetimeTimelineEvent): string {
  const widthPercent = Math.max(event.widthPercent, event.repeatKind === 'rare' ? 0.2 : 0.6);
  return `left:${event.offsetPercent}%;width:${widthPercent}%;`;
}

const lifetimeTickLabels = ['Year 0', 'Year 20', 'Year 40', 'Year 60', 'Year 80'];
const dayTickLabels = ['00:00', '06:00', '12:00', '18:00', '24:00'];
const lifetimeSeconds = 80 * 365 * 86400;
const daySeconds = 86400;

function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

function roundPercent(value: number): number {
  return Number(value.toFixed(2));
}

function createPlaybackPercentStyle(offsetPercent: number): string {
  return `left:${roundPercent(clampPercent(offsetPercent))}%;`;
}

function createLifetimePlaybackStyle(playbackTime: number): string {
  return createPlaybackPercentStyle((playbackTime / lifetimeSeconds) * 100);
}

function createDayPlaybackStyle(playbackTime: number): string {
  return createPlaybackPercentStyle(((playbackTime % daySeconds) / daySeconds) * 100);
}

function createDetailWindowStyle(playbackTime: number): string {
  const selectedDayStart = Math.floor(playbackTime / daySeconds) * daySeconds;
  return `left:${roundPercent(clampPercent((selectedDayStart / lifetimeSeconds) * 100))}%;`;
}

function createTimelineTickStyle(index: number, count: number): string {
  const offsetPercent = count <= 1 ? 0 : (index / (count - 1)) * 100;
  return `left:${offsetPercent}%;`;
}

export const ShellFooterView: FunctionalComponent<ShellFooterViewProps> = ({
  snapshot,
  onSetPlaybackTime,
  onStepPlayback,
  onTogglePlaying,
  onCyclePlaybackSpeed,
  onBranchPlaybackTime,
}) =>
  h('div', { class: 'footer-controls', style: `--numeric-animation-duration: ${snapshot.bands.footer.numericalAnimationMs}ms;` }, [
    h('div', { class: 'control-cluster' }, [
      h('span', { class: 'control-label' }, 'Experiment'),
      h('strong', { class: 'simulator-timestamp animated-number' }, snapshot.bands.footer.exactTimestampLabel),
      h('div', { class: 'chip-row' }, [
        h('button', { class: snapshot.bands.footer.isPlaying ? 'control-chip active' : 'control-chip', type: 'button', onClick: onTogglePlaying },
          snapshot.bands.footer.isPlaying ? 'Pause' : 'Play',
        ),
        h('button', { class: 'control-chip', type: 'button', onClick: onCyclePlaybackSpeed }, snapshot.bands.footer.playbackSpeedLabel),
        h('button', { class: 'control-chip', type: 'button', onClick: onStepPlayback }, 'Step'),
        h(
          'button',
          {
            class: 'control-chip',
            type: 'button',
            onClick: () => onBranchPlaybackTime(snapshot.bands.footer.playbackTime),
          },
          'Branch',
        ),
      ]),
    ]),
    h('div', { class: 'timeline-block' }, [
      h('div', { class: 'timeline-header' }, [
        h('span', { class: 'control-label' }, 'Timeline'),
        h('span', { class: 'timeline-status' }, snapshot.bands.footer.scrubberStatus),
      ]),
      h('div', { class: 'timeline-scale timeline-scale-lifetime' }, [
        h('span', { class: 'timeline-scale-label' }, 'Lifetime'),
        h('span', { class: 'timeline-line' }),
        h('span', { class: 'timeline-detail-window', style: createDetailWindowStyle(snapshot.bands.footer.playbackTime) }),
        h('span', { class: 'timeline-now-marker timeline-now-marker-lifetime', style: createLifetimePlaybackStyle(snapshot.bands.footer.playbackTime) }),
        h('div', { class: 'timeline-lifetime-track' }, snapshot.bands.footer.lifetimeTimelineEvents.map((event) =>
          h('div', { key: event.id, class: createLifetimeEventClassName(event), style: createLifetimeEventStyle(event) }, [
            h('span', { class: 'timeline-lifetime-event-label' }, event.label),
          ]),
        )),
        ...lifetimeTickLabels.map((label, index) =>
          h('span', { key: label, class: 'timeline-tick timeline-tick-lifetime', style: createTimelineTickStyle(index, lifetimeTickLabels.length) }, [
            h('span', { class: 'timeline-tick-mark' }),
            h('span', { class: 'timeline-tick-label' }, label),
          ]),
        ),
      ]),
      h('div', { class: 'timeline-scale timeline-scale-day' }, [
        h('span', { class: 'timeline-scale-label' }, 'Selected day'),
        h('span', { class: 'timeline-line' }),
        h('span', { class: 'timeline-now-marker timeline-now-marker-day', style: createDayPlaybackStyle(snapshot.bands.footer.playbackTime) }),
        ...dayTickLabels.map((label, index) =>
          h('span', { key: label, class: 'timeline-tick timeline-tick-day', style: createTimelineTickStyle(index, dayTickLabels.length) }, [
            h('span', { class: 'timeline-tick-mark' }),
            h('span', { class: 'timeline-tick-label' }, label),
          ]),
        ),
        h('div', { class: 'timeline-meal-track' }, snapshot.bands.footer.mealTimelineEvents.map((event) =>
          h('div', { key: event.id, class: createMealEventClassName(event), style: createMealEventStyle(event) }, [
            h('span', { class: 'timeline-meal-event-label' }, event.label),
            h('span', { class: 'timeline-meal-event-time' }, `${event.startLabel}–${event.endLabel}`),
          ]),
        )),
      ]),
      h('input', {
        class: 'timeline-slider',
        type: 'range',
        min: snapshot.bands.footer.minPlaybackTime,
        max: snapshot.bands.footer.maxPlaybackTime,
        value: snapshot.bands.footer.selectedCheckpointIndex,
        step: snapshot.bands.footer.playbackStep,
        onInput: (event) => {
          const checkpointIndex = Number((event.currentTarget as HTMLInputElement).value);
          const checkpointTime = snapshot.bands.footer.checkpointTimes[checkpointIndex];
          if (checkpointTime !== undefined) {
            onSetPlaybackTime(checkpointTime);
          }
        },
      }),
    ]),
  ]);
