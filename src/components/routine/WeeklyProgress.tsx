import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Flame, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function WeeklyProgress() {
  const { profile } = useUserStore();
  const coreHabits = profile.coreHabits || [];
  const habitCompletions = profile.habitCompletions || [];

  const weekData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      const isToday = i === 0;

      const completedHabits = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed
      ).length;

      const totalHabits = coreHabits.length;
      const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      days.push({
        date: dateStr,
        dayName,
        isToday,
        completedHabits,
        totalHabits,
        percentage,
      });
    }

    return days;
  }, [coreHabits, habitCompletions]);

  const streak = useMemo(() => {
    if (coreHabits.length === 0) return 0;

    let currentStreak = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i <= 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayCompletions = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed
      );

      // Consider a day complete if at least 50% of habits are done
      const completionRate = dayCompletions.length / coreHabits.length;

      if (completionRate >= 0.5) {
        currentStreak++;
      } else if (i > 0) {
        // Don't break streak on today if not yet complete
        break;
      }
    }

    return currentStreak;
  }, [coreHabits, habitCompletions]);

  const weeklyAverage = useMemo(() => {
    const totalPercentage = weekData.reduce((sum, day) => sum + day.percentage, 0);
    return Math.round(totalPercentage / 7);
  }, [weekData]);

  if (coreHabits.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5"
    >
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-2xl">
            <Flame size={18} strokeWidth={2.5} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="font-semibold text-lg leading-none">
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-2xl">
            <TrendingUp size={18} strokeWidth={2.5} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Weekly avg</p>
              <p className="font-semibold text-lg leading-none">{weeklyAverage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="flex items-end justify-between gap-2">
        {weekData.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex-1 flex flex-col items-center gap-2"
            style={{ originY: 1 }}
          >
            {/* Bar */}
            <div className="relative w-full h-20 bg-muted rounded-xl overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${day.percentage}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: 'easeOut' }}
                className={`absolute bottom-0 left-0 right-0 rounded-xl ${
                  day.isToday
                    ? 'bg-primary'
                    : day.percentage >= 100
                    ? 'bg-primary/80'
                    : day.percentage >= 50
                    ? 'bg-primary/50'
                    : 'bg-primary/30'
                }`}
              />
              {day.percentage >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="absolute top-1 left-1/2 -translate-x-1/2 text-xs"
                >
                  ✨
                </motion.div>
              )}
            </div>
            {/* Day Label */}
            <span
              className={`text-xs ${
                day.isToday ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              {day.dayName}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {streak >= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          {streak >= 7
            ? "🌟 Amazing! You've completed a full week!"
            : streak >= 5
            ? "🔥 You're on fire! Keep going!"
            : "💪 Great momentum! Keep it up!"}
        </motion.p>
      )}
    </motion.div>
  );
}