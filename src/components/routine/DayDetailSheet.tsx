import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { format, parse } from 'date-fns';

interface DayDetailSheetProps {
  dateStr: string | null;
  onClose: () => void;
}

export default function DayDetailSheet({ dateStr, onClose }: DayDetailSheetProps) {
  const { profile } = useUserStore();
  const coreHabits = profile.coreHabits || [];
  const customTasks = profile.customTasks || [];
  const habitCompletions = profile.habitCompletions || [];

  if (!dateStr) return null;

  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dayOfWeek = date.getDay();
  const formattedDate = format(date, 'EEEE, MMM d');

  // Get completions for this day
  const dayCompletions = habitCompletions.filter(
    (c) => c.date === dateStr && c.completed
  );
  const completedIds = new Set(dayCompletions.map((c) => c.habitId));

  // Get relevant custom tasks for this day
  const relevantCustomTasks = customTasks.filter((task) => {
    if (task.recurrence === 'daily') return true;
    if (task.recurrence === 'weekly') return task.weeklyDays?.includes(dayOfWeek) ?? false;
    if (task.recurrence === 'oneoff') return task.scheduledDate === dateStr;
    return false;
  });

  const allItems = [
    ...coreHabits.map((h) => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      completed: completedIds.has(h.id),
      type: 'habit' as const,
    })),
    ...relevantCustomTasks.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon || '📋',
      completed: completedIds.has(t.id),
      type: 'task' as const,
    })),
  ];

  const completedCount = allItems.filter((i) => i.completed).length;

  return (
    <AnimatePresence>
      {dateStr && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-xl max-h-[60vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <h3 className="font-semibold text-base">{formattedDate}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{allItems.length} done
                </span>
              </div>

              {/* Items */}
              {allItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No habits tracked this day
                </p>
              ) : (
                <div className="space-y-2">
                  {allItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${
                        item.completed ? 'bg-primary/10' : 'bg-muted/60'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? 'text-foreground'
                            : 'text-muted-foreground line-through'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.completed ? (
                        <Check size={16} className="text-primary" />
                      ) : (
                        <X size={16} className="text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
