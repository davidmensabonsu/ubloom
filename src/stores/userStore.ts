import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocalDateStr } from '@/lib/dateUtils';

/** Inlined to avoid a circular import with FrequencyPicker. */
function isHabitScheduledForDateLocal(habit: CoreHabit, dateStr: string): boolean {
  if ((habit.skippedDates || []).includes(dateStr)) return false;
  // Honour an explicit start date: hide the habit on any day before it.
  const startsOn = habit.startsOn;
  if (startsOn && dateStr < startsOn) return false;
  const freq = habit.frequency;
  if (!freq) {
    const anchor = habit.oneOffDate || habit.createdDate;
    return anchor ? anchor === dateStr : false;
  }
  if (freq === 'daily') return true;
  if (freq === 'one-off') {
    const anchor = habit.oneOffDate || habit.createdDate;
    return !!anchor && anchor === dateStr;
  }
  if (freq === 'specific-days') {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return (habit.specificDays || []).includes(date.getDay());
  }
  return false;
}

export type TimeOfDay = 'morning' | 'midday' | 'evening';
export type HabitFrequency = 'daily' | 'specific-days' | 'one-off';

/**
 * Unified to-do item. Historically there were two types (CoreHabit and CustomTask) —
 * they have been merged. CustomTask is kept as a deprecated alias for backward-compat
 * during the data migration in `merge()` below.
 */
export interface CoreHabit {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon?: string;
  frequency?: HabitFrequency;       // defaults to 'daily'
  specificDays?: number[];           // 0=Sun, 1=Mon, ... 6=Sat
  oneOffDate?: string;               // yyyy-MM-dd for one-off habits
  scheduledTime?: string;            // HH:mm format, optional specific time
  createdDate?: string;              // yyyy-MM-dd local date when the habit was added
  /** yyyy-MM-dd dates where this recurring habit should be hidden for that day only */
  skippedDates?: string[];
  /** yyyy-MM-dd: the earliest date this habit is scheduled to appear on. */
  startsOn?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // yyyy-MM-dd format
  completed: boolean;
}

export interface DailyTaskSnapshotItem {
  taskId: string;
  title: string;
  completed: boolean;
  icon?: string;
  time?: string;
}

export interface UserProfile {
  // Onboarding answers
  currentFeeling: string;
  struggles: string[];
  reactionStyle: string;
  wantsMoreOf: string[];
  dreamSelfFeels: string[];
  identityStatement: string;
  futureNote: string;
  interests: string[];
  
  // Dream self by category
  dreamSelf: {
    career: string[];
    selfWorth: string[];
    wellness: string[];
    peace: string[];
    lifestyle: string[];
    love: string[];
  };
  
  // Dream images by category
  dreamImages: {
    career?: string;
    selfWorth?: string;
    wellness?: string;
    peace?: string;
    lifestyle?: string;
    love?: string;
  };
  
  // Visual theme
  aesthetic: string;
  
