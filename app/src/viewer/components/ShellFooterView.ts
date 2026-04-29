import { h, type FunctionalComponent } from 'preact';
import type { ShellSnapshot } from '../../models/shellSnapshot';

export interface ShellFooterViewProps {
  snapshot: ShellSnapshot;
  onSetPlaybackTime: (playbackTime: number) => void;
  onStepPlayback: () => void;
  onBranchPlaybackTime: (playbackTime: number) => void;
}

export const ShellFooterView: FunctionalComponent<ShellFooterViewProps> = ({
  snapshot,
  onSetPlaybackTime,
  onStepPlayback,
  onBranchPlaybackTime,
}) =>
  h('div', { class: 'footer-controls' }, [
    h('div', { class: 'control-cluster' }, [
      h('span', { class: 'control-label' }, 'Experiment'),
      h('div', { class: 'chip-row' }, [
        h('button', { class: 'control-chip', type: 'button' }, 'Play'),
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
