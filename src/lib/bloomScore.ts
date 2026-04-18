import { getLocalDateStr } from './dateUtils';
import { getCurrentCycleDay, getCurrentPhase, type CyclePhase } from './cycleUtils';
import type { UserProfile, MoodEntry, HabitCompletion, CycleData } from '@/stores/userStore';

// 1. Daily check-in / mood score
const CHECKIN_SCORE: Record<string, number> = {
  elevated: 100,
  aligned: 80,
  grounded: 60,
  'off-track': 40,
  disconnected: 20,
};

const PHASE_ENERGY_SCORE: Record<CyclePhase, number> = {
  Follicular: 100,
  Ovulatory: 100,
  Luteal: 70,
  Menstrual: 50,
};

function moodScoreToday(profile: Pick<UserProfile, 'dailyCheckinState' | 'lastMoodCheckinDate' | 'moodHistory'>): number {
  const today = getLocalDateStr();
  if (profile.dailyCheckinState && profile.lastMoodCheckinDate === today) {
    return CHECKIN_SCORE[profile.dailyCheckinState] ?? 50;
  }
  // Fallback: any mood entry today maps to grounded-ish neutral
  const todayEntry = (profile.moodHistory || []).find((m) => {
    const d = new Date(m.date);
    return getLocalDateStr(d) === today;
  });
  if (!todayEntry) return 50;
  // If a mood entry exists but no check-in state, average mapped scores
  const scores = todayEntry.moods
    .map((m) => CHECKIN_SCORE[m])
    .filter((s): s is number => typeof s === 'number');
  if (scores.length === 0) return 60;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function habitCompletionRateThisWeek(
  habitCompletions: HabitCompletion[],
  totalHabitsCount: number,
): number {
  if (totalHabitsCount === 0) return 50;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return getLocalDateStr(d);
  });
  const totalPossible = totalHabitsCount * 7;
  const completed = (habitCompletions || []).filter(
    (c) => c.completed && weekDates.includes(c.date),
  ).length;
  return Math.min(100, Math.round((completed / totalPossible) * 100));
}

function cyclePhaseScore(cycleData?: CycleData): number {
  if (!cycleData?.setupComplete || !cycleData.lastPeriodStart) return 70;
  try {
    const day = getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength);
    const phase = getCurrentPhase(day, cycleData.periodLength, cycleData.cycleLength);
    return PHASE_ENERGY_SCORE[phase];
  } catch {
    return 70;
  }
}

function consistencyScore(moodHistory: MoodEntry[], lastMoodCheckinDate?: string, dailyCheckinState?: string): number {
  const last7: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7.push(getLocalDateStr(d));
  }
  const loggedDays = new Set<string>();
  (moodHistory || []).forEach((m) => {
    const d = getLocalDateStr(new Date(m.date));
    if (last7.includes(d)) loggedDays.add(d);
  });
  // Daily check-in counts too
  if (lastMoodCheckinDate && last7.includes(lastMoodCheckinDate) && dailyCheckinState) {
    loggedDays.add(lastMoodCheckinDate);
  }
  return Math.round((loggedDays.size / 7) * 100);
}

export interface BloomBreakdown {
  total: number;
  mood: number;
  habits: number;
  cycle: number;
  consistency: number;
}

export function computeBloomScore(profile: UserProfile, totalHabitsCount: number): BloomBreakdown {
  const mood = moodScoreToday(profile);
  const habits = habitCompletionRateThisWeek(profile.habitCompletions || [], totalHabitsCount);
  const cycle = cyclePhaseScore(profile.cycleData);
  const consistency = consistencyScore(profile.moodHistory || [], profile.lastMoodCheckinDate, profile.dailyCheckinState);
  const total = Math.round(mood * 0.3 + habits * 0.3 + cycle * 0.2 + consistency * 0.2);
  return { total, mood, habits, cycle, consistency };
}