  // App data
  journalEntries: JournalEntry[];
  moodHistory: MoodEntry[];
  routineTasks: RoutineTask[]; // Now used for one-off daily tasks only
  coreHabits: CoreHabit[];
  habitCompletions: HabitCompletion[];
  routineSetupComplete: boolean;
  dailyTaskSnapshots?: { [dateKey: string]: DailyTaskSnapshotItem[] };
  lastSnapshotDate?: string; // yyyy-MM-dd of the last day we ran the snapshot pass
   reminderSettings: ReminderSettings;
  savedResources: string[];
  savedRecipes: string[]; // "resourceId::recipeIndex"
  usedResources: string[];
  recentlyViewedResources: string[]; // ordered, most recent first, max 20
  resourceCompletions: ResourceCompletion[];
  moodboardItems: MoodboardItem[];
  cachedFutureSelfMessage?: CachedFutureSelfMessage;
  cachedMindsetMessage?: CachedMindsetMessage;
  cachedFocusToday?: CachedMindsetMessage; // reuses same shape (message + dateKey)
  ubiMessages?: UbiMessage[];
  onboardingComplete: boolean;
  lastMoodCheckinDate?: string; // yyyy-MM-dd
  dailyCheckinState?: string; // disconnected/off-track/grounded/aligned/elevated
  ubiIntroSeen?: boolean;
  healthData?: HealthData;
  healthHistory?: HealthHistoryEntry[];
  cycleData?: CycleData;
  walkthroughComplete?: boolean;
  showTrialWelcome?: boolean;
  trialStartedAt?: string; // ISO date when free trial began
  // Ubi onboarding
  preferredName?: string;
  communicationTone?: string;
  lifeStage?: string;
  primaryFocusArea?: string;
  neverForget?: string;
  ubiOnboardingComplete?: boolean;
  ubiSummary?: string;
  intentionCompletedDate?: string; // yyyy-MM-dd — last day the user marked today's intention as done
  // Reflect page caches
  bloomScore?: number;
  cachedJournalPrompt?: { prompt: string; dateKey: string };
  cachedWeeklySummary?: { letter: string; weekKey: string };
  // Cached snapshot of the user's subscription so premium gating can render
  // instantly on cold start, before the live DB fetch completes.
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
    currentPeriodEnd: string | null;
    trialStartedAt?: string | null;
    updatedAt: string; // ISO
  };

  // Convenience flags mirrored from the live useSubscription hook so any
  // component (or non-hook code) can read premium state from the store.
  isPremium?: boolean;
  isTrialing?: boolean;
  trialEndsAt?: string;
  subscriptionStatus?: string;

  // Per-day Ubi message counter for free users
  dailyUbiMessageCount?: { count: number; date: string };

  // Set to true once the user has dismissed the post-trial lockout modal
  // and chosen to "Continue with free tier". Lets us suppress the gate
  // until trial state changes.
  acknowledgedFreeTier?: boolean;
  legalConsentDate?: string; // ISO date when user accepted Terms/Privacy/Data Protection
}

export interface PeriodLogEntry {
  date: string; // yyyy-MM-dd
  cycleLength?: number; // days since previous period start
}

export interface CycleData {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  setupComplete: boolean;
  periodHistory?: PeriodLogEntry[];
  dateOfBirth?: string; // yyyy-MM-dd
}

export interface HealthData {
  cycle?: string;
  sleepHours?: number;
  stressLevel?: number;
  recoveryLevel?: number;
  activityMinutes?: number;
  steps?: number;
  lastUpdated?: string;
}

export interface HealthHistoryEntry {
  date: string;
  sleepHours?: number;
  stressLevel?: number;
  recoveryLevel?: number;
  activityMinutes?: number;
  steps?: number;
  cycle?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: string;
  // Voice mode
  audioPath?: string;       // storage path within voice-journals bucket
  audioDurationSec?: number;
  // Video mode
  videoPath?: string;       // storage path within video-journals bucket
  videoDurationSec?: number;
}

export interface MoodEntry {
  id: string;
  moods: string[];
  date: string;
}

export interface RoutineTask {
  id: string;
  title: string;
  category: 'glow' | 'wellness' | 'plans';
  completed: boolean;
  date: string;
  icon?: string;
  timeOfDay?: TimeOfDay;
}

export interface CachedFutureSelfMessage {
  message: string;
  weekKey: string; // e.g. "2026-W07"
}

export interface CachedMindsetMessage {
  message: string;
  dateKey: string; // e.g. "2026-02-16"
}

/**
 * @deprecated CustomTask has been merged into CoreHabit. Kept only so the
 * persisted-state migration can read old data from localStorage / cloud sync.
 */
export interface CustomTask {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon: string;
  recurrence: 'daily' | 'weekly' | 'oneoff';
  weeklyDays?: number[];
  scheduledDate?: string;
  createdAt: string;
}

export interface ResourceCompletion {
  resourceId: string;
  date: string; // yyyy-MM-dd
  timestamp: string; // ISO string
}

export interface UbiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface MoodboardItem {
  id: string;
  type: 'image' | 'quote';
  content: string; // URL for images, text for quotes
  board: string;
  createdAt: string;
}

 export interface ReminderSettings {
   enabled: boolean;
   times: {
     morning: string; // HH:mm format
     midday: string;
     evening: string;
   };
   lastNotified: {
     morning?: string; // yyyy-MM-dd
     midday?: string;
     evening?: string;
   };
 }
 
