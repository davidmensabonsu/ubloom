import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Star, Crown } from 'lucide-react';
import { subDays, format } from 'date-fns';
import type { MoodEntry } from '@/stores/userStore';

const milestones = [
  { days: 7, icon: Star, label: '1 Week Streak!', message: 'You showed up for yourself every single day 💛' },
  { days: 14, icon: Trophy, label: '2 Week Streak!', message: 'Your consistency is building something beautiful ✨' },
  { days: 30, icon: Crown, label: '30 Day Streak!', message: "A whole month of self-awareness — that's powerful 👑" },
];

interface Props {
  moodHistory: MoodEntry[];
}

export default function MoodStreak({ moodHistory }: Props) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null);

  const streak = useMemo(() => {
    if (moodHistory.length === 0) return 0;
    const daysWithMoods = new Set<string>();
    moodHistory.forEach((entry) => {
      daysWithMoods.add(format(new Date(entry.date), 'yyyy-MM-dd'));
    });
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const dayStr = format(subDays(today, i), 'yyyy-MM-dd');
      if (daysWithMoods.has(dayStr)) {
        count++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return count;
  }, [moodHistory]);

  const activeMilestone = useMemo(() => {
    return [...milestones].reverse().find((m) => streak >= m.days) || null;
  }, [streak]);

  useEffect(() => {
    if (!activeMilestone) return;
    const storageKey = `milestone-celebrated-${activeMilestone.days}`;
    const alreadyCelebrated = localStorage.getItem(storageKey);
    if (!alreadyCelebrated) {
      setShowCelebration(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [activeMilestone]);

  const dismissCelebration = () => {
    setShowCelebration(false);
    if (activeMilestone) setDismissedMilestone(activeMilestone.days);
  };

  if (streak === 0) return null;

  const isMilestone = milestones.some((m) => m.days === streak);
  const MilestoneIcon = activeMilestone?.icon || Flame;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl ${
          isMilestone ? 'bg-accent/20 ring-1 ring-accent/30' : 'bg-primary/10'
        }`}
      >
        {isMilestone ? (
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <MilestoneIcon size={18} className="text-accent" />
          </motion.div>
        ) : (
          <Flame size={18} className="text-primary" />
        )}
        <span className="text-sm font-medium text-foreground/90">
          {streak} day{streak !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-muted-foreground">streak</span>
      </motion.div>

      {/* Milestone Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && activeMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={dismissCelebration}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="glass-card rounded-3xl p-8 mx-6 text-center max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5"
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 0] }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <activeMilestone.icon size={36} className="text-accent" />
                </motion.div>
              </motion.div>

              {/* Sparkle particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
                    y: [0, -(20 + i * 12)],
                  }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 1 }}
                  className="absolute left-1/2 top-1/3 w-2 h-2 rounded-full bg-accent/60"
                />
              ))}

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-display text-2xl font-bold text-foreground mb-2"
              >
                {activeMilestone.label}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-muted-foreground leading-relaxed mb-2"
              >
                {activeMilestone.message}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-muted-foreground/70 mb-5"
              >
                {streak} consecutive days of check-ins
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                onClick={dismissCelebration}
                className="soft-button px-8 py-2.5 text-sm"
                whileTap={{ scale: 0.97 }}
              >
                Keep going ✨
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
