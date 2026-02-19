import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Flame, TrendingUp } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function WeeklyProgress() {
  const { profile } = useUserStore();
  const coreHabits = profile.coreHabits || [];
  const customTasks = profile.customTasks || [];
  const habitCompletions = profile.habitCompletions || [];

  const allTrackableIds = useMemo(() => {
    const coreIds = coreHabits.map((h) => h.id);
    const customIds = customTasks.map((t) => t.id);
    return new Set([...coreIds, ...customIds]);
  }, [coreHabits, customTasks]);

  // For each past day, figure out which custom tasks were visible
  const getCustomTaskCountForDate = (dateStr: string, dayOfWeek: number) => {
    return customTasks.filter((task) => {
      if (task.recurrence === 'daily') return true;
      if (task.recurrence === 'weekly') return task.weeklyDays?.includes(dayOfWeek) ?? false;
      if (task.recurrence === 'oneoff') return task.scheduledDate === dateStr;
      return false;
    }).length;
  };

  const weekData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      const isToday = i === 0;

      const completedHabits = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed && allTrackableIds.has(c.habitId)
      ).length;

      const dayOfWeek = date.getDay();
      const expectedTotal = coreHabits.length + getCustomTaskCountForDate(dateStr, dayOfWeek);
      // For past days, use max of expected count and completed count so a fully-completed past day stays 100%
      const totalHabits = isToday
        ? expectedTotal
        : Math.max(expectedTotal, completedHabits);
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
  }, [coreHabits, customTasks, allTrackableIds, habitCompletions]);

  const streak = useMemo(() => {
    const totalTrackable = coreHabits.length + customTasks.length;
    if (totalTrackable === 0) return 0;

    let currentStreak = 0;
    const today = startOfDay(new Date());

    for (let i = 0; i <= 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();

      const dayCompletions = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed && allTrackableIds.has(c.habitId)
      );

      const expectedTotal = coreHabits.length + getCustomTaskCountForDate(dateStr, dayOfWeek);
      const effectiveTotal = Math.max(expectedTotal, dayCompletions.length);
      const completionRate = effectiveTotal > 0 ? dayCompletions.length / effectiveTotal : 0;

      if (completionRate >= 0.5) {
        currentStreak++;
      } else if (i > 0) {
        // Don't break streak on today if not yet complete
        break;
      }
    }

    return currentStreak;
  }, [coreHabits, customTasks, allTrackableIds, habitCompletions]);

  const weeklyAverage = useMemo(() => {
    const totalPercentage = weekData.reduce((sum, day) => sum + day.percentage, 0);
    return Math.round(totalPercentage / 7);
  }, [weekData]);

  if (coreHabits.length === 0 && customTasks.length === 0) {
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
              <p className="text-xs text-muted-foreground font-medium">Streak</p>
              <p className="font-semibold text-lg leading-none">
                {streak} {streak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-2xl">
            <TrendingUp size={18} strokeWidth={2.5} className="text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Weekly avg</p>
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