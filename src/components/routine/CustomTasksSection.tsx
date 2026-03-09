import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Check, Sun, Clock, Moon, Pencil, Trash2, Repeat, CalendarDays, RotateCcw } from 'lucide-react';
import { getTaskIcon } from '@/lib/taskIcons';

const timeOfDayConfig = {
  morning: { label: 'Morning', icon: Sun, color: 'text-primary' },
  midday: { label: 'Midday', icon: Clock, color: 'text-primary' },
  evening: { label: 'Evening', icon: Moon, color: 'text-primary' },
};

const recurrenceLabels: Record<string, { label: string; icon: typeof Repeat }> = {
  daily: { label: 'daily', icon: Repeat },
  weekly: { label: 'weekly', icon: CalendarDays },
  oneoff: { label: 'one-off', icon: RotateCcw },
};

export default function CustomTasksSection() {
  const { getVisibleCustomTasks, toggleCustomTaskCompletion, isCustomTaskCompletedToday, removeCustomTask } = useUserStore();
  const [editMode, setEditMode] = useState(false);

  const visibleTasks = getVisibleCustomTasks();

  if (visibleTasks.length === 0) return null;

  const getTasksByTime = (time: TimeOfDay) => visibleTasks.filter((t) => t.timeOfDay === time);

  const totalCompleted = visibleTasks.filter((t) => isCustomTaskCompletedToday(t.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">My Tasks</h2>
          <p className="text-xs text-muted-foreground font-medium">
            {totalCompleted} of {visibleTasks.length} completed today
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
          animate={{ width: `${visibleTasks.length > 0 ? (totalCompleted / visibleTasks.length) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {(['morning', 'midday', 'evening'] as TimeOfDay[]).map((time, idx) => {
        const tasks = getTasksByTime(time);
        if (tasks.length === 0) return null;

        const config = timeOfDayConfig[time];
        const Icon = config.icon;

        return (
          <motion.div
            key={time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card rounded-3xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} strokeWidth={2.5} className={config.color} />
              <h3 className="font-semibold text-sm">{config.label}</h3>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => {
                const isCompleted = isCustomTaskCompletedToday(task.id);
                const rec = recurrenceLabels[task.recurrence];

                if (editMode) {
                  return (
                    <motion.div key={task.id} className="check-item w-full" layout>
                      {(() => {
                        const iconOpt = getTaskIcon(task.icon);
                        return iconOpt ? <iconOpt.icon size={18} strokeWidth={2} className="text-primary" /> : <span className="text-base">{task.icon}</span>;
                      })()}
                      <span className="text-sm font-medium flex-1">{task.title}</span>
                      <button
                        onClick={() => removeCustomTask(task.id)}
                        className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  );
                }

                return (
                  <motion.button
                    key={task.id}
                    onClick={() => toggleCustomTaskCompletion(task.id)}
                    className="check-item w-full"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`check-circle ${isCompleted ? 'checked' : ''}`}>
                      {isCompleted && <Check size={14} strokeWidth={2.5} />}
                    </div>
                    <span className={`text-sm font-medium flex items-center gap-2 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {(() => {
                        const iconOpt = getTaskIcon(task.icon);
                        return iconOpt ? <iconOpt.icon size={18} strokeWidth={2} className="text-primary" /> : <span className="text-base">{task.icon}</span>;
                      })()}
                      {task.title}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/50">
                      {rec && <rec.icon size={12} />}
                      {rec?.label}
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
