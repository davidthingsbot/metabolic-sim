import { h, type FunctionalComponent } from 'preact';
import type { ShellFooterMealTimelineEvent, ShellSnapshot } from '../../models/shellSnapshot';

export interface ShellFooterViewProps {
  snapshot: ShellSnapshot;
  onSetPlaybackTime: (playbackTime: number) => void;
  onStepPlayback: () => void;
  onTogglePlaying: () => void;
  onBranchPlaybackTime: (playbackTime: number) => void;
}

function createMealEventClassName(event: ShellFooterMealTimelineEvent): string {
  return `timeline-meal-event timeline-meal-event-${event.status}`;
}

function createMealEventStyle(event: ShellFooterMealTimelineEvent): string {
  const widthPercent = Math.max(event.widthPercent, 0.6);
  return `left:${event.offsetPercent}%;width:${widthPercent}%;`;
}

export const ShellFooterView: FunctionalComponent<ShellFooterViewProps> = ({
  snapshot,
  onSetPlaybackTime,
  onStepPlayback,
  onTogglePlaying,
  onBranchPlaybackTime,
}) =>
  h('div', { class: 'footer-controls' }, [
    h('div', { class: 'control-cluster' }, [
      h('span', { class: 'control-label' }, 'Experiment'),
      h('div', { class: 'chip-row' }, [
        h('button', { class: snapshot.bands.footer.isPlaying ? 'control-chip active' : 'control-chip', type: 'button', onClick: onTogglePlaying },
          snapshot.bands.footer.isPlaying ? 'Pause' : 'Play',
        ),
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
        h('span', { class: 'control-label' }, 'Timeline scrubber'),
        h('span', { class: 'timeline-status' }, snapshot.bands.footer.scrubberStatus),
      ]),
      h('div', { class: 'timeline-meal-track' }, snapshot.bands.footer.mealTimelineEvents.map((event) =>
        h('div', { key: event.id, class: createMealEventClassName(event), style: createMealEventStyle(event) }, [
          h('span', { class: 'timeline-meal-event-label' }, event.label),
          h('span', { class: 'timeline-meal-event-time' }, `${event.startLabel}–${event.endLabel}`),
        ]),
      )),
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
      h('div', { class: 'timeline-event-readout' }, [
        h('p', null, snapshot.bands.footer.eventReadout.current),
        h('p', null, snapshot.bands.footer.eventReadout.mostRecent),
        h('p', null, snapshot.bands.footer.eventReadout.next),
      ]),
    ]),
  ]);
