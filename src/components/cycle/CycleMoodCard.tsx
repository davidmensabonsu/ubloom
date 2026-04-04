import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import sparklesIcon from '@/assets/icons/sparkles.png';

export default function CycleMoodCard() {
  const { profile } = useUserStore();
  const recent = (profile.moodHistory || []).slice(-7);
  const checkinState = profile.dailyCheckinState;

  const moodSummary = (() => {
    if (recent.length === 0) return null;
    const counts: Record<string, number> = {};
    recent.forEach((entry) => {
      (entry.moods || []).forEach((m: string) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([mood]) => mood).join(', ');
  })();

  const checkinLabel: Record<string, string> = {
    disconnected: 'Disconnected',
    'off-track': 'Off-track',
    grounded: 'Grounded',
    aligned: 'Aligned',
    elevated: 'Elevated',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <img src={sparklesIcon} alt="Mood" className="w-6 h-6 clay-icon" />
        <h3 className="font-display font-semibold text-sm text-foreground">How are you feeling?</h3>
      </div>

      {checkinState && (
        <div className="mb-2">
          <span className="text-xs text-muted-foreground">Today's check-in: </span>
          <span className="text-sm text-foreground font-medium">{checkinLabel[checkinState] || checkinState}</span>
        </div>
      )}

      {moodSummary ? (
        <p className="text-sm text-foreground/80">
          Your most common moods this week: <span className="font-medium text-foreground">{moodSummary}</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No mood data yet — check in on the Reflect page to see trends here</p>
      )}
    </motion.div>
  );
}
