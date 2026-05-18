import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import flameImg from '@/assets/icons/flame.png';
import { format, subDays, startOfDay, addDays } from 'date-fns';
import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
import ubloomLogo from '@/assets/ubloom-flower.png';

interface WeeklyProgressProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export default function WeeklyProgress({ selectedDate, onSelectDate }: WeeklyProgressProps = {}) {
  const { profile } = useUserStore();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
  const coreHabits = profile.coreHabits || [];
  const habitCompletions = profile.habitCompletions || [];

  const allTrackableIds = useMemo(() => {
    return new Set(coreHabits.map((h) => h.id));
  }, [coreHabits]);

  const weekData = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, weekOffset * 7);
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(weekEnd, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE');
      const isToday = dateStr === format(today, 'yyyy-MM-dd');
      const isFuture = dateStr > format(today, 'yyyy-MM-dd');

      const completedHabits = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed && allTrackableIds.has(c.habitId)
      ).length;

      const expectedTotal = coreHabits.filter(h => isHabitScheduledForDate(h, dateStr)).length;
      const totalHabits = isToday
        ? expectedTotal
        : isFuture
          ? expectedTotal
          : Math.max(expectedTotal, completedHabits);
      const percentage = isFuture
        ? 0
        : totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      days.push({
        date: dateStr,
        dayName,
        isToday,
        isFuture,
        completedHabits,
        totalHabits,
        percentage,
      });
    }

    return days;
  }, [coreHabits, allTrackableIds, habitCompletions, weekOffset]);

  const weekLabel = useMemo(() => {
    if (weekOffset === 0) return 'This week';
    if (weekOffset === -1) return 'Last week';
    if (weekOffset === 1) return 'Next week';
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, weekOffset * 7);
    const weekStart = subDays(weekEnd, 6);
    return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`;
  }, [weekOffset]);

  const { streak, longestStreak } = useMemo(() => {
    if (coreHabits.length === 0) return { streak: 0, longestStreak: 0 };

    const today = startOfDay(new Date());
    let maxStreak = 0;
    let tempStreak = 0;

    // Scan up to a year to find longest streak
    for (let i = 0; i <= 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayCompletions = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed && allTrackableIds.has(c.habitId)
      );

      const expectedTotal = coreHabits.filter(h => isHabitScheduledForDate(h, dateStr)).length;
      const effectiveTotal = Math.max(expectedTotal, dayCompletions.length);
      const completionRate = effectiveTotal > 0 ? dayCompletions.length / effectiveTotal : 0;

      if (completionRate >= 0.5) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Current streak: count consecutive days backward, skipping today if incomplete
    let currentStreak = 0;
    const todayStr = format(today, 'yyyy-MM-dd');
    const todayCompletions = habitCompletions.filter(
      (c) => c.date === todayStr && c.completed && allTrackableIds.has(c.habitId)
    );
    const todayExpected = coreHabits.filter(h => isHabitScheduledForDate(h, todayStr)).length;
    const todayEffective = Math.max(todayExpected, todayCompletions.length);
    const todayRate = todayEffective > 0 ? todayCompletions.length / todayEffective : 0;

    const startDay = todayRate >= 0.5 ? 0 : 1;

    for (let i = startDay; i <= 365; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayCompletions = habitCompletions.filter(
        (c) => c.date === dateStr && c.completed && allTrackableIds.has(c.habitId)
      );

      const expectedTotal = coreHabits.filter(h => isHabitScheduledForDate(h, dateStr)).length;
      const effectiveTotal = Math.max(expectedTotal, dayCompletions.length);
      const completionRate = effectiveTotal > 0 ? dayCompletions.length / effectiveTotal : 0;

      if (completionRate >= 0.5) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { streak: currentStreak, longestStreak: maxStreak };
  }, [coreHabits, allTrackableIds, habitCompletions]);

  const weeklyAverage = useMemo(() => {
    const totalPercentage = weekData.reduce((sum, day) => sum + day.percentage, 0);
    return Math.round(totalPercentage / 7);
  }, [weekData]);

  if (coreHabits.length === 0) {
    return null;
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5"
    >
      {/* Stats Row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-2xl">
            <img src={flameImg} alt="Streak" className="w-8 h-8 object-contain" style={{ filter: 'none' }} />
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
          <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-colors duration-500 ${
            streak > 0 && streak >= longestStreak ? 'bg-primary/10' : 'bg-muted'
          }`}>
            <img src={flameImg} alt="Best" className={`w-6 h-6 object-contain transition-opacity duration-500 ${
              streak > 0 && streak >= longestStreak ? 'opacity-100' : 'opacity-50'
            }`} style={{ filter: 'none' }} />
            <div>
              <p className={`text-xs font-medium transition-colors duration-500 ${
                streak > 0 && streak >= longestStreak ? 'text-primary' : 'text-muted-foreground'
              }`}>Best</p>
              <p className="font-semibold text-lg leading-none">
                {longestStreak}d
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft size={18} className="text-muted-foreground" />
        </button>
        <span className="text-xs font-medium text-muted-foreground">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset((o) => Math.min(o + 1, 4))}
          disabled={weekOffset >= 4}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Weekly Chart */}
      <div className="flex items-end justify-between gap-2">
        {weekData.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex-1 flex flex-col items-center gap-2 cursor-pointer"
            style={{ originY: 1 }}
            onClick={() => onSelectDate?.(day.date)}
          >
            {/* Bar */}
            <div className="relative w-full h-20 bg-muted rounded-xl overflow-hidden">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${day.percentage}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: 'easeOut' }}
                className={`absolute bottom-0 left-0 right-0 rounded-xl ${
                  day.date === selectedDate
                    ? 'bg-primary'
                    : day.percentage >= 100
                    ? 'bg-primary/80'
                    : day.percentage >= 50
                    ? 'bg-primary/50'
                    : 'bg-primary/30'
                }`}
              />
              {day.percentage >= 100 ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="absolute top-1 inset-x-0 flex justify-center"
                >
                  <img src={ubloomLogo} alt="Complete" className="w-10 h-10 object-contain clay-icon" />
                </motion.div>
              ) : day.totalHabits > 0 ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                >
                  {day.completedHabits}/{day.totalHabits}
                </motion.span>
              ) : null}
            </div>
            {/* Day Label */}
            <span
              className={`text-xs ${
                day.date === selectedDate
                  ? 'font-semibold text-primary'
                  : day.isToday
                  ? 'font-semibold text-primary/70'
                  : 'text-muted-foreground'
              }`}
            >
              {day.dayName}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {weekOffset === 0 && streak >= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-4"
        >
          {streak >= 7
            ? "Amazing! You've completed a full week!"
            : streak >= 5
            ? "You're on fire! Keep going!"
            : "Great momentum! Keep it up!"}
        </motion.p>
      )}
    </motion.div>
    </>
  );
}