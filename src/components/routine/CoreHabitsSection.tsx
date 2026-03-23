import { motion, AnimatePresence } from 'framer-motion';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useState } from 'react';
import { useUserStore, TimeOfDay, CoreHabit } from '@/stores/userStore';
import { Check, Sun, Clock, Moon, Plus, X, Sparkles, Pencil, Trash2, ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import { getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';
import EditHabitDialog from '@/components/routine/EditHabitDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const timeOfDayConfig = {
  morning: { label: 'Morning', icon: Sun, color: 'text-primary' },
  midday: { label: 'Midday', icon: Clock, color: 'text-primary' },
  evening: { label: 'Evening', icon: Moon, color: 'text-primary' },
};

function HabitIcon({ iconId }: { iconId?: string }) {
  const opt = iconId ? getTaskIcon(iconId) : undefined;
  if (opt?.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain w-11 h-11 flex-shrink-0 clay-icon" />;
  }
  return (
    <div className="icon-3d-sm">
      {opt ? renderTaskIcon(opt, 20) : <Sparkles size={20} strokeWidth={2.5} />}
    </div>
  );
}

export default function CoreHabitsSection() {
  const { profile, toggleHabitCompletion, isHabitCompletedToday, addRoutineTask, toggleTask, removeHabit, updateHabit, reorderHabit } = useUserStore();
  const { coreHabits } = profile;
  
  const [addingToSection, setAddingToSection] = useState<TimeOfDay | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; title: string } | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<CoreHabit | null>(null);

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
        className="glass-card rounded-3xl p-8 text-center space-y-3"
      >
        <div className="icon-3d mx-auto w-fit">
          <Sparkles size={28} strokeWidth={2} />
        </div>
        <h3 className="font-semibold text-base">Start building your routine</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
          Small daily habits lead to big transformations. Tap the <span className="inline-flex align-middle"><Plus size={14} strokeWidth={2.5} className="text-primary" /></span> button to add your first one!
        </p>
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
                          onClick={() => setHabitToEdit(habit)}
                          className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Settings2 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => setHabitToDelete({ id: habit.id, title: habit.title })}
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

      {/* Add habit hint in edit mode */}
      {editMode && (
        <p className="text-center text-xs text-muted-foreground pt-1">
          Use the + button to add new habits
        </p>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold">"{habitToDelete?.title}"</span> from your daily routine. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (habitToDelete) removeHabit(habitToDelete.id);
                setHabitToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Habit Dialog */}
      <EditHabitDialog
        habit={habitToEdit}
        open={!!habitToEdit}
        onOpenChange={(open) => !open && setHabitToEdit(null)}
        onSave={updateHabit}
      />
    </div>
  );
}
