import { useCallback, useMemo } from 'react';
import { useUserStore, type CoreHabit, type HabitFrequency, type TimeOfDay } from '@/stores/userStore';
import { taskIconOptions } from '@/lib/taskIcons';
import { getLocalDateStr } from '@/lib/dateUtils';
import type { PlannedTask, RoutinePlan } from '@/lib/routinePlanParser';
import { track } from '@/hooks/useAnalytics';

const DAY_MAP: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

const VALID_ICON_IDS = new Set(taskIconOptions.map((o) => o.id));

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function similar(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  // shared significant words
  const wa = new Set(na.split(' ').filter((w) => w.length > 3));
  const wb = nb.split(' ').filter((w) => w.length > 3);
  const shared = wb.filter((w) => wa.has(w)).length;
  return shared >= Math.max(1, Math.min(wa.size, wb.length) - 1);
}

function periodToTimeOfDay(p?: string, time?: string): TimeOfDay {
  if (p === 'morning' || p === 'midday' || p === 'evening') return p;
  if (time) {
    const h = parseInt(time.split(':')[0] || '0', 10);
    if (h < 11) return 'morning';
    if (h < 17) return 'midday';
    return 'evening';
  }
  return 'morning';
}

function plannedToHabit(t: PlannedTask): CoreHabit {
  const today = getLocalDateStr();
  let frequency: HabitFrequency = 'daily';
  let specificDays: number[] | undefined;
  let oneOffDate: string | undefined;
  if (t.recurrence === 'weekly') {
    frequency = 'specific-days';
    specificDays = (t.days || [])
      .map((d) => DAY_MAP[d.toLowerCase()])
      .filter((n) => typeof n === 'number');
    if (!specificDays.length) specificDays = [1];
  } else if (t.recurrence === 'one-off') {
    frequency = 'one-off';
    oneOffDate = t.startsOn || today;
  }
  const icon = t.icon && VALID_ICON_IDS.has(t.icon) ? t.icon : 'star';
  // For recurring habits, startsOn lets us defer their first appearance.
  const startsOn = t.startsOn && t.startsOn > today ? t.startsOn : undefined;
  return {
    id: `ubi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: t.title,
    timeOfDay: periodToTimeOfDay(t.period, t.time),
    icon,
    frequency,
    specificDays,
    oneOffDate,
    scheduledTime: t.time || undefined,
    createdDate: today,
    startsOn,
  };
}

export interface DuplicateMatch {
  planned: PlannedTask;
  existing: CoreHabit;
}

export function useRoutinePlanner() {
  const coreHabits = useUserStore((s) => s.profile.coreHabits) || [];
  const setCoreHabits = useUserStore((s) => s.setCoreHabits);
  const clearHabitsForDate = useUserStore((s) => s.clearHabitsForDate);
  const snapshotRoutineForUndo = useUserStore((s) => s.snapshotRoutineForUndo);

  const findDuplicates = useCallback(
    (tasks: PlannedTask[]): DuplicateMatch[] => {
      const out: DuplicateMatch[] = [];
      tasks.forEach((p) => {
        const match = coreHabits.find((h) => similar(p.title, h.title));
        if (match) out.push({ planned: p, existing: match });
      });
      return out;
    },
    [coreHabits],
  );

  const writeTasks = useCallback(
    (
      tasks: PlannedTask[],
      duplicateMode: 'replace' | 'keep-both' | 'skip' = 'keep-both',
      meta?: { planType?: string; cyclePhase?: string | null },
    ) => {
      const duplicates = findDuplicates(tasks);
      const duplicateExistingIds = new Set(duplicates.map((d) => d.existing.id));
      const duplicatePlannedTitles = new Set(
        duplicates.map((d) => normalize(d.planned.title)),
      );

      let next = [...coreHabits];
      let added = 0;
      let replaced = 0;

      if (duplicateMode === 'replace' && duplicates.length) {
        next = next.filter((h) => !duplicateExistingIds.has(h.id));
        replaced = duplicates.length;
      }

      tasks.forEach((p) => {
        if (duplicateMode === 'skip' && duplicatePlannedTitles.has(normalize(p.title))) return;
        next.push(plannedToHabit(p));
        added += 1;
      });

      setCoreHabits(next);

      track('ubi_routine_plan_created', {
        source: 'ubi_routine_planner',
        plan_type: meta?.planType || 'unknown',
        tasks_added: added,
        tasks_replaced: replaced,
        cycle_phase: meta?.cyclePhase || null,
        is_premium: true,
      });

      return { added, replaced };
    },
    [coreHabits, setCoreHabits, findDuplicates],
  );

  const applyPlan = useCallback(
    (
      plan: RoutinePlan,
      duplicateMode: 'replace' | 'keep-both' | 'skip' = 'keep-both',
      meta?: { planType?: string; cyclePhase?: string | null },
    ): { added: number; replaced: number; cleared: number } => {
      const today = getLocalDateStr();

      if (plan.action === 'clear_today') {
        const targetDate = plan.startsOn && /^\d{4}-\d{2}-\d{2}$/.test(plan.startsOn)
          ? plan.startsOn
          : today;
        const cleared = coreHabits.filter(
          (h) =>
            (h.frequency === 'one-off' && (h.oneOffDate || h.createdDate) === targetDate) ||
            (h.frequency !== 'one-off' && !(h.skippedDates || []).includes(targetDate)),
        ).length;
        snapshotRoutineForUndo('clear_today');
        clearHabitsForDate(targetDate);
        track('ubi_routine_plan_created', {
          source: 'ubi_routine_planner',
          plan_type: meta?.planType || 'clear_today',
          tasks_added: 0,
          tasks_replaced: 0,
          tasks_cleared: cleared,
          cycle_phase: meta?.cyclePhase || null,
          is_premium: true,
        });
        return { added: 0, replaced: 0, cleared };
      }

      if (plan.action === 'replace_today') {
        // Target date: honour plan.startsOn (e.g. tomorrow). Falls back to today.
        const targetDate = plan.startsOn && /^\d{4}-\d{2}-\d{2}$/.test(plan.startsOn)
          ? plan.startsOn
          : today;
        const cleared = coreHabits.filter(
          (h) =>
            (h.frequency === 'one-off' && (h.oneOffDate || h.createdDate) === targetDate) ||
            (h.frequency !== 'one-off' && !(h.skippedDates || []).includes(targetDate)),
        ).length;
        snapshotRoutineForUndo('replace_today');
        clearHabitsForDate(targetDate);
        // Force every task to be a one-off pinned to the target date.
        const todayTasks: PlannedTask[] = plan.tasks.map((t) => ({
          ...t,
          recurrence: 'one-off',
          days: [],
          startsOn: targetDate,
        }));
        const { added } = writeTasks(todayTasks, 'keep-both', {
          planType: targetDate === today ? 'replace_today' : 'replace_date',
          cyclePhase: meta?.cyclePhase ?? null,
        });
        return { added, replaced: 0, cleared };
      }

      // add (default)
      snapshotRoutineForUndo('add');
      const { added, replaced } = writeTasks(plan.tasks, duplicateMode, meta);
      return { added, replaced, cleared: 0 };
    },
    [coreHabits, clearHabitsForDate, writeTasks, snapshotRoutineForUndo],
  );

  return useMemo(
    () => ({ findDuplicates, writeTasks, applyPlan }),
    [findDuplicates, writeTasks, applyPlan],
  );
}