interface UserStore {
  profile: UserProfile;
  /**
   * Snapshot of coreHabits taken right before an Ubi-applied routine change
   * (add / replace_today / clear_today). Used to power the one-step Undo
   * button on the Routine page. Cleared as soon as it's used or replaced.
   */
  routineUndo: {
    habits: CoreHabit[];
    action: 'add' | 'replace_today' | 'clear_today';
    createdAt: number;
  } | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAesthetic: (theme: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  removeJournalEntry: (id: string) => void;
  addMoodEntry: (moods: string[]) => void;
  addRoutineTask: (task: Omit<RoutineTask, 'id'>) => void;
  toggleTask: (id: string) => void;
  saveResource: (id: string) => void;
  unsaveResource: (id: string) => void;
  saveRecipe: (key: string) => void;
  unsaveRecipe: (key: string) => void;
  markResourceUsed: (id: string) => void;
  unmarkResourceUsed: (id: string) => void;
  logResourceCompletion: (resourceId: string) => void;
  viewResource: (resourceId: string) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  // Unified to-dos (formerly "core habits")
  setCoreHabits: (habits: CoreHabit[]) => void;
  toggleHabitCompletion: (habitId: string) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  completeRoutineSetup: () => void;
  skipRoutineSetup: () => void;
  removeHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Omit<CoreHabit, 'id'>>) => void;
  reorderHabit: (habitId: string, direction: 'up' | 'down') => void;
  /** Hide every recurring habit scheduled for a given date and hard-delete one-offs on that date. */
  clearHabitsForDate: (date: string) => void;
  /** Remove a date from a habit's skippedDates list. */
  unskipHabitForDate: (habitId: string, date: string) => void;
  /** Save current coreHabits so an Ubi routine change can be undone. */
  snapshotRoutineForUndo: (action: 'add' | 'replace_today' | 'clear_today') => void;
  /** Restore the last snapshotted coreHabits, if any. */
  undoRoutineChange: () => boolean;
  /** Drop the stored undo snapshot without applying it. */
  clearRoutineUndo: () => void;
   updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
    markReminderSent: (timeOfDay: TimeOfDay) => void;
  ensureDailySnapshots: () => void;
  addMoodboardItem: (item: Omit<MoodboardItem, 'id' | 'createdAt'>) => void;
  removeMoodboardItem: (id: string) => void;
  reorderMoodboardItems: (items: MoodboardItem[]) => void;
}

const initialProfile: UserProfile = {
  currentFeeling: '',
  struggles: [],
  reactionStyle: '',
  wantsMoreOf: [],
  dreamSelfFeels: [],
  identityStatement: '',
  futureNote: '',
  interests: [],
  dreamSelf: {
    career: [],
    selfWorth: [],
    wellness: [],
    peace: [],
    lifestyle: [],
    love: [],
  },
  dreamImages: {},
  aesthetic: 'blush',
  journalEntries: [],
  moodHistory: [],
  routineTasks: [],
  coreHabits: [],
  habitCompletions: [],
  routineSetupComplete: false,
   reminderSettings: {
     enabled: false,
     times: {
       morning: '08:00',
       midday: '12:00',
       evening: '20:00',
     },
     lastNotified: {},
   },
   savedResources: [],
   savedRecipes: [],
   usedResources: [],
   recentlyViewedResources: [],
  resourceCompletions: [],
  moodboardItems: [],
  onboardingComplete: false,
  intentionCompletedDate: undefined,
  dailyTaskSnapshots: undefined,
  lastSnapshotDate: undefined,
  bloomScore: undefined,
  cachedJournalPrompt: undefined,
  cachedWeeklySummary: undefined,
  isPremium: false,
  isTrialing: false,
  dailyUbiMessageCount: { count: 0, date: '' },
};

