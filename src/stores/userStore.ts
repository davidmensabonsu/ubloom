import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimeOfDay = 'morning' | 'midday' | 'evening';

export interface CoreHabit {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon?: string;
  iconImage?: string;
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
  habitCompletions: HabitCompletion[];
  routineSetupComplete: boolean;
   reminderSettings: ReminderSettings;
  goals: Goal[];
  moodboardItems: MoodboardItem[];
  cachedFutureSelfMessage?: CachedFutureSelfMessage;
  cachedMindsetMessage?: CachedMindsetMessage;
  onboardingComplete: boolean;
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

export interface Goal {
  id: string;
  title: string;
  category: 'lifestyle' | 'career' | 'wellness' | 'travel';
  vision?: string;
  completed: boolean;
}

export interface CachedFutureSelfMessage {
  message: string;
  weekKey: string; // e.g. "2026-W07"
}

export interface CachedMindsetMessage {
  message: string;
  dateKey: string; // e.g. "2026-02-16"
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
  addMoodEntry: (moods: string[]) => void;
  addRoutineTask: (task: Omit<RoutineTask, 'id'>) => void;
  toggleTask: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  // Core habits
  setCoreHabits: (habits: CoreHabit[]) => void;
  toggleHabitCompletion: (habitId: string) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  completeRoutineSetup: () => void;
  skipRoutineSetup: () => void;
   updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
    markReminderSent: (timeOfDay: TimeOfDay) => void;
  addMoodboardItem: (item: Omit<MoodboardItem, 'id' | 'createdAt'>) => void;
  removeMoodboardItem: (id: string) => void;
  reorderMoodboardItems: (items: MoodboardItem[]) => void;
  updateHabitIcon: (habitId: string, iconImage: string) => void;
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
  goals: [],
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
      
      addGoal: (goal) =>
        set((state) => ({
          profile: {
            ...state.profile,
            goals: [
              { ...goal, id: Date.now().toString() },
              ...state.profile.goals,
            ],
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
        const today = new Date().toISOString().split('T')[0];
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
        const today = new Date().toISOString().split('T')[0];
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
        set((state) => ({
          profile: { ...state.profile, routineSetupComplete: true },
        })),
 
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

      updateHabitIcon: (habitId, iconImage) =>
        set((state) => ({
          profile: {
            ...state.profile,
            coreHabits: state.profile.coreHabits.map((h) =>
              h.id === habitId ? { ...h, iconImage } : h
            ),
          },
        })),

      markReminderSent: (timeOfDay) => {
        const today = new Date().toISOString().split('T')[0];
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
