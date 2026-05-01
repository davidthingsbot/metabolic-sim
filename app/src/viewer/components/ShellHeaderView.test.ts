import { describe, expect, it } from 'vitest';
import type { ComponentChildren, VNode } from 'preact';
import { ShellHeaderView } from './ShellHeaderView';
import type { ShellSnapshot } from '../../models/shellSnapshot';

function createSnapshot(): ShellSnapshot {
  return {
    runName: 'Metabolic Run',
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
        highLevelStatus: 'Body steady, recent meal digesting.',
        viewerStatus: 'Viewing Whole Body',
        runChipLabel: 'Run: Metabolic Run',
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
        scrubberStatus: 'Timeline status',
        playbackTime: 0,
        isPlaying: false,
        minPlaybackTime: 0,
        maxPlaybackTime: 0,
        playbackStep: 1,
        checkpointTimes: [0],
        selectedCheckpointIndex: 0,
        lifetimeTimelineEvents: [],
        mealTimelineEvents: [],
        eventReadout: {
          current: 'Now: No scheduled meal is active.',
          mostRecent: 'Most recent: No meal has completed yet.',
          next: 'Next: No upcoming meal is scheduled.',
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

describe('ShellHeaderView', () => {
  it('renders a compact title row with icon and viewer controls only', () => {
    const view = ShellHeaderView({
      snapshot: createSnapshot(),
      onToggleTheme: () => undefined,
      onToggleLabelMode: () => undefined,
    });

    const titleRow = findByClassName(view, 'header-brand');
    const viewerControls = findByClassName(view, 'header-viewer-controls');
    const icon = findByClassName(view, 'header-brand-icon');
    const headerText = flattenText(view);

    expect(titleRow?.props.children).toBeDefined();
    expect((icon?.props as { width?: number }).width).toBe(64);
    expect((icon?.props as { height?: number }).height).toBe(64);
    expect(flattenText(titleRow?.props.children)).toContain('Metabolic Simulator');
    expect(viewerControls?.props.children).toBeDefined();
    expect(flattenText(viewerControls?.props.children)).toContain('Plain labels');
    expect(flattenText(viewerControls?.props.children)).toContain('Dark mode');
    expect(headerText).not.toContain('Sim Bar');
    expect(headerText).not.toContain('Viewer Bar');
    expect(headerText).not.toContain('Pause');
    expect(headerText).not.toContain('Reset');
  });
});
