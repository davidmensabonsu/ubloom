import { motion } from 'framer-motion';
import { parse, format } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
import { getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';
import { Clock } from 'lucide-react';

interface FutureDayViewProps {
  dateStr: string;
}

function ItemIcon({ iconId }: { iconId?: string }) {
  const opt = iconId ? getTaskIcon(iconId) : undefined;
  if (opt?.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className={`object-contain w-11 h-11 flex-shrink-0 clay-icon${opt.id === 'ubloom' ? ' p-1.5' : ''}`} />;
  }
  return <div className="icon-3d-sm">{opt ? renderTaskIcon(opt, 20) : null}</div>;
}

function periodOrder(time?: string, fallback?: string): number {
  // Sort by scheduledTime when available, else by timeOfDay bucket.
  if (time) {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }
  if (fallback === 'morning') return 7 * 60;
  if (fallback === 'midday') return 13 * 60;
  if (fallback === 'evening') return 19 * 60;
  return 99 * 60;
}

export default function FutureDayView({ dateStr }: FutureDayViewProps) {
  const { profile } = useUserStore();
  const coreHabits = profile.coreHabits || [];
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const formatted = format(date, 'EEEE, d MMM');

  const scheduled = coreHabits
    .filter((h) => isHabitScheduledForDate(h, dateStr))
    .sort(
      (a, b) =>
        periodOrder(a.scheduledTime, a.timeOfDay) - periodOrder(b.scheduledTime, b.timeOfDay),
    );

  return (
    <motion.div
      key={dateStr}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="section-title">To-do list</h2>
      </div>

      <div className="rounded-2xl bg-muted/30 px-4 py-2.5">
        <p className="text-sm text-muted-foreground font-light">
          Previewing {formatted} — you can add tasks, but check-ins open on the day
        </p>
      </div>

      {scheduled.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/70 text-center py-8 font-light">
          Nothing scheduled yet. Tap + to add something for this day.
        </p>
      ) : (
        <div className="space-y-2">
          {scheduled.map((h) => (
            <div key={h.id} className="check-item w-full opacity-90" aria-disabled>
              <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className="check-circle" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium flex items-center gap-2 truncate">
                    <ItemIcon iconId={h.icon} />
                    {h.title}
                  </span>
                  {h.scheduledTime && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5 ml-[2.75rem]">
                      <Clock size={10} />
                      {h.scheduledTime}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70 px-2 py-0.5 rounded-full bg-muted/60">
                scheduled
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}