/** Convert a legacy CustomTask into the unified CoreHabit shape. */
function customTaskToHabit(t: CustomTask): CoreHabit {
  let frequency: HabitFrequency = 'daily';
  let specificDays: number[] | undefined;
  let oneOffDate: string | undefined;

  if (t.recurrence === 'weekly') {
    frequency = 'specific-days';
    specificDays = t.weeklyDays ?? [];
  } else if (t.recurrence === 'oneoff') {
    frequency = 'one-off';
    oneOffDate = t.scheduledDate;
  }

  return {
    id: t.id,
    title: t.title,
    timeOfDay: t.timeOfDay,
    icon: t.icon,
    frequency,
    ...(specificDays ? { specificDays } : {}),
    ...(oneOffDate ? { oneOffDate } : {}),
  };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      routineUndo: null,
      
      updateProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      
      setAesthetic: (theme) =>
        set((state) => ({
          profile: { ...state.profile, aesthetic: theme },
        })),
      
      addJournalEntry: (entry) =>
        set((state) => ({
          profile: {
            ...state.profile,
            journalEntries: [
              { ...entry, id: Date.now().toString() },
              ...state.profile.journalEntries,
            ],
          },
        })),
      
      removeJournalEntry: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            journalEntries: state.profile.journalEntries.filter((e) => e.id !== id),
          },
        })),
      
      addMoodEntry: (moods) =>
        set((state) => ({
          profile: {
            ...state.profile,
            moodHistory: [
              { id: Date.now().toString(), moods, date: new Date().toISOString() },
              ...state.profile.moodHistory,
            ],
          },
        })),
      
      addRoutineTask: (task) =>
        set((state) => ({
          profile: {
            ...state.profile,
            routineTasks: [
              { ...task, id: Date.now().toString() },
              ...state.profile.routineTasks,
            ],
          },
        })),
      
      toggleTask: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            routineTasks: state.profile.routineTasks.map((task) =>
              task.id === id ? { ...task, completed: !task.completed } : task
            ),
          },
        })),
      
      saveResource: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            savedResources: [...(state.profile.savedResources || []).filter((r) => r !== id), id],
          },
        })),

      unsaveResource: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            savedResources: (state.profile.savedResources || []).filter((r) => r !== id),
          },
        })),

      saveRecipe: (key) =>
        set((state) => ({
          profile: {
            ...state.profile,
            savedRecipes: [...(state.profile.savedRecipes || []).filter((r) => r !== key), key],
          },
        })),

      unsaveRecipe: (key) =>
        set((state) => ({
          profile: {
            ...state.profile,
            savedRecipes: (state.profile.savedRecipes || []).filter((r) => r !== key),
          },
        })),

      markResourceUsed: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            usedResources: [...(state.profile.usedResources || []).filter((r) => r !== id), id],
          },
        })),

      unmarkResourceUsed: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            usedResources: (state.profile.usedResources || []).filter((r) => r !== id),
          },
        })),
      
      completeOnboarding: () =>
        set((state) => ({
          profile: { ...state.profile, onboardingComplete: true },
        })),
      
      resetProfile: () => set({ profile: initialProfile }),

      // Unified to-do functions (legacy name "Habit" preserved internally)
      setCoreHabits: (habits) =>
        set((state) => ({
          profile: { ...state.profile, coreHabits: habits },
        })),

      toggleHabitCompletion: (habitId) => {
        const today = getLocalDateStr();
        set((state) => {
          const existingCompletion = state.profile.habitCompletions.find(
            (c) => c.habitId === habitId && c.date === today
          );
          
          if (existingCompletion) {
            return {
              profile: {
                ...state.profile,
                habitCompletions: state.profile.habitCompletions.map((c) =>
                  c.habitId === habitId && c.date === today
                    ? { ...c, completed: !c.completed }
                    : c
                ),
              },
            };
          } else {
            return {
              profile: {
                ...state.profile,
                habitCompletions: [
                  ...state.profile.habitCompletions,
                  { habitId, date: today, completed: true },
                ],
              },
            };
          }
        });
      },

      isHabitCompletedToday: (habitId) => {
        const today = getLocalDateStr();
        const habitCompletions = get().profile.habitCompletions || [];
        const completion = habitCompletions.find(
          (c) => c.habitId === habitId && c.date === today
        );
        return completion?.completed ?? false;
      },

      completeRoutineSetup: () =>
        set((state) => ({
          profile: { ...state.profile, routineSetupComplete: true },
        })),

      skipRoutineSetup: () =>
        set((state) => {
          const defaultHabits: CoreHabit[] = [
            { id: 'default-water-morning', title: 'Drink a glass of water', timeOfDay: 'morning', icon: 'glass-water' },
            { id: 'default-skincare', title: 'Morning skincare', timeOfDay: 'morning', icon: 'sparkles' },
            { id: 'default-walk', title: 'Take a walk', timeOfDay: 'midday', icon: 'heart' },
            { id: 'default-water-midday', title: 'Drink water', timeOfDay: 'midday', icon: 'glass-water' },
            { id: 'default-journal', title: 'Journal or reflect', timeOfDay: 'evening', icon: 'pencil' },
            { id: 'default-unplug', title: 'Unplug from screens', timeOfDay: 'evening', icon: 'phone' },
          ];
          return {
            profile: {
              ...state.profile,
              routineSetupComplete: true,
              coreHabits: state.profile.coreHabits.length === 0 ? defaultHabits : state.profile.coreHabits,
            },
          };
        }),
 
      removeHabit: (habitId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coreHabits: state.profile.coreHabits.filter((h) => h.id !== habitId),
          },
        })),

      updateHabit: (habitId, updates) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coreHabits: state.profile.coreHabits.map((h) =>
              h.id === habitId ? { ...h, ...updates } : h
            ),
          },
        })),

      reorderHabit: (habitId, direction) =>
        set((state) => {
          const habits = [...state.profile.coreHabits];
          const idx = habits.findIndex((h) => h.id === habitId);
          if (idx === -1) return state;
          const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (swapIdx < 0 || swapIdx >= habits.length) return state;
          [habits[idx], habits[swapIdx]] = [habits[swapIdx], habits[idx]];
          return { profile: { ...state.profile, coreHabits: habits } };
        }),

      clearHabitsForDate: (date) =>
        set((state) => {
          const next = state.profile.coreHabits
            .filter((h) => !(h.frequency === 'one-off' && (h.oneOffDate || h.createdDate) === date))
            .map((h) => {
              if (!isHabitScheduledForDateLocal(h, date)) return h;
              const skipped = h.skippedDates || [];
              if (skipped.includes(date)) return h;
              return { ...h, skippedDates: [...skipped, date] };
            });
          return { profile: { ...state.profile, coreHabits: next } };
        }),

      unskipHabitForDate: (habitId, date) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coreHabits: state.profile.coreHabits.map((h) =>
              h.id === habitId
                ? { ...h, skippedDates: (h.skippedDates || []).filter((d) => d !== date) }
                : h,
            ),
          },
        })),

      snapshotRoutineForUndo: (action) =>
        set((state) => ({
          routineUndo: {
            // Deep-clone via JSON to insulate from later mutations
            habits: JSON.parse(JSON.stringify(state.profile.coreHabits || [])),
            action,
            createdAt: Date.now(),
          },
        })),

      undoRoutineChange: () => {
        const snap = get().routineUndo;
        if (!snap) return false;
        set((state) => ({
          profile: { ...state.profile, coreHabits: snap.habits },
          routineUndo: null,
        }));
        return true;
      },

      clearRoutineUndo: () => set({ routineUndo: null }),

      updateReminderSettings: (settings) =>
        set((state) => {
          const current = state.profile.reminderSettings ?? initialProfile.reminderSettings;
          return {
            profile: {
              ...state.profile,
              reminderSettings: { ...current, ...settings },
            },
          };
        }),

      addMoodboardItem: (item) =>
        set((state) => ({
          profile: {
            ...state.profile,
            moodboardItems: [
              { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() },
              ...(state.profile.moodboardItems || []),
            ],
          },
        })),

      removeMoodboardItem: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            moodboardItems: (state.profile.moodboardItems || []).filter((item) => item.id !== id),
          },
        })),

      reorderMoodboardItems: (items) =>
        set((state) => ({
          profile: { ...state.profile, moodboardItems: items },
        })),

      logResourceCompletion: (resourceId) =>
        set((state) => ({
          profile: {
            ...state.profile,
            resourceCompletions: [
              ...(state.profile.resourceCompletions || []),
              { resourceId, date: getLocalDateStr(), timestamp: new Date().toISOString() },
            ],
          },
        })),

      viewResource: (resourceId) =>
        set((state) => {
          const existing = (state.profile.recentlyViewedResources || []).filter((id) => id !== resourceId);
          return {
            profile: {
              ...state.profile,
              recentlyViewedResources: [resourceId, ...existing].slice(0, 20),
            },
          };
        }),

      markReminderSent: (timeOfDay) => {
        const today = getLocalDateStr();
        set((state) => {
          const current = state.profile.reminderSettings ?? initialProfile.reminderSettings;
          return {
            profile: {
              ...state.profile,
              reminderSettings: {
                ...current,
                lastNotified: {
                  ...(current.lastNotified ?? {}),
                  [timeOfDay]: today,
                },
              },
            },
          };
        });
      },

      ensureDailySnapshots: () => {
        const today = getLocalDateStr();
        set((state) => {
          const profile = state.profile;
          if (profile.lastSnapshotDate === today) return state;

          const habits = profile.coreHabits || [];
          const completions = profile.habitCompletions || [];
          const existing = profile.dailyTaskSnapshots || {};
          const next: { [k: string]: DailyTaskSnapshotItem[] } = { ...existing };

          // Determine the range of past days to snapshot. Default to just yesterday
          // when we have no prior anchor; otherwise snapshot every day since the
          // last pass up to (and including) yesterday.
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);

          const daysBack: string[] = [];
          if (profile.lastSnapshotDate) {
            // Walk forward from the day after lastSnapshotDate up to yesterday.
            const start = new Date(profile.lastSnapshotDate + 'T00:00:00');
            start.setDate(start.getDate() + 1);
            const cur = new Date(start);
            // cap at 30 days to avoid huge loops
            let safety = 30;
            while (cur < todayDate && safety-- > 0) {
              daysBack.push(getLocalDateStr(cur));
              cur.setDate(cur.getDate() + 1);
            }
          } else {
            const yest = new Date(todayDate);
            yest.setDate(yest.getDate() - 1);
            daysBack.push(getLocalDateStr(yest));
          }

          for (const dateStr of daysBack) {
            if (next[dateStr]) continue; // do not overwrite an existing snapshot
            const scheduled = habits.filter((h) => isHabitScheduledForDateLocal(h, dateStr));
            if (scheduled.length === 0) continue;
            next[dateStr] = scheduled.map((h) => {
              const c = completions.find((x) => x.habitId === h.id && x.date === dateStr);
              return {
                taskId: h.id,
                title: h.title,
                completed: !!c?.completed,
                icon: h.icon,
                time: h.scheduledTime,
              };
            });
          }

          return {
            profile: {
              ...profile,
              dailyTaskSnapshots: next,
              lastSnapshotDate: today,
            },
          };
        });
      },
    }),
    {
      name: 'ubloom-user-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          try {
            // Prune data before persisting to prevent quota issues
            const state = value?.state as UserStore | undefined;
            if (state?.profile) {
              const now = new Date();
              const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
              const cutoffStr = getLocalDateStr(cutoff);
              state.profile.habitCompletions = (state.profile.habitCompletions || [])
                .filter((c) => c.date >= cutoffStr);
              state.profile.resourceCompletions = (state.profile.resourceCompletions || [])
                .filter((c) => c.date >= cutoffStr);
              state.profile.journalEntries = (state.profile.journalEntries || []).slice(0, 200);
              state.profile.moodHistory = (state.profile.moodHistory || []).slice(0, 200);
            }
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.warn('Failed to persist store (storage quota likely exceeded):', e);
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<UserStore>) ?? {};
        const persistedProfile = (persisted.profile as Partial<UserProfile> & { customTasks?: CustomTask[] }) ?? {};

        // ---- One-time migration: merge legacy customTasks into coreHabits ----
        const legacyCustomTasks = Array.isArray(persistedProfile.customTasks)
          ? persistedProfile.customTasks
          : [];
        const existingHabits = Array.isArray(persistedProfile.coreHabits)
          ? persistedProfile.coreHabits
          : [];
        const existingIds = new Set(existingHabits.map((h) => h.id));
        const migratedFromCustom = legacyCustomTasks
          .filter((t) => !existingIds.has(t.id))
          .map(customTaskToHabit);
        const mergedHabits = [...existingHabits, ...migratedFromCustom];

        // Strip the now-deprecated customTasks field
        const { customTasks: _drop, ...cleanProfile } = persistedProfile;

        return {
          ...currentState,
          ...persisted,
          profile: {
            ...currentState.profile,
            ...cleanProfile,
            coreHabits: mergedHabits,
            dreamSelf: {
              ...currentState.profile.dreamSelf,
              ...(persistedProfile.dreamSelf ?? {}),
            },
            dreamImages: {
              ...currentState.profile.dreamImages,
              ...(persistedProfile.dreamImages ?? {}),
            },
            reminderSettings: {
              ...currentState.profile.reminderSettings,
              ...(persistedProfile.reminderSettings ?? {}),
              times: {
                ...currentState.profile.reminderSettings.times,
                ...(persistedProfile.reminderSettings?.times ?? {}),
              },
              lastNotified: {
                ...currentState.profile.reminderSettings.lastNotified,
                ...(persistedProfile.reminderSettings?.lastNotified ?? {}),
              },
            },
          },
        } as UserStore;
      },
    }
  )
);
