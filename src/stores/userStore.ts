import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getLocalDateStr } from '@/lib/dateUtils';

export type TimeOfDay = 'morning' | 'midday' | 'evening';
export type HabitFrequency = 'daily' | 'specific-days' | 'one-off';

export interface CoreHabit {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon?: string;
  frequency?: HabitFrequency;       // defaults to 'daily'
  specificDays?: number[];           // 0=Sun, 1=Mon, ... 6=Sat
  oneOffDate?: string;               // yyyy-MM-dd for one-off habits
}

export interface HabitCompletion {
  habitId: string;
  date: string; // yyyy-MM-dd format
  completed: boolean;
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
  customTasks: CustomTask[];
  habitCompletions: HabitCompletion[];
  routineSetupComplete: boolean;
   reminderSettings: ReminderSettings;
  savedResources: string[];
  savedRecipes: string[]; // "resourceId::recipeIndex"
  usedResources: string[];
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
}

export interface HealthData {
  cycle?: string;       // e.g. "Follicular", "Luteal"
  sleepHours?: number;  // e.g. 7.5
  stressLevel?: number; // 1-10
  recoveryLevel?: number; // 1-10
  activityMinutes?: number; // minutes
  lastUpdated?: string; // ISO date
}

export interface HealthHistoryEntry {
  date: string; // yyyy-MM-dd
  sleepHours?: number;
  stressLevel?: number;
  recoveryLevel?: number;
  activityMinutes?: number;
  cycle?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood?: string;
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

export interface CustomTask {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon: string; // emoji
  recurrence: 'daily' | 'weekly' | 'oneoff';
  weeklyDays?: number[]; // 0=Sun..6=Sat
  scheduledDate?: string; // yyyy-MM-dd for one-off
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
  completeOnboarding: () => void;
  resetProfile: () => void;
  // Core habits
  setCoreHabits: (habits: CoreHabit[]) => void;
  toggleHabitCompletion: (habitId: string) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  completeRoutineSetup: () => void;
  skipRoutineSetup: () => void;
  removeHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Omit<CoreHabit, 'id'>>) => void;
  reorderHabit: (habitId: string, direction: 'up' | 'down') => void;
   updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
    markReminderSent: (timeOfDay: TimeOfDay) => void;
  addMoodboardItem: (item: Omit<MoodboardItem, 'id' | 'createdAt'>) => void;
  removeMoodboardItem: (id: string) => void;
  reorderMoodboardItems: (items: MoodboardItem[]) => void;
  // Custom tasks
  addCustomTask: (task: Omit<CustomTask, 'id' | 'createdAt'>) => void;
  removeCustomTask: (id: string) => void;
  toggleCustomTaskCompletion: (taskId: string) => void;
  isCustomTaskCompletedToday: (taskId: string) => boolean;
  getVisibleCustomTasks: () => CustomTask[];
}

const initialProfile: UserProfile = {
  currentFeeling: '',
  struggles: [],
  reactionStyle: '',
  wantsMoreOf: [],
  dreamSelfFeels: [],
  identityStatement: '',
  futureNote: '',
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
  customTasks: [],
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
  resourceCompletions: [],
  moodboardItems: [],
  onboardingComplete: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      
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

      // Core habits functions
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
          const habit = habits[idx];
          // Find habits in the same timeOfDay section
          const sectionHabits = habits.filter((h) => h.timeOfDay === habit.timeOfDay);
          const sectionIdx = sectionHabits.findIndex((h) => h.id === habitId);
          const swapIdx = direction === 'up' ? sectionIdx - 1 : sectionIdx + 1;
          if (swapIdx < 0 || swapIdx >= sectionHabits.length) return state;
          // Find the global indices and swap
          const globalIdx = habits.indexOf(sectionHabits[sectionIdx]);
          const globalSwapIdx = habits.indexOf(sectionHabits[swapIdx]);
          [habits[globalIdx], habits[globalSwapIdx]] = [habits[globalSwapIdx], habits[globalIdx]];
          return { profile: { ...state.profile, coreHabits: habits } };
        }),

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

      // Custom tasks
      addCustomTask: (task) =>
        set((state) => ({
          profile: {
            ...state.profile,
            customTasks: [
              ...(state.profile.customTasks || []),
              { ...task, id: `custom-${Date.now()}`, createdAt: new Date().toISOString() },
            ],
          },
        })),

      removeCustomTask: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            customTasks: (state.profile.customTasks || []).filter((t) => t.id !== id),
          },
        })),

      toggleCustomTaskCompletion: (taskId) => {
        const today = getLocalDateStr();
        set((state) => {
          const existing = state.profile.habitCompletions.find(
            (c) => c.habitId === taskId && c.date === today
          );
          if (existing) {
            return {
              profile: {
                ...state.profile,
                habitCompletions: state.profile.habitCompletions.map((c) =>
                  c.habitId === taskId && c.date === today
                    ? { ...c, completed: !c.completed }
                    : c
                ),
              },
            };
          }
          return {
            profile: {
              ...state.profile,
              habitCompletions: [
                ...state.profile.habitCompletions,
                { habitId: taskId, date: today, completed: true },
              ],
            },
          };
        });
      },

      isCustomTaskCompletedToday: (taskId) => {
        const today = getLocalDateStr();
        const completions = get().profile.habitCompletions || [];
        const c = completions.find((c) => c.habitId === taskId && c.date === today);
        return c?.completed ?? false;
      },

      getVisibleCustomTasks: () => {
        const today = new Date();
        const todayStr = getLocalDateStr(today);
        const dayOfWeek = today.getDay();
        return (get().profile.customTasks || []).filter((task) => {
          if (task.recurrence === 'daily') return true;
          if (task.recurrence === 'weekly') return task.weeklyDays?.includes(dayOfWeek) ?? false;
          if (task.recurrence === 'oneoff') return task.scheduledDate === todayStr;
          return false;
        });
      },

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
        const persistedProfile = (persisted.profile as Partial<UserProfile>) ?? {};

        return {
          ...currentState,
          ...persisted,
          profile: {
            ...currentState.profile,
            ...persistedProfile,
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
