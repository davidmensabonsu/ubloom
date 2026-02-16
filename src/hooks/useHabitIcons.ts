import { useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';

export function useHabitIcons() {
  const { profile, updateHabitIcon } = useUserStore();
  const generatingRef = useRef<Set<string>>(new Set());

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
