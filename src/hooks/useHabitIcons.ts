import { useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';

const ICON_STYLE_VERSION = 2; // Bump this to regenerate all icons

export function useHabitIcons() {
  const { profile, updateHabitIcon, clearAllHabitIcons } = useUserStore();
  const generatingRef = useRef<Set<string>>(new Set());
  const clearedRef = useRef(false);

  // Clear old-style icons once when version changes
  useEffect(() => {
    if (clearedRef.current) return;
    const storedVersion = localStorage.getItem('habitIconStyleVersion');
    if (storedVersion !== String(ICON_STYLE_VERSION)) {
      clearAllHabitIcons();
      localStorage.setItem('habitIconStyleVersion', String(ICON_STYLE_VERSION));
    }
    clearedRef.current = true;
  }, [clearAllHabitIcons]);

  useEffect(() => {
    const habitsNeedingIcons = profile.coreHabits.filter(
      (h) => !h.iconImage && !generatingRef.current.has(h.id)
    );

    for (const habit of habitsNeedingIcons) {
      generatingRef.current.add(habit.id);

      supabase.functions
        .invoke('generate-habit-icon', {
          body: { habitTitle: habit.title },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to generate icon for', habit.title, error);
            generatingRef.current.delete(habit.id);
            return;
          }
          if (data?.imageUrl) {
            updateHabitIcon(habit.id, data.imageUrl);
          }
          generatingRef.current.delete(habit.id);
        });
    }
  }, [profile.coreHabits, updateHabitIcon]);

  return {
    isGenerating: (habitId: string) => generatingRef.current.has(habitId),
  };
}
