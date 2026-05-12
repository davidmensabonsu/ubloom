import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { format, parse } from 'date-fns';
import { getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';
import { getLocalDateStr } from '@/lib/dateUtils';

interface DayDetailSheetProps {
  dateStr: string | null;
  onClose: () => void;
}

export default function DayDetailSheet({ dateStr, onClose }: DayDetailSheetProps) {
  const { profile } = useUserStore();
  const coreHabits = profile.coreHabits || [];
  const habitCompletions = profile.habitCompletions || [];
  const snapshots = profile.dailyTaskSnapshots || {};

  if (!dateStr) return null;

  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const formattedDate = format(date, 'EEEE, MMM d');
  const today = getLocalDateStr();
  const isPast = dateStr < today;
  const snapshot = isPast ? snapshots[dateStr] : null;

  const dayCompletions = habitCompletions.filter(
    (c) => c.date === dateStr && c.completed
  );
  const completedIds = new Set(dayCompletions.map((c) => c.habitId));

  const allItems = isPast
    ? (snapshot || []).map((s) => ({
        id: s.taskId,
        title: s.title,
        icon: s.icon || 'sparkles',
        completed: s.completed,
      }))
    : coreHabits.map((h) => ({
        id: h.id,
        title: h.title,
        icon: h.icon || 'sparkles',
        completed: completedIds.has(h.id),
      }));

  const completedCount = allItems.filter((i) => i.completed).length;

  function ItemIcon({ iconId }: { iconId: string }) {
    const opt = getTaskIcon(iconId);
    if (opt) {
      return <div className="icon-3d-sm">{renderTaskIcon(opt, 20)}</div>;
    }
    return <span className="text-base">{iconId}</span>;
  }

  return (
    <AnimatePresence>
      {dateStr && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl shadow-xl max-h-[60vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  <h3 className="font-semibold text-base">{formattedDate}</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{allItems.length} done
                </span>
              </div>

              {isPast && (
                <div className="mb-3 px-3 py-2 rounded-2xl bg-muted/60 text-xs text-muted-foreground text-center">
                  Viewing a past day — this cannot be edited
                </div>
              )}

              {isPast && !snapshot ? (
                <p className="text-sm italic text-muted-foreground/70 text-center py-6">
                  No record found for this day
                </p>
              ) : allItems.length === 0 ? (
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
                      <ItemIcon iconId={item.icon} />
                      <span
                        className={`flex-1 text-sm ${
                          item.completed
                            ? 'text-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {item.title}
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
