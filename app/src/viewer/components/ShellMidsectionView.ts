import { h, type FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { JSX } from 'preact';
import type { CreateScheduledMealActivityInput, UpdateScheduledMealActivityInput } from '../../runs/types';
import type { ShellSnapshot, SystemId, Workspace } from '../../models/shellSnapshot';
import { createPlannerMealActivityInput } from './plannerMealForm';
import { SplitView } from './SplitView';

function createSparklinePath(points: number[]): string {
  if (points.length === 0) {
    return '';
  }

  const width = 160;
  const height = 48;
  const minPoint = Math.min(...points);
  const maxPoint = Math.max(...points);
  const pointRange = Math.max(maxPoint - minPoint, 1);

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
      const y = height - ((point - minPoint) / pointRange) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export interface ShellMidsectionViewProps {
  snapshot: ShellSnapshot;
  onSelectWorkspace: (workspace: Workspace) => void;
  onSelectSystem: (systemId: SystemId) => void;
  onCreateMealActivity: (input: CreateScheduledMealActivityInput) => void;
  onUpdateMealActivity: (activityId: string, input: UpdateScheduledMealActivityInput) => void;
  onRemoveScheduledActivity: (activityId: string) => void;
}

export const ShellMidsectionView: FunctionalComponent<ShellMidsectionViewProps> = ({
  snapshot,
  onSelectWorkspace,
  onSelectSystem,
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

  useEffect(() => {
    if (!snapshot.planner.laneOptions.some((lane) => lane.id === laneId)) {
      setLaneId(snapshot.planner.laneOptions[0]?.id ?? '');
    }
  }, [snapshot.planner.laneOptions, laneId]);

  useEffect(() => {
    if (!snapshot.planner.mealOptions.some((meal) => meal.id === selectedMealId)) {
      setSelectedMealId(snapshot.planner.mealOptions[0]?.id ?? '');
    }
  }, [snapshot.planner.mealOptions, selectedMealId]);

  const selectedLane = snapshot.planner.laneOptions.find((lane) => lane.id === laneId) ?? snapshot.planner.laneOptions[0];
  const selectedMeal = snapshot.planner.mealOptions.find((meal) => meal.id === selectedMealId);

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
      h('div', { class: 'systems-list' }, [
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
      ]),
    ]),
    end: h('section', { class: 'detail-field' }, [
      h('div', { class: 'detail-heading' }, [
        h('p', { class: 'eyebrow' }, snapshot.workspace.label),
        h('h2', null, snapshot.bands.midsection.title),
        h('p', { class: 'detail-copy' }, snapshot.bands.midsection.copy),
      ]),
      snapshot.workspace.value === 'body-status'
        ? h('section', { class: 'live-results-panel' }, [
            h('div', { class: 'live-results-grid' },
              snapshot.bands.midsection.liveResults.cards.map((card) =>
                h('article', { key: card.title, class: 'live-result-card' }, [
                  h('span', { class: 'live-result-title' }, card.title),
                  h('strong', { class: 'live-result-value' }, card.value),
                  h('span', { class: 'live-result-delta' }, card.delta),
                ]),
              ),
            ),
            h('article', { class: 'detail-card sparkline-card' }, [
              h('div', { class: 'sparkline-heading' }, [
                h('h3', null, 'Blood sugar trail'),
                h('span', { class: 'sparkline-range' }, `${snapshot.bands.midsection.liveResults.sparkline.minLabel}–${snapshot.bands.midsection.liveResults.sparkline.maxLabel}`),
              ]),
              h('svg', { class: 'sparkline', viewBox: '0 0 160 48', 'aria-label': 'Blood sugar history sparkline' }, [
                h('path', {
                  d: createSparklinePath(snapshot.bands.midsection.liveResults.sparkline.points),
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '3',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                }),
              ]),
              h('div', { class: 'recent-moment-list' },
                snapshot.bands.midsection.liveResults.recentMoments.map((moment) =>
                  h('div', { key: `${moment.label}-${moment.playbackLabel}`, class: 'recent-moment-row' }, [
                    h('strong', null, moment.label),
                    h('span', null, moment.playbackLabel),
                    h('span', null, `Blood ${moment.bloodSugar}`),
                    h('span', null, `Gut ${moment.gutSugar}`),
                  ]),
                ),
              ),
            ]),
          ])
        : null,
      snapshot.workspace.value === 'event-planner'
        ? h('form', { class: 'planner-form detail-card', onSubmit: submitPlannerMeal }, [
            h('h3', null, selectedMeal ? 'Edit meal' : 'Add meal'),
            h('label', { class: 'planner-field' }, [
              h('span', null, 'Existing meals'),
              h('select', {
                value: selectedMealId,
                onInput: (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => setSelectedMealId(event.currentTarget.value),
              }, [
                h('option', { value: '' }, 'Create new meal'),
                ...snapshot.planner.mealOptions.map((meal) => h('option', { key: meal.id, value: meal.id }, meal.label)),
              ]),
            ]),
            h('label', { class: 'planner-field' }, [
              h('span', null, 'Lane'),
              h('select', {
                value: laneId,
                onInput: (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => setLaneId(event.currentTarget.value),
              }, snapshot.planner.laneOptions.map((lane) =>
                h('option', { key: lane.id, value: lane.id }, lane.label),
              )),
            ]),
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
            h('p', { class: 'planner-note' },
              selectedLane?.cycleDurationMinutes
                ? `Repeats inside a ${selectedLane.cycleDurationMinutes}-minute cycle from lane start.`
                : 'Places a one-off meal at an absolute playback time from run start.',
            ),
            h('div', { class: 'planner-action-row' }, [
              h('button', { class: 'control-chip', type: 'submit' }, selectedMeal ? 'Save meal' : 'Create meal'),
              selectedMeal
                ? h('button', { class: 'control-chip', type: 'button', onClick: clearSelection }, 'Cancel edit')
                : null,
              selectedMeal
                ? h('button', { class: 'control-chip', type: 'button', onClick: removeSelectedMeal }, 'Remove meal')
                : null,
            ]),
          ])
        : null,
      h('div', { class: 'detail-card-stack' },
        snapshot.bands.midsection.detailCards.map((card) =>
          h('article', { key: card.title, class: 'detail-card' }, [
            h('h3', null, card.title),
            h('p', null, card.body),
          ]),
        ),
      ),
    ]),
  });
};
