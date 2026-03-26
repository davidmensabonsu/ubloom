import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { wonderResources } from '@/lib/wonderResources';

export default function WonderStreak() {
  const { resourceCompletions = [] } = useUserStore((s) => s.profile);

  const stats = useMemo(() => {
    if (!resourceCompletions.length) return null;

    // Unique days with at least one completion
    const uniqueDays = new Set(resourceCompletions.map((c) => c.date));
    const totalSessions = resourceCompletions.length;
    const uniqueResources = new Set(resourceCompletions.map((c) => c.resourceId)).size;

    // Calculate streak (consecutive days ending today or yesterday)
    const today = getLocalDateStr();
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    let streak = 0;
    const d = new Date();
    // Allow streak to start from today or yesterday
    const startDate = sortedDays[0] === today ? today : sortedDays[0];
    if (startDate !== today) {
      const yesterday = new Date(d);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = getLocalDateStr(yesterday);
      if (startDate !== yStr) return { streak: 0, totalSessions, uniqueResources, recentDays: sortedDays.slice(0, 7) };
    }

    const checkDate = new Date(startDate + 'T12:00:00');
    for (let i = 0; i < 365; i++) {
      const ds = getLocalDateStr(checkDate);
      if (uniqueDays.has(ds)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Last 7 days for the mini heatmap
    const last7: { date: string; count: number }[] = [];
    const cursor = new Date();
    for (let i = 6; i >= 0; i--) {
      const dd = new Date(cursor);
      dd.setDate(dd.getDate() - i);
      const ds = getLocalDateStr(dd);
      const count = resourceCompletions.filter((c) => c.date === ds).length;
      last7.push({ date: ds, count });
    }

    return { streak, totalSessions, uniqueResources, last7 };
  }, [resourceCompletions]);

  if (!stats || stats.totalSessions === 0) return null;

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-4 space-y-3"
    >
      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-lg font-display font-bold text-foreground leading-tight">
              {stats.streak} day{stats.streak !== 1 ? 's' : ''}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Practice streak</p>
          </div>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="text-sm font-semibold text-foreground">{stats.totalSessions}</p>
            <p className="text-[10px] text-muted-foreground">Sessions</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{stats.uniqueResources}</p>
            <p className="text-[10px] text-muted-foreground">Explored</p>
          </div>
        </div>
      </div>

      {/* Mini heatmap — last 7 days */}
      {stats.last7 && (
        <div className="flex gap-1.5 justify-between">
          {stats.last7.map((day, i) => {
            const dayOfWeek = new Date(day.date + 'T12:00:00').getDay();
            return (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className="w-7 h-7 rounded-lg transition-colors flex items-center justify-center text-[10px] font-medium"
                  style={{
                    backgroundColor: day.count === 0
                      ? 'hsl(var(--muted))'
                      : day.count === 1
                        ? 'hsl(var(--primary) / 0.25)'
                        : day.count <= 3
                          ? 'hsl(var(--primary) / 0.5)'
                          : 'hsl(var(--primary) / 0.8)',
                    color: day.count >= 3 ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {day.count > 0 ? day.count : ''}
                </div>
                <span className="text-[9px] text-muted-foreground">{dayLabels[dayOfWeek]}</span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
