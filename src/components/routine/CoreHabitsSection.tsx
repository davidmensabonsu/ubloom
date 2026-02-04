import { motion } from 'framer-motion';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Check, Sun, Clock, Moon, Settings2 } from 'lucide-react';

const timeOfDayConfig = {
  morning: { label: 'Morning', icon: Sun, color: 'text-amber-500' },
  midday: { label: 'Midday', icon: Clock, color: 'text-sky-500' },
  evening: { label: 'Evening', icon: Moon, color: 'text-indigo-400' },
};

interface CoreHabitsSectionProps {
  onEditHabits: () => void;
}

export default function CoreHabitsSection({ onEditHabits }: CoreHabitsSectionProps) {
  const { profile, toggleHabitCompletion, isHabitCompletedToday } = useUserStore();
  const { coreHabits } = profile;

  const getHabitsByTime = (time: TimeOfDay) => {
    return coreHabits.filter((h) => h.timeOfDay === time);
  };

  const getCompletedCount = (time: TimeOfDay) => {
    const habits = getHabitsByTime(time);
    return habits.filter((h) => isHabitCompletedToday(h.id)).length;
  };

  const totalHabits = coreHabits.length;
  const totalCompleted = coreHabits.filter((h) => isHabitCompletedToday(h.id)).length;

  if (coreHabits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-5 text-center"
      >
        <p className="text-muted-foreground mb-3">
          No daily habits set yet
        </p>
        <button
          onClick={onEditHabits}
          className="soft-button text-sm"
        >
          Set Up Daily Habits
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Daily Habits</h2>
          <p className="text-xs text-muted-foreground">
            {totalCompleted} of {totalHabits} completed today
          </p>
        </div>
        <button
          onClick={onEditHabits}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Settings2 size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Habits by time of day */}
      {(['morning', 'midday', 'evening'] as TimeOfDay[]).map((time, sectionIndex) => {
        const habits = getHabitsByTime(time);
        if (habits.length === 0) return null;

        const config = timeOfDayConfig[time];
        const Icon = config.icon;
        const completedCount = getCompletedCount(time);

        return (
          <motion.div
            key={time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="glass-card rounded-3xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={18} className={config.color} />
                <h3 className="font-medium text-sm">{config.label}</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{habits.length}
              </span>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => {
                const isCompleted = isHabitCompletedToday(habit.id);

                return (
                  <motion.button
                    key={habit.id}
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className="check-item w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`check-circle ${isCompleted ? 'checked' : ''}`}>
                      {isCompleted && <Check size={14} />}
                    </div>
                    <span
                      className={`text-sm ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {habit.icon} {habit.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}