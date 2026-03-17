import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { startOfWeek, subWeeks, isAfter, isBefore, format } from 'date-fns';
import { feelingIcons } from '@/lib/moodIcons';

const feelingMeta: Record<string, { label: string; icon: string }> = {
  calm: { label: 'Calm', icon: feelingIcons.calm },
  energized: { label: 'Energized', icon: feelingIcons.energized },
  grateful: { label: 'Grateful', icon: feelingIcons.grateful },
  creative: { label: 'Creative', icon: feelingIcons.creative },
  peaceful: { label: 'Peaceful', icon: feelingIcons.peaceful },
  confident: { label: 'Confident', icon: feelingIcons.confident },
  grounded: { label: 'Grounded', icon: feelingIcons.grounded },
  joyful: { label: 'Joyful', icon: feelingIcons.joyful },
  anxious: { label: 'Anxious', icon: feelingIcons.anxious },
  sad: { label: 'Sad', icon: feelingIcons.sad },
  overwhelmed: { label: 'Overwhelmed', icon: feelingIcons.overwhelmed },
  frustrated: { label: 'Frustrated', icon: feelingIcons.frustrated },
  tired: { label: 'Tired', icon: feelingIcons.tired },
  lonely: { label: 'Lonely', icon: feelingIcons.lonely },
  numb: { label: 'Numb', icon: feelingIcons.numb },
  hopeful: { label: 'Hopeful', icon: feelingIcons.hopeful },
};

const DISMISSED_KEY = 'weekly-mood-summary-dismissed';

export default function WeeklyMoodSummary() {
  const { profile } = useUserStore();

  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekKey = format(thisWeekStart, 'yyyy-MM-dd');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === weekKey;
    } catch {
      return false;
    }
  });

  const summary = useMemo(() => {
    const lastWeekStart = subWeeks(thisWeekStart, 1);
    const lastWeekEnd = thisWeekStart;

    const counts: Record<string, number> = {};
    let totalEntries = 0;

    profile.moodHistory.forEach((entry) => {
      const date = new Date(entry.date);
      if (isAfter(date, lastWeekStart) && isBefore(date, lastWeekEnd)) {
        totalEntries++;
        entry.moods.forEach((m) => {
          counts[m] = (counts[m] || 0) + 1;
        });
      }
    });

    if (totalEntries === 0) return null;

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topMood = sorted[0];
    const topThree = sorted.slice(0, 3);

    return { topMood, topThree, totalEntries };
  }, [profile.moodHistory, thisWeekStart]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, weekKey);
    } catch {}
  };

  if (dismissed || !summary) return null;

  const [topMoodKey, topMoodCount] = summary.topMood;
  const topMeta = feelingMeta[topMoodKey];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20 }}
        className="glass-card rounded-3xl p-5 relative overflow-hidden"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-background/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp size={16} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Last week's mood recap</span>
        </div>

        {/* Hero mood */}
        <div className="flex items-center gap-3 mb-3">
          <img src={topMeta?.icon || feelingIcons.joyful} alt="" className="w-8 h-8 object-contain clay-icon" />
          <div>
            <p className="text-foreground font-medium">
              You felt <span className="text-primary">{topMeta?.label || topMoodKey}</span> the most
            </p>
            <p className="text-xs text-muted-foreground">
              {topMoodCount} time{topMoodCount > 1 ? 's' : ''} across {summary.totalEntries} check-in
              {summary.totalEntries > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Top 3 breakdown */}
        {summary.topThree.length > 1 && (
          <div className="flex gap-2 pt-2 border-t border-primary/10">
            {summary.topThree.map(([key, count]) => {
              const meta = feelingMeta[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 text-xs"
                >
                  <img src={meta?.icon} alt="" className="w-4 h-4 object-contain" style={{ filter: 'none' }} />
                  <span className="text-foreground/80">{meta?.label || key}</span>
                  <span className="text-muted-foreground">×{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
