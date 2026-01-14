import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  
  // Visual theme
  aesthetic: string;
  
  // App data
  journalEntries: JournalEntry[];
  moodHistory: MoodEntry[];
  routineTasks: RoutineTask[];
  goals: Goal[];
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
}

export interface Goal {
  id: string;
  title: string;
  category: 'lifestyle' | 'career' | 'wellness' | 'travel';
  vision?: string;
  completed: boolean;
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
  aesthetic: 'blush',
  journalEntries: [],
  moodHistory: [],
  routineTasks: [],
  goals: [],
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
    }),
    {
      name: 'ubloom-user-storage',
    }
  )
);
