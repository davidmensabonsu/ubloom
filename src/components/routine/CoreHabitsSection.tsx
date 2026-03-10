import { motion, AnimatePresence } from 'framer-motion';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useState } from 'react';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Check, Sun, Clock, Moon, Plus, X, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import ubloomFlower from '@/assets/ubloom-flower.png';
import { getTaskIcon } from '@/lib/taskIcons';

const timeOfDayConfig = {
  morning: { label: 'Morning', icon: Sun, color: 'text-primary' },
  midday: { label: 'Midday', icon: Clock, color: 'text-primary' },
  evening: { label: 'Evening', icon: Moon, color: 'text-primary' },
};

function HabitIcon({ iconId }: { iconId?: string }) {
  const opt = iconId ? getTaskIcon(iconId) : undefined;
  if (opt) {
    const IconComp = opt.icon;
    return (
      <div className="icon-3d-sm">
        <IconComp size={16} strokeWidth={2.5} />
      </div>
    );
  }
  // Fallback for old emoji-based icons
  return (
    <div className="icon-3d-sm">
      <img src={ubloomFlower} alt="" className="w-4 h-4" />
    </div>
  );
}

export default function CoreHabitsSection() {
  const { profile, toggleHabitCompletion, isHabitCompletedToday, addRoutineTask, toggleTask, removeHabit, reorderHabit } = useUserStore();
  const { coreHabits } = profile;
  
  const [addingToSection, setAddingToSection] = useState<TimeOfDay | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editMode, setEditMode] = useState(false);

  const today = getLocalDateStr();
  
  const getTodayTasks = (time: TimeOfDay) => {
    return (profile.routineTasks || []).filter(
      (task) => task.date.split('T')[0] === today && task.timeOfDay === time
    );
  };

  const getHabitsByTime = (time: TimeOfDay) => {
    return coreHabits.filter((h) => h.timeOfDay === time);
  };

  const getCompletedCount = (time: TimeOfDay) => {
    const habits = getHabitsByTime(time);
    const habitCompleted = habits.filter((h) => isHabitCompletedToday(h.id)).length;
    const tasks = getTodayTasks(time);
    const taskCompleted = tasks.filter((t) => t.completed).length;
    return habitCompleted + taskCompleted;
  };

  const getTotalCount = (time: TimeOfDay) => {
    return getHabitsByTime(time).length + getTodayTasks(time).length;
  };

  const totalHabits = coreHabits.length;
  const totalTasks = (['morning', 'midday', 'evening'] as TimeOfDay[]).reduce(
    (sum, time) => sum + getTodayTasks(time).length, 0
  );
  const totalItems = totalHabits + totalTasks;
  const totalCompleted = coreHabits.filter((h) => isHabitCompletedToday(h.id)).length +
    (['morning', 'midday', 'evening'] as TimeOfDay[]).reduce(
      (sum, time) => sum + getTodayTasks(time).filter((t) => t.completed).length, 0
    );

  const handleAddTask = (time: TimeOfDay) => {
    if (newTaskTitle.trim()) {
      addRoutineTask({
        title: newTaskTitle,
        category: 'plans',
        completed: false,
        date: new Date().toISOString(),
        timeOfDay: time,
      });
      setNewTaskTitle('');
      setAddingToSection(null);
    }
  };

  const hasAnyContent = (['morning', 'midday', 'evening'] as TimeOfDay[]).some(
    (time) => getHabitsByTime(time).length > 0 || getTodayTasks(time).length > 0
  );

  if (coreHabits.length === 0 && !hasAnyContent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Sparkles size={40} strokeWidth={2} className="text-primary mx-auto" />
        </motion.div>
        <h2 className="text-lg font-bold">Set Up Your Daily Habits</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Choose the habits that matter most to you. They'll appear here every day.
        </p>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-habit-setup'))}
          className="soft-button text-sm px-6 py-3 font-semibold bg-primary text-primary-foreground rounded-2xl"
        >
          Choose My Habits
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
          <p className="text-xs text-muted-foreground font-medium">
            {totalCompleted} of {totalItems} completed today
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`p-2 rounded-full transition-colors ${editMode ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Pencil size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Habits by time of day */}
      {(['morning', 'midday', 'evening'] as TimeOfDay[]).map((time, sectionIndex) => {
        const habits = getHabitsByTime(time);
        const tasks = getTodayTasks(time);
        const config = timeOfDayConfig[time];
        const Icon = config.icon;
        const completedCount = getCompletedCount(time);
        const totalCount = getTotalCount(time);

        const isEmpty = habits.length === 0 && tasks.length === 0;

        return (
          <motion.div
            key={time}
            data-section={time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="glass-card rounded-3xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={18} strokeWidth={2.5} className={config.color} />
                <h3 className="font-semibold text-sm">{config.label}</h3>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                  {completedCount}/{totalCount}
                </span>
            </div>

            <div className="space-y-2">
              {/* Core habits */}
              {habits.map((habit, habitIndex) => {
                const isCompleted = isHabitCompletedToday(habit.id);

                if (editMode) {
                  return (
                    <motion.div
                      key={habit.id}
                      className="check-item w-full"
                      layout
                    >
                      <span className="text-sm font-medium flex items-center gap-2 flex-1">
                        <HabitIcon iconId={habit.icon} />
                        {habit.title}
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={() => reorderHabit(habit.id, 'up')}
                          disabled={habitIndex === 0}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                        >
                          <ChevronUp size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => reorderHabit(habit.id, 'down')}
                          disabled={habitIndex === habits.length - 1}
                          className="p-1.5 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
                        >
                          <ChevronDown size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => removeHabit(habit.id)}
                          className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.button
                    key={habit.id}
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className="check-item w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`check-circle ${isCompleted ? 'checked' : ''}`}>
                      {isCompleted && <Check size={14} strokeWidth={2.5} />}
                    </div>
                    <span
                      className={`text-sm font-medium flex items-center gap-2 ${
                        isCompleted ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      <HabitIcon iconId={habit.icon} />
                      {habit.title}
                    </span>
                  </motion.button>
                );
              })}

              {/* One-off tasks for this time of day */}
              {tasks.map((task) => (
                <motion.button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="check-item w-full"
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className={`check-circle ${task.completed ? 'checked' : ''}`}>
                    {task.completed && <Check size={14} strokeWidth={2.5} />}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground/50">today only</span>
                </motion.button>
              ))}

              {/* Empty section hint */}
              {isEmpty && addingToSection !== time && (
                <button
                  onClick={() => setAddingToSection(time)}
                  className="w-full text-xs text-muted-foreground/60 py-2 hover:text-muted-foreground transition-colors"
                >
                  Tap + to add a task for today
                </button>
              )}

              {/* Inline add task input */}
              <AnimatePresence>
                {addingToSection === time && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 pt-2"
                  >
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(time);
                        if (e.key === 'Escape') {
                          setAddingToSection(null);
                          setNewTaskTitle('');
                        }
                      }}
                      placeholder="Add a task for today..."
                      className="flex-1 text-sm p-2 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddTask(time)}
                      disabled={!newTaskTitle.trim()}
                      className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => {
                        setAddingToSection(null);
                        setNewTaskTitle('');
                      }}
                      className="p-2 rounded-full hover:bg-muted"
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {/* Customize Habits button in edit mode */}
      {editMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setEditMode(false);
            window.dispatchEvent(new CustomEvent('open-habit-setup'));
          }}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Sparkles size={18} strokeWidth={2.5} />
          <span className="text-sm font-medium">Customize Habits</span>
        </motion.button>
      )}
    </div>
  );
}
