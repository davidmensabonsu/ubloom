import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { parse, format } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
import { getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';

interface PastDayViewProps {
  dateStr: string;
}

function ItemIcon({ iconId }: { iconId?: string }) {
  const opt = iconId ? getTaskIcon(iconId) : undefined;
  if (opt?.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain w-11 h-11 flex-shrink-0 clay-icon" />;
  }
  return <div className="icon-3d-sm">{opt ? renderTaskIcon(opt, 20) : null}</div>;
}

export default function PastDayView({ dateStr }: PastDayViewProps) {
  const { profile } = useUserStore();
  const snapshot = (profile.dailyTaskSnapshots || {})[dateStr];
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const formatted = format(date, 'EEEE, d MMM');

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
          Viewing {formatted} — read only
        </p>
      </div>

      {!snapshot || snapshot.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/70 text-center py-8 font-light">
          No record for this day
        </p>
      ) : (
        <div className="space-y-2">
          {snapshot.map((item) => (
            <div
              key={item.taskId}
              className={`check-item w-full ${item.completed ? 'opacity-70' : ''}`}
              aria-disabled
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                <div className={`check-circle ${item.completed ? 'checked' : ''}`}>
                  {item.completed && <Check size={14} strokeWidth={2.5} />}
                </div>
                <span
                  className={`text-sm font-medium flex items-center gap-2 ${
                    item.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  <ItemIcon iconId={item.icon} />
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}