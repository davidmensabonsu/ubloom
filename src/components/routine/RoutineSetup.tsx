import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore, CoreHabit, TimeOfDay } from '@/stores/userStore';
import { Check, Sun, Clock, Moon, Plus, X, Sparkles } from 'lucide-react';

const presetHabits: { title: string; icon: string; timeOfDay: TimeOfDay }[] = [
  // Morning
  { title: 'Drink a glass of water', icon: '💧', timeOfDay: 'morning' },
  { title: 'Morning skincare', icon: '🌸', timeOfDay: 'morning' },
  { title: 'Stretch or yoga', icon: '🧘‍♀️', timeOfDay: 'morning' },
  { title: 'Healthy breakfast', icon: '🥣', timeOfDay: 'morning' },
  { title: 'Set daily intentions', icon: '✨', timeOfDay: 'morning' },
  { title: 'Meditate', icon: '🧠', timeOfDay: 'morning' },
  // Midday
  { title: 'Take a walk', icon: '🚶‍♀️', timeOfDay: 'midday' },
  { title: 'Drink water', icon: '💧', timeOfDay: 'midday' },
  { title: 'Healthy lunch', icon: '🥗', timeOfDay: 'midday' },
  { title: 'Take vitamins', icon: '💊', timeOfDay: 'midday' },
  { title: 'Screen break', icon: '👀', timeOfDay: 'midday' },
  { title: 'Connect with a friend', icon: '💬', timeOfDay: 'midday' },
  // Evening
  { title: 'Evening skincare', icon: '🌙', timeOfDay: 'evening' },
  { title: 'Read for 15 minutes', icon: '📚', timeOfDay: 'evening' },
  { title: 'Journal or reflect', icon: '📝', timeOfDay: 'evening' },
  { title: 'Prepare for tomorrow', icon: '📋', timeOfDay: 'evening' },
  { title: 'Unplug from screens', icon: '📵', timeOfDay: 'evening' },
  { title: 'Gratitude practice', icon: '🙏', timeOfDay: 'evening' },
];

const timeOfDayConfig = {
  morning: { label: 'Morning', icon: Sun, color: 'text-amber-500' },
  midday: { label: 'Midday', icon: Clock, color: 'text-sky-500' },
  evening: { label: 'Evening', icon: Moon, color: 'text-indigo-500' },
};

interface RoutineSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function RoutineSetup({ onComplete, onSkip }: RoutineSetupProps) {
  const { setCoreHabits, completeRoutineSetup } = useUserStore();
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [customHabit, setCustomHabit] = useState('');
  const [customTimeOfDay, setCustomTimeOfDay] = useState<TimeOfDay>('morning');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customHabits, setCustomHabits] = useState<{ title: string; timeOfDay: TimeOfDay }[]>([]);

  const toggleHabit = (habitTitle: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitTitle)) {
      newSelected.delete(habitTitle);
    } else {
      newSelected.add(habitTitle);
    }
    setSelectedHabits(newSelected);
  };

  const addCustomHabit = () => {
    if (customHabit.trim()) {
      const newCustom = { title: customHabit.trim(), timeOfDay: customTimeOfDay };
      setCustomHabits([...customHabits, newCustom]);
      setSelectedHabits(new Set([...selectedHabits, customHabit.trim()]));
      setCustomHabit('');
      setShowCustomInput(false);
    }
  };

  const removeCustomHabit = (title: string) => {
    setCustomHabits(customHabits.filter((h) => h.title !== title));
    const newSelected = new Set(selectedHabits);
    newSelected.delete(title);
    setSelectedHabits(newSelected);
  };

  const handleComplete = () => {
    const habits: CoreHabit[] = [];
    
    // Add selected preset habits
    presetHabits.forEach((habit) => {
      if (selectedHabits.has(habit.title)) {
        habits.push({
          id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: habit.title,
          timeOfDay: habit.timeOfDay,
          icon: habit.icon,
        });
      }
    });

    // Add custom habits
    customHabits.forEach((habit) => {
      if (selectedHabits.has(habit.title)) {
        habits.push({
          id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: habit.title,
          timeOfDay: habit.timeOfDay,
          icon: '⭐',
        });
      }
    });

    setCoreHabits(habits);
    completeRoutineSetup();
    onComplete();
  };

  const getHabitsByTime = (time: TimeOfDay) => {
    const preset = presetHabits.filter((h) => h.timeOfDay === time);
    const custom = customHabits.filter((h) => h.timeOfDay === time);
    return [...preset, ...custom.map((c) => ({ ...c, icon: '⭐' }))];
  };

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <Sparkles size={24} strokeWidth={2.5} className="text-primary" />
          <h1 className="page-title">Set Your Core Daily Habits</h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          These habits will appear every day and reset each morning. Choose what matters most to you.
        </motion.p>
      </div>

      <div className="px-5 space-y-6">
        {(['morning', 'midday', 'evening'] as TimeOfDay[]).map((time, sectionIndex) => {
          const config = timeOfDayConfig[time];
          const Icon = config.icon;
          const habits = getHabitsByTime(time);

          return (
            <motion.div
              key={time}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="glass-card rounded-3xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon size={18} strokeWidth={2.5} className={config.color} />
                <h2 className="section-title text-base">{config.label}</h2>
              </div>

              <div className="space-y-2">
                {habits.map((habit, index) => {
                  const isSelected = selectedHabits.has(habit.title);
                  const isCustom = customHabits.some((c) => c.title === habit.title);
                  
                  return (
                    <motion.button
                      key={habit.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + index * 0.03 }}
                      onClick={() => toggleHabit(habit.title)}
                      className={`check-item w-full ${isSelected ? 'bg-primary/10' : ''}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`check-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <Check size={14} strokeWidth={2.5} />}
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">
                        {habit.icon} {habit.title}
                      </span>
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomHabit(habit.title);
                          }}
                          className="p-1 rounded-full hover:bg-muted"
                        >
                          <X size={14} strokeWidth={2.5} className="text-muted-foreground" />
                        </button>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}

        {/* Add Custom Habit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-5"
        >
          <AnimatePresence mode="wait">
            {showCustomInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={customHabit}
                  onChange={(e) => setCustomHabit(e.target.value)}
                  placeholder="Enter your custom habit..."
                  className="w-full p-3 rounded-2xl bg-muted border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  {(['morning', 'midday', 'evening'] as TimeOfDay[]).map((time) => (
                    <button
                      key={time}
                      onClick={() => setCustomTimeOfDay(time)}
                      className={`mood-pill text-xs ${customTimeOfDay === time ? 'selected' : ''}`}
                    >
                      {time === 'morning' && '☀️'}
                      {time === 'midday' && '🌤️'}
                      {time === 'evening' && '🌙'}
                      <span className="capitalize">{time}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomInput(false)}
                    className="flex-1 p-3 rounded-2xl bg-muted text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomHabit}
                    disabled={!customHabit.trim()}
                    className={`flex-1 soft-button text-sm ${!customHabit.trim() ? 'opacity-50' : ''}`}
                  >
                    Add Habit
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="text-sm">Add Custom Habit</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background via-background to-transparent">
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 p-4 rounded-2xl bg-muted text-muted-foreground text-sm font-medium"
          >
            Set Up Later
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 soft-button flex items-center justify-center gap-2"
          >
            <Sparkles size={18} strokeWidth={2.5} />
            <span>Save Habits</span>
            {selectedHabits.size > 0 && (
              <span className="bg-background/30 px-2 py-0.5 rounded-full text-xs">
                {selectedHabits.size}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}