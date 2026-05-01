import { h, type FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { CreateScheduleLaneInput, CreateScheduledMealActivityInput, UpdateScheduledMealActivityInput } from '../../runs/types';
import type { ShellPlannerLaneOption, ShellPlannerMealOption, ShellSnapshot, SystemId, Workspace } from '../../models/shellSnapshot';
import { createPlannerMealActivityInput } from './plannerMealForm';
import { SplitView } from './SplitView';

export interface ShellMidsectionViewProps {
  snapshot: ShellSnapshot;
  onSelectWorkspace: (workspace: Workspace) => void;
  onSelectSystem: (systemId: SystemId) => void;
  onToggleSubsystem: (subsystemId: string) => void;
  onCreateScheduleLane: (input: CreateScheduleLaneInput) => void;
  onCreateMealActivity: (input: CreateScheduledMealActivityInput) => void;
  onUpdateMealActivity: (activityId: string, input: UpdateScheduledMealActivityInput) => void;
  onRemoveScheduledActivity: (activityId: string) => void;
}

function parseTimeOfDayMinutes(timeOfDay: string): number {
  const [hoursText = '0', minutesText = '0'] = timeOfDay.split(':');
  const hours = Number.parseInt(hoursText, 10);
  const minutes = Number.parseInt(minutesText, 10);
  const safeHours = Number.isFinite(hours) ? hours : 0;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  return safeHours * 60 + safeMinutes;
}

function roundPlannerPercent(value: number): number {
  return Number(value.toFixed(2));
}

export function formatPlannerHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function formatPlannerMinuteOfDay(totalMinutes: number): string {
  const clampedMinutes = Math.max(0, Math.min(1439, totalMinutes));
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const plannerDayWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];

export function formatPlannerDayLabel(day: number): string {
  return `Day ${plannerDayWords[day] ?? day}`;
}

export function createPlannerDraftFromTimelineSlot(day: number, hour: number): { day: number; timeOfDay: string } {
  return {
    day,
    timeOfDay: formatPlannerHour(hour),
  };
}

export function createPlannerDraftFromTimelinePosition(day: number, offsetY: number, height: number): { day: number; timeOfDay: string } {
  if (height <= 0) {
    return createPlannerDraftFromTimelineSlot(day, 0);
  }

  const progress = Math.max(0, Math.min(offsetY / height, 1));
  const roundedMinuteOfDay = Math.round((progress * 1440) / 15) * 15;
  const minuteOfDay = Math.min(1425, roundedMinuteOfDay);
  return {
    day,
    timeOfDay: formatPlannerMinuteOfDay(minuteOfDay),
  };
}

export function createPlannerEventPlacement(timeOfDay: string, durationMinutes: number): { topPercent: number; heightPercent: number } {
  return {
    topPercent: roundPlannerPercent((parseTimeOfDayMinutes(timeOfDay) / 1440) * 100),
    heightPercent: roundPlannerPercent((Math.max(durationMinutes, 1) / 1440) * 100),
  };
}

export function getVisiblePlannerDays(selectedLane: ShellPlannerLaneOption | undefined, mealOptions: ShellPlannerMealOption[]): number[] {
  if (!selectedLane) {
    return [0];
  }

  if (selectedLane.cycleDurationMinutes) {
    return Array.from({ length: Math.max(1, Math.ceil(selectedLane.cycleDurationMinutes / 1440)) }, (_, index) => index);
  }

  const laneMeals = mealOptions.filter((meal) => meal.laneId === selectedLane.id);
  const maxDay = laneMeals.reduce((currentMax, meal) => Math.max(currentMax, meal.day), 0);
  return Array.from({ length: Math.max(1, maxDay + 1) }, (_, index) => index);
}

export function createPlannerCellMeals(
  laneId: string,
  mealOptions: ShellPlannerMealOption[],
  day: number,
  hour: number,
): ShellPlannerMealOption[] {
  return mealOptions.filter((meal) => meal.laneId === laneId && meal.day === day && Math.floor(parseTimeOfDayMinutes(meal.timeOfDay) / 60) === hour);
}

function createPlannerDayMeals(laneId: string, mealOptions: ShellPlannerMealOption[], day: number): ShellPlannerMealOption[] {
  return mealOptions.filter((meal) => meal.laneId === laneId && meal.day === day);
}

export const ShellMidsectionView: FunctionalComponent<ShellMidsectionViewProps> = ({
  snapshot,
  onSelectWorkspace,
  onSelectSystem,
  onToggleSubsystem,
  onCreateScheduleLane,
  onCreateMealActivity,
  onUpdateMealActivity,
  onRemoveScheduledActivity,
}) => {
  const [selectedMealId, setSelectedMealId] = useState('');
  const [laneId, setLaneId] = useState(snapshot.planner.laneOptions[0]?.id ?? '');
  const [day, setDay] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [carbsGrams, setCarbsGrams] = useState(45);
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [customLaneDays, setCustomLaneDays] = useState('2');

  useEffect(() => {
    if (!snapshot.planner.laneOptions.some((lane) => lane.id === laneId)) {
      setLaneId(snapshot.planner.laneOptions[0]?.id ?? '');
    }
  }, [snapshot.planner.laneOptions, laneId]);

  useEffect(() => {
    if (!snapshot.planner.mealOptions.some((meal) => meal.id === selectedMealId)) {
      setSelectedMealId('');
    }
  }, [snapshot.planner.mealOptions, selectedMealId]);

  const selectedLane = snapshot.planner.laneOptions.find((lane) => lane.id === laneId) ?? snapshot.planner.laneOptions[0];
  const selectedMeal = snapshot.planner.mealOptions.find((meal) => meal.id === selectedMealId);
  const visiblePlannerDays = getVisiblePlannerDays(selectedLane, snapshot.planner.mealOptions);

  useEffect(() => {
    if (!selectedMeal) {
      return;
    }

    setLaneId(selectedMeal.laneId);
    setDay(selectedMeal.day);
    setTimeOfDay(selectedMeal.timeOfDay);
    setDurationMinutes(selectedMeal.durationMinutes);
    setCarbsGrams(selectedMeal.carbsGrams);
  }, [selectedMealId, selectedMeal]);

  function submitPlannerMeal(event: Event): void {
    event.preventDefault();
    if (!laneId) {
      return;
    }

    const input = createPlannerMealActivityInput({
      laneId,
      day,
      timeOfDay,
      durationMinutes,
      carbsGrams,
    });

    if (selectedMealId) {
      onUpdateMealActivity(selectedMealId, input);
      return;
    }

    onCreateMealActivity(input);
  }

  function submitCustomLane(event: Event): void {
    event.preventDefault();
    const dayCount = Number.parseInt(customLaneDays, 10);
    if (!Number.isFinite(dayCount) || dayCount < 1) {
      return;
    }

    onCreateScheduleLane({ durationMinutes: dayCount * 1440 });
    setCustomLaneDays('2');
    setIsAddingLane(false);
  }

  function selectPlannerLane(nextLaneId: string): void {
    setLaneId(nextLaneId);
    setSelectedMealId('');
  }

  function selectPlannerTimelinePosition(nextDay: number, event: JSX.TargetedMouseEvent<HTMLButtonElement>): void {
    const draft = createPlannerDraftFromTimelinePosition(nextDay, event.offsetY, event.currentTarget.clientHeight);
    setSelectedMealId('');
    setDay(draft.day);
    setTimeOfDay(draft.timeOfDay);
  }

  function clearSelection(): void {
    setSelectedMealId('');
  }

  function removeSelectedMeal(): void {
    if (!selectedMealId) {
      return;
    }

    onRemoveScheduledActivity(selectedMealId);
    setSelectedMealId('');
  }

  return h(SplitView, {
    className: 'shell-midsection',
    start: h('aside', { class: 'systems-rail' }, [
      h('div', { class: 'workspace-selector' }, [
        h('span', { class: 'control-label' }, 'Workspace'),
        h('div', { class: 'workspace-toggle', role: 'tablist', 'aria-label': 'Workspace selector' },
          snapshot.workspace.options.map((option) =>
            h(
              'button',
              {
                key: option.value,
                class: option.isSelected ? 'workspace-button active' : 'workspace-button',
                type: 'button',
                onClick: () => onSelectWorkspace(option.value),
              },
              option.label,
            ),
          ),
        ),
      ]),
      snapshot.workspace.value === 'body-status'
        ? h('div', { class: 'systems-list' }, [
            h('span', { class: 'control-label' }, 'Systems'),
            ...snapshot.systems.map((system) =>
              h(
                'button',
                {
                  key: system.id,
                  class: system.isSelected ? 'system-chip active' : 'system-chip',
                  type: 'button',
                  onClick: () => onSelectSystem(system.id),
                },
                [h('strong', null, system.label), h('span', null, system.caption)],
              ),
            ),
          ])
        : null,
      snapshot.workspace.value === 'body-status'
        ? h('div', { class: 'subsystems-list' }, [
            h('span', { class: 'control-label' }, 'Subsystems'),
            ...snapshot.subsystems.map((subsystem) =>
              h(
                'button',
                {
                  key: subsystem.id,
                  class: subsystem.isEnabled ? 'system-chip active' : 'system-chip',
                  type: 'button',
                  onClick: () => onToggleSubsystem(subsystem.id),
                },
                [h('strong', null, subsystem.label), h('span', null, subsystem.caption)],
              ),
            ),
          ])
        : null,
      snapshot.workspace.value === 'event-planner'
        ? h('div', { class: 'systems-list planner-lane-selector' }, [
            h('span', { class: 'control-label' }, 'Cycles'),
            ...snapshot.planner.laneOptions.map((lane) =>
              h(
                'button',
                {
                  key: lane.id,
                  class: lane.id === laneId ? 'system-chip active' : 'system-chip',
                  type: 'button',
                  onClick: () => selectPlannerLane(lane.id),
                },
                [h('strong', null, lane.label), h('span', null, lane.placementLabel)],
              ),
            ),
            h('button', {
              class: isAddingLane ? 'system-chip active planner-add-lane-button' : 'system-chip planner-add-lane-button',
              type: 'button',
              onClick: () => setIsAddingLane((currentValue) => !currentValue),
            }, [h('strong', null, '+'), h('span', null, 'Custom lane')]),
            isAddingLane
              ? h('form', { class: 'planner-lane-form', onSubmit: submitCustomLane }, [
                  h('label', { class: 'planner-field' }, [
                    h('span', null, 'Duration (days)'),
                    h('input', {
                      type: 'number',
                      min: 1,
                      step: 1,
                      value: customLaneDays,
                      onInput: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => setCustomLaneDays(event.currentTarget.value),
                    }),
                  ]),
                  h('button', { class: 'control-chip', type: 'submit' }, 'Add lane'),
                ])
              : null,
          ])
        : null,
    ]),
    end: h('section', { class: snapshot.workspace.value === 'event-planner' ? 'detail-field detail-field-planner' : 'detail-field' }, [
      snapshot.bands.midsection.title || snapshot.bands.midsection.copy || snapshot.workspace.value !== 'event-planner'
        ? h('div', { class: 'detail-heading' }, [
            snapshot.workspace.value === 'body-status' ? null : h('p', { class: 'eyebrow' }, snapshot.workspace.label),
            snapshot.bands.midsection.title ? h('h2', null, snapshot.bands.midsection.title) : null,
            snapshot.bands.midsection.copy ? h('p', { class: 'detail-copy' }, snapshot.bands.midsection.copy) : null,
          ])
        : null,
      snapshot.workspace.value === 'body-status'
        ? h('section', { class: 'live-results-panel' }, [
            h('div', { class: 'overview-bar' },
              snapshot.bands.midsection.overviewMetrics.map((metric) =>
                h('article', { key: metric.label, class: 'overview-metric' }, [
                  h('span', { class: 'live-result-title' }, metric.label),
                  h('strong', { class: 'live-result-value' }, metric.value),
                ]),
              ),
            ),
            h('div', { class: 'live-results-grid' },
              snapshot.bands.midsection.monitorCards.map((card) =>
                h('article', { key: card.id, class: 'live-result-card' }, [
                  h('span', { class: 'live-result-title' }, card.title),
                  h('strong', { class: 'live-result-value' }, card.value),
                  h('span', { class: 'live-result-delta' }, card.delta),
                  h('span', { class: 'monitor-card-note' }, card.note),
                ]),
              ),
            ),
          ])
        : null,
      snapshot.workspace.value === 'event-planner'
        ? h('section', { class: 'planner-panel' }, [
            h('div', { class: 'planner-timeline detail-card' }, [
              h('div', { class: 'planner-timeline-scroll' }, [
                h('div', { class: 'planner-timeline-grid', style: `--planner-day-count: ${visiblePlannerDays.length};` },
                  visiblePlannerDays.map((visibleDay) =>
                    h('div', { key: `day-${visibleDay}`, class: 'planner-day-column' }, [
                      h('div', { class: 'planner-day-heading' }, formatPlannerDayLabel(visibleDay)),
                      h('button', {
                        class: 'planner-day-track',
                        type: 'button',
                        onClick: (event: JSX.TargetedMouseEvent<HTMLButtonElement>) => selectPlannerTimelinePosition(visibleDay, event),
                      }, [
                        h('span', { class: 'planner-day-line', 'aria-hidden': 'true' }),
                        h('span', { class: 'planner-hour-rows', 'aria-hidden': 'true' },
                          Array.from({ length: 24 }, (_, hour) =>
                            h('span', { key: `grid-${visibleDay}-${hour}`, class: 'planner-hour-row' }, [
                              h('span', { class: 'planner-hour-label' }, formatPlannerHour(hour)),
                              h('span', { class: 'planner-hour-check' }),
                            ]),
                          ),
                        ),
                        ...(selectedLane ? createPlannerDayMeals(selectedLane.id, snapshot.planner.mealOptions, visibleDay) : []).map((meal) => {
                          const placement = createPlannerEventPlacement(meal.timeOfDay, meal.durationMinutes);
                          return h('span', {
                            key: meal.id,
                            class: 'planner-track-event planner-track-event-meal' + (meal.id === selectedMealId ? ' planner-track-event-selected' : ''),
                            title: meal.label,
                            style: `top: ${placement.topPercent}%; height: max(${placement.heightPercent}%, 0.45rem);`,
                            onClick: (clickEvent: MouseEvent) => {
                              clickEvent.stopPropagation();
                              setSelectedMealId(meal.id);
                            },
                          });
                        }),
                      ]),
                    ]),
                  ),
                ),
              ]),
            ]),
            h('form', { class: 'planner-editor planner-form detail-card' + (selectedMeal ? ' planner-form-editing' : ''), onSubmit: submitPlannerMeal }, [
              h('h3', null, selectedMeal ? 'Edit event' : 'Add event'),
              h('div', { class: 'planner-grid' }, [
                h('label', { class: 'planner-field' }, [
                  h('span', null, 'Day offset'),
                  h('input', {
                    type: 'number',
                    min: 0,
                    value: day,
                    onInput: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => setDay(Number(event.currentTarget.value)),
                  }),
                ]),
                h('label', { class: 'planner-field' }, [
                  h('span', null, selectedLane?.placementLabel ?? 'Start time'),
                  h('input', {
                    type: 'time',
                    value: timeOfDay,
                    onInput: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => setTimeOfDay(event.currentTarget.value),
                  }),
                ]),
              ]),
              h('div', { class: 'planner-grid' }, [
                h('label', { class: 'planner-field' }, [
                  h('span', null, 'Duration (min)'),
                  h('input', {
                    type: 'number',
                    min: 1,
                    value: durationMinutes,
                    onInput: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => setDurationMinutes(Number(event.currentTarget.value)),
                  }),
                ]),
                h('label', { class: 'planner-field' }, [
                  h('span', null, 'Carbs (g)'),
                  h('input', {
                    type: 'number',
                    min: 1,
                    step: 1,
                    value: carbsGrams,
                    onInput: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => setCarbsGrams(Number(event.currentTarget.value)),
                  }),
                ]),
              ]),
              h('div', { class: 'planner-action-row' }, [
                h('button', { class: 'control-chip', type: 'submit' }, selectedMeal ? 'Save meal' : 'Create meal'),
                selectedMeal
                  ? h('button', { class: 'control-chip', type: 'button', onClick: clearSelection }, 'Cancel edit')
                  : null,
                selectedMeal
                  ? h('button', { class: 'control-chip', type: 'button', onClick: removeSelectedMeal }, 'Remove meal')
                  : null,
              ]),
            ]),
          ])
        : null,
      snapshot.bands.midsection.detailCards.length > 0
        ? h('div', { class: 'detail-card-stack' },
            snapshot.bands.midsection.detailCards.map((card) =>
              h('article', { key: card.title, class: 'detail-card' }, [
                h('h3', null, card.title),
                h('p', null, card.body),
              ]),
            ),
          )
        : null,
    ]),
  });
};
