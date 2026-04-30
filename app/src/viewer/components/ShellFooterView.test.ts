import { describe, expect, it } from 'vitest';
import type { ComponentChildren, VNode } from 'preact';
import { ShellFooterView } from './ShellFooterView';
import type { ShellSnapshot } from '../../models/shellSnapshot';

function createSnapshot(): ShellSnapshot {
  return {
    runName: 'Footer Test',
    labelMode: 'plain',
    theme: 'light',
    workspace: {
      value: 'body-status',
      label: 'Body Status',
      options: [{ value: 'body-status', label: 'Body Status', isSelected: true }],
    },
    planner: {
      laneOptions: [],
      mealOptions: [],
    },
    systems: [],
    subsystems: [],
    bands: {
      header: {
        eyebrow: 'Metabolic Simulator',
        highLevelStatus: 'Status',
        viewerStatus: 'Viewing Whole Body',
        runChipLabel: 'Run: Footer Test',
        labelModeToggleLabel: 'Plain labels',
        themeToggleLabel: 'Dark mode',
      },
      midsection: {
        title: 'Live results panel',
        copy: 'Copy',
        overviewMetrics: [],
        monitorCards: [],
        liveResults: {
          cards: [],
          sparkline: {
            points: [1],
            minLabel: '1.0 g',
            maxLabel: '1.0 g',
          },
          recentMoments: [],
        },
        detailCards: [],
      },
      footer: {
        scrubberStatus: 'Timeline 1h 30m · 4 checkpoints · Recorded 0h 00m–3h 00m',
        playbackTime: 5400,
        isPlaying: true,
        minPlaybackTime: 0,
        maxPlaybackTime: 3,
        playbackStep: 1,
        checkpointTimes: [0, 1800, 5400, 10800],
        selectedCheckpointIndex: 2,
        mealTimelineEvents: [
          {
            id: 'lunch-at-5400',
            label: 'Daily meal',
            laneLabel: 'Daily',
            startLabel: '1h 30m',
            endLabel: '2h 00m',
            summary: '45.0 g carbs over 30 min',
            status: 'active',
            offsetPercent: 50,
            widthPercent: 16.67,
          },
        ],
        eventReadout: {
          current: 'Now: Daily meal is underway · 1h 30m–2h 00m · 45.0 g carbs over 30 min.',
          mostRecent: 'Most recent: One-Off meal finished at 1h 00m · 20.0 g carbs over 30 min.',
          next: 'Next: Daily meal starts at 3h 00m · 15.0 g carbs over 20 min.',
        },
      },
    },
  };
}

function flattenText(children: ComponentChildren): string {
  if (children === null || children === undefined || typeof children === 'boolean') {
    return '';
  }

  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => flattenText(child)).join(' ');
  }

  return flattenText((children as VNode).props?.children);
}

function findByClassName(node: ComponentChildren, className: string): VNode | undefined {
  if (!node || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return undefined;
  }

  if (Array.isArray(node)) {
    return node.map((child) => findByClassName(child, className)).find((match) => match !== undefined);
  }

  const vnode = node as VNode<Record<string, unknown>>;
  if (vnode.props?.class === className) {
    return vnode;
  }

  return findByClassName(vnode.props?.children, className);
}

describe('ShellFooterView', () => {
  it('renders meal markers and explanatory readout from the footer snapshot', () => {
    const view = ShellFooterView({
      snapshot: createSnapshot(),
      onSetPlaybackTime: () => undefined,
      onStepPlayback: () => undefined,
      onTogglePlaying: () => undefined,
      onBranchPlaybackTime: () => undefined,
    });

    const marker = findByClassName(view, 'timeline-meal-event timeline-meal-event-active');
    const readout = findByClassName(view, 'timeline-event-readout');

    expect(flattenText(marker?.props.children)).toContain('Daily meal');
    expect(flattenText(marker?.props.children)).toContain('1h 30m–2h 00m');
    expect(flattenText(readout?.props.children)).toContain('Now: Daily meal is underway');
    expect(flattenText(readout?.props.children)).toContain('Most recent: One-Off meal finished at 1h 00m');
    expect(flattenText(readout?.props.children)).toContain('Next: Daily meal starts at 3h 00m');
  });
});
