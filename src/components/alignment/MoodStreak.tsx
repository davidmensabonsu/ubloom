import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { subDays, format } from 'date-fns';
import type { MoodEntry } from '@/stores/userStore';

interface Props {
  moodHistory: MoodEntry[];
}

export default function MoodStreak({ moodHistory }: Props) {
  const streak = useMemo(() => {
    if (moodHistory.length === 0) return 0;

    // Build a set of unique days with mood entries
    const daysWithMoods = new Set<string>();
    moodHistory.forEach((entry) => {
      daysWithMoods.add(format(new Date(entry.date), 'yyyy-MM-dd'));
    });

    // Count consecutive days backwards from today
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (daysWithMoods.has(dayStr)) {
        count++;
      } else {
        // Allow skipping today if it's early and they haven't logged yet
        if (i === 0) continue;
        break;
      }
    }
    return count;
  }, [moodHistory]);

  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary/10"
    >
      <Flame size={18} className="text-primary" />
      <span className="text-sm font-medium text-foreground/90">
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
      <span className="text-xs text-muted-foreground">streak</span>
    </motion.div>
  );
}
