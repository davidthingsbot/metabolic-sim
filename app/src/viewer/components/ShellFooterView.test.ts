import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
        sparklineMetricLabel: 'Sparkline: Blood sugar',
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
        exactTimestampLabel: 'T+0y 000d 01:30:00',
        isPlaying: true,
        playbackSpeedMultiplier: 15,
        playbackSpeedLabel: '15×',
        numericalAnimationMs: 300,
        minPlaybackTime: 0,
        maxPlaybackTime: 3,
        playbackStep: 1,
        checkpointTimes: [0, 1800, 5400, 10800],
        selectedCheckpointIndex: 2,
        lifetimeTimelineEvents: [
          {
            id: 'daily-lunch-pattern',
            label: 'Daily meal',
            laneLabel: 'Daily',
            summary: '45.0 g carbs over 30 min · every day',
            repeatKind: 'dense',
            status: 'active',
            offsetPercent: 0,
            widthPercent: 100,
          },
          {
            id: 'doctor-visit-at-864000',
            label: 'One-Off meal',
            laneLabel: 'One-Off',
            summary: '20.0 g carbs over 30 min',
            repeatKind: 'rare',
            status: 'upcoming',
            offsetPercent: 0.03,
            widthPercent: 0.2,
          },
        ],
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
  it('renders meal markers without explanatory text underneath the timelines', () => {
    const view = ShellFooterView({
      snapshot: createSnapshot(),
      onSetPlaybackTime: () => undefined,
      onStepPlayback: () => undefined,
      onTogglePlaying: () => undefined,
      onCyclePlaybackSpeed: () => undefined,
      onBranchPlaybackTime: () => undefined,
    });

    const marker = findByClassName(view, 'timeline-meal-event timeline-meal-event-active');
    const readout = findByClassName(view, 'timeline-event-readout');

    expect(flattenText(marker?.props.children)).toContain('Daily meal');
    expect(flattenText(marker?.props.children)).toContain('1h 30m–2h 00m');
    expect(readout).toBeUndefined();
    expect(flattenText((view as VNode).props.children)).not.toContain('Now: Daily meal is underway');
    expect(flattenText((view as VNode).props.children)).not.toContain('Most recent: One-Off meal finished at 1h 00m');
    expect(flattenText((view as VNode).props.children)).not.toContain('Next: Daily meal starts at 3h 00m');
  });

  it('renders a master lifetime timeline and a detailed day timeline', () => {
    const view = ShellFooterView({
      snapshot: createSnapshot(),
      onSetPlaybackTime: () => undefined,
      onStepPlayback: () => undefined,
      onTogglePlaying: () => undefined,
      onCyclePlaybackSpeed: () => undefined,
      onBranchPlaybackTime: () => undefined,
    });

    const master = findByClassName(view, 'timeline-scale timeline-scale-lifetime');
    const detail = findByClassName(view, 'timeline-scale timeline-scale-day');
    const windowMarker = findByClassName(view, 'timeline-detail-window');
    const masterNow = findByClassName(view, 'timeline-now-marker timeline-now-marker-lifetime');
    const dayNow = findByClassName(view, 'timeline-now-marker timeline-now-marker-day');

    expect(flattenText(master?.props.children)).toContain('Lifetime');
    expect(flattenText(master?.props.children)).toContain('Year 0');
    expect(flattenText(master?.props.children)).toContain('Year 80');
    expect(flattenText(detail?.props.children)).toContain('Selected day');
    expect(flattenText(detail?.props.children)).toContain('00:00');
    expect(flattenText(detail?.props.children)).toContain('24:00');
    expect(windowMarker).toBeDefined();
    expect(masterNow).toBeDefined();
    expect(dayNow).toBeDefined();
    expect((masterNow?.props as { style?: string } | undefined)?.style).toBe('left:0%;');
    expect((dayNow?.props as { style?: string } | undefined)?.style).toBe('left:6.25%;');
  });

  it('draws dense daily patterns on the lifetime timeline and all selected-day events as duration blocks', () => {
    const view = ShellFooterView({
      snapshot: createSnapshot(),
      onSetPlaybackTime: () => undefined,
      onStepPlayback: () => undefined,
      onTogglePlaying: () => undefined,
      onCyclePlaybackSpeed: () => undefined,
      onBranchPlaybackTime: () => undefined,
    });

    const master = findByClassName(view, 'timeline-scale timeline-scale-lifetime');
    const dailyBand = findByClassName(master, 'timeline-lifetime-event timeline-lifetime-event-dense timeline-lifetime-event-active');
    const rareEvent = findByClassName(master, 'timeline-lifetime-event timeline-lifetime-event-rare timeline-lifetime-event-upcoming');
    const selectedDayEvent = findByClassName(view, 'timeline-meal-event timeline-meal-event-active');

    expect(flattenText(dailyBand?.props.children)).toContain('Daily meal');
    expect((dailyBand?.props as { style?: string } | undefined)?.style).toBe('left:0%;width:100%;');
    expect(flattenText(rareEvent?.props.children)).toContain('One-Off meal');
    expect(flattenText(selectedDayEvent?.props.children)).toContain('Daily meal');
    expect(flattenText(selectedDayEvent?.props.children)).toContain('1h 30m–2h 00m');
  });

  it('shows the precise simulator timestamp and cycles playback speed from the control cluster', () => {
    let speedClicks = 0;
    const view = ShellFooterView({
      snapshot: createSnapshot(),
      onSetPlaybackTime: () => undefined,
      onStepPlayback: () => undefined,
      onTogglePlaying: () => undefined,
      onCyclePlaybackSpeed: () => { speedClicks += 1; },
      onBranchPlaybackTime: () => undefined,
    });

    const timestamp = findByClassName(view, 'simulator-timestamp animated-number');
    const footerStyle = ((view as VNode).props as { style?: string }).style;
    const footerText = flattenText((view as VNode).props.children);

    expect(flattenText(timestamp?.props.children)).toBe('T+0y 000d 01:30:00');
    expect(footerStyle).toBe('--numeric-animation-duration: 300ms;');
    expect(footerText).toContain('15×');

    const controls = findByClassName(view, 'chip-row')?.props.children as VNode[];
    const speedButton = controls.find((child) => flattenText(child.props.children) === '15×');
    (speedButton?.props as { onClick?: () => void }).onClick?.();

    expect(speedClicks).toBe(1);
  });

  it('allocates footer width to controls first and lets timelines take the remaining width', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const footerRule = stylesheet.match(/\.footer-controls\s*\{[\s\S]*?grid-template-columns:\s*([^;]+);[\s\S]*?\}/);
    const timelineBlockRule = stylesheet.match(/\.timeline-block\s*\{[\s\S]*?min-width:\s*([^;]+);[\s\S]*?\}/);
    const timelineScaleRule = stylesheet.match(/\.timeline-scale\s*\{[\s\S]*?border-top:\s*([^;]+);[\s\S]*?\}/);

    expect(footerRule?.[1]?.trim()).toBe('auto minmax(0, 1fr)');
    expect(timelineBlockRule?.[1]?.trim()).toBe('0');
    expect(timelineScaleRule?.[1]?.trim()).toBe('2px solid var(--fg)');
  });

  it('styles selected-day event rectangles as visible solid blocks', () => {
    const stylesheet = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');
    const eventRule = stylesheet.match(/\.timeline-meal-event\s*\{[\s\S]*?min-height:\s*([^;]+);[\s\S]*?background:\s*([^;]+);[\s\S]*?\}/);
    const activeRule = stylesheet.match(/\.timeline-meal-event-active\s*\{[\s\S]*?background:\s*([^;]+);[\s\S]*?\}/);
    const upcomingRule = stylesheet.match(/\.timeline-meal-event-upcoming\s*\{[\s\S]*?background:\s*([^;]+);[\s\S]*?\}/);

    expect(eventRule?.[1]?.trim()).toBe('1.35rem');
    expect(eventRule?.[2]?.trim()).toBe('var(--accent-soft)');
    expect(activeRule?.[1]?.trim()).toBe('var(--accent)');
    expect(upcomingRule?.[1]?.trim()).toBe('var(--panel-strong)');
  });
});
