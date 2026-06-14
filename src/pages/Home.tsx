import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sun, Moon, Cloud, Check } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { useTodaysIntention } from '@/hooks/useTodaysIntention';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import { useSubscription } from '@/hooks/useSubscription';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUserStore } from '@/stores/userStore';
import UpgradeModal from '@/components/UpgradeModal';
import { getLocalDateStr } from '@/lib/dateUtils';
import { getCurrentCycleDay, getCurrentPhase, type CyclePhase } from '@/lib/cycleUtils';

import logo from '@/assets/logo.png';
import { quickActionIcons } from '@/lib/moodIcons';
import ProfileButton from '@/components/ProfileButton';

const timeGreetings = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: Cloud };
  return { text: 'Good evening', icon: Moon };
};

const PHASE_ENERGY: Record<CyclePhase, string> = {
  Menstrual: 'rest and restore today',
  Follicular: 'your energy is rising',
  Ovulatory: 'peak energy — use it',
  Luteal: 'turn inward, go steady',
};

export default function Home() {
  const { futureSelfMessage, loading } = useHomeMessages();
  const { intention, loading: intentionLoading } = useTodaysIntention();
  const { isPremium } = useSubscription();
  const habitCompletions = useUserStore((s) => s.profile.habitCompletions);
  const preferredName = useUserStore((s) => s.profile.preferredName);
  const cycleData = useUserStore((s) => s.profile.cycleData);
  const dailyCheckinState = useUserStore((s) => s.profile.dailyCheckinState);
  const intentionCompletedDate = useUserStore((s) => s.profile.intentionCompletedDate);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [letterModalOpen, setLetterModalOpen] = useState(false);

  const [letterOpen, setLetterOpen] = useState(false);
  const greeting = timeGreetings();
  const GreetingIcon = greeting.icon;
  const todayStr = getLocalDateStr();
  const intentionDone = intentionCompletedDate === todayStr;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Subtitle: cycle phase (premium only) or daily check-in state
  const subtitle = useMemo(() => {
    if (isPremium && cycleData?.setupComplete && cycleData.lastPeriodStart) {
      const day = getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength);
      const phase = getCurrentPhase(day, cycleData.periodLength, cycleData.cycleLength);
      return `Day ${day} · ${phase} — ${PHASE_ENERGY[phase]}`;
    }
    if (dailyCheckinState) return `Feeling ${dailyCheckinState} today`;
    return null;
  }, [isPremium, cycleData, dailyCheckinState]);

  // Weekly consistency: Sunday → Saturday of current week
  const week = useMemo(() => {
    const today = new Date();
    const todayLocal = getLocalDateStr(today);
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    const completedDates = new Set(
      (habitCompletions || []).filter((c) => c.completed).map((c) => c.date)
    );

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateStr = getLocalDateStr(d);
      return {
        dateStr,
        isToday: dateStr === todayLocal,
        isPast: dateStr <= todayLocal,
        completed: completedDates.has(dateStr),
      };
    });

    const completedCount = days.filter((d) => d.completed).length;
    let label: string;
    if (completedCount === 7) label = "Perfect week — you're glowing";
    else if (completedCount >= 5) label = `${completedCount} of 7 days — you're on a roll`;
    else if (completedCount >= 1) label = `${completedCount} of 7 days this week`;
    else label = 'A fresh week — start with one small step';

    return { days, label };
  }, [habitCompletions]);

  const toggleIntentionDone = () => {
    updateProfile({ intentionCompletedDate: intentionDone ? undefined : todayStr });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-background">
      {/* Hero gradient header */}
      <div
        className="px-5 pt-10 pb-8 shrink-0"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <GreetingIcon size={16} />
            <span className="text-sm">{todayFormatted}</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <ProfileButton />
            <motion.img
              alt="uBloom"
              className="h-10 w-10 object-contain"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              src={logo}
            />
          </div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl font-normal leading-tight text-foreground mt-6"
        >
          {greeting.text}, {preferredName || 'beautiful'}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="font-body text-sm font-normal text-foreground/70 tracking-wide mt-2"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Weekly consistency tracker */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-5"
        >
          <div className="flex items-center gap-2.5">
            {week.days.map((d, i) => {
              const base = d.isToday ? 'w-3 h-3' : 'w-2.5 h-2.5';
              const fill = d.completed
                ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]'
                : 'bg-transparent border border-primary/50';
              return (
                <span
                  key={i}
                  className={`${base} ${fill} rounded-full transition-all`}
                  aria-label={`${d.dateStr}${d.completed ? ' completed' : ''}${d.isToday ? ' (today)' : ''}`}
                />
              );
            })}
          </div>
          <p className="mt-3 text-xs font-normal text-foreground/60 tracking-wide">{week.label}</p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 pb-24 pt-3 flex flex-col gap-3">
        {/* Today's Intention — chosen by Ubi */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: intentionDone ? 0.7 : 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white border border-primary/20 rounded-2xl p-5"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <div className="flex items-center gap-1.5 text-primary font-body text-xs uppercase tracking-[0.14em] mb-3">
            <span aria-hidden className="text-primary">◆</span>
            <span>Today's intention — chosen by Ubi</span>
          </div>

          {intentionLoading ? (
            <div className="space-y-2 py-1" aria-busy="true" aria-label="Generating today's intention">
              <div className="h-4 w-11/12 rounded-full bg-primary/10 animate-pulse blur-[1px]" />
              <div className="h-4 w-3/4 rounded-full bg-primary/10 animate-pulse blur-[1px]" />
            </div>
          ) : (
            <p className="font-body text-base font-normal leading-relaxed text-foreground">
              {intention}
            </p>
          )}

          <button
            type="button"
            onClick={toggleIntentionDone}
            disabled={intentionLoading}
            className="mt-4 w-full flex items-center justify-between text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
            aria-pressed={intentionDone}
            aria-label={intentionDone ? "Mark today's intention as not done" : "Mark today's intention as done"}
          >
            <span className="text-sm font-normal">
              {intentionDone ? 'Done for today' : 'Mark as done'}
            </span>
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all ${
                intentionDone
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-primary'
              }`}
            >
              {intentionDone && <Check size={14} strokeWidth={3} className="text-primary-foreground" />}
            </span>
          </button>
        </motion.div>

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-white border border-primary/15 rounded-2xl p-5"
          style={{ boxShadow: 'var(--shadow-soft)' }}
        >
          <h2 className="text-lg font-display font-normal text-foreground mb-2 flex items-center gap-2">
            <Heart size={16} className="text-primary shrink-0" />
            From your future self
          </h2>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full bg-primary/10" />
              <Skeleton className="h-3 w-4/5 bg-primary/10" />
            </div>
          ) : (
            <>
              {isPremium ? (
                <>
                  <p className="font-display italic text-base font-normal leading-relaxed text-foreground/80">
                    "{futureSelfMessage}"
                  </p>
                  <button
                    onClick={() => setLetterOpen(true)}
                    className="mt-3 text-sm font-normal text-primary hover:text-primary/80 transition-colors"
                  >
                    Read full letter →
                  </button>
                </>
              ) : (
                <>
                  <p className="font-display italic text-base font-normal leading-relaxed text-foreground/80">
                    "{(futureSelfMessage || '').split(/(?<=[.!?])\s+/)[0]}"
                  </p>
                  <button
                    onClick={() => setLetterModalOpen(true)}
                    className="mt-3 text-sm font-normal text-primary hover:text-primary/80 transition-colors"
                  >
                    Unlock full letter — Upgrade to Premium →
                  </button>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 shrink-0"
        >
          <QuickAction icon={quickActionIcons.journal} title="Journal" href="/alignment" />
          <QuickAction icon={quickActionIcons.routine} title="Routine" href="/routine" />
          <QuickAction icon={quickActionIcons.ubi} title="Ubi" href="/ubi" />
          <QuickAction icon={quickActionIcons.health} title="Health" href="/health" />
        </motion.div>
      </div>

      {/* Full letter slide-up sheet */}
      <Sheet open={letterOpen} onOpenChange={setLetterOpen}>
        <SheetContent
          side="bottom"
          className="dark-accent-card border-0 rounded-t-3xl max-h-[80vh] overflow-y-auto p-6"
        >
          <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-white/25" />
          <SheetHeader>
            <SheetTitle className="text-base font-display font-semibold text-white flex items-center gap-2 text-left">
              <Heart size={16} className="text-white/80" />
              From your future self
            </SheetTitle>
          </SheetHeader>
          <p className="font-display text-sm leading-relaxed text-white/95 italic whitespace-pre-line mt-4">
            "{futureSelfMessage}"
          </p>
          <button
            onClick={() => setLetterOpen(false)}
            className="mt-6 w-full py-2.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-medium"
          >
            Close
          </button>
        </SheetContent>
      </Sheet>

      <UpgradeModal
        open={letterModalOpen}
        onClose={() => setLetterModalOpen(false)}
        source="home_future_self_letter"
      />

      <BottomNav />
    </div>
  );
}

function QuickAction({ icon, title, href }: { icon: string; title: string; href: string }) {
  return (
    <motion.a
      href={href}
      className="bg-white border border-primary/15 rounded-2xl p-4 flex flex-row items-center gap-3 justify-start"
      style={{ boxShadow: 'var(--shadow-soft)' }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <img src={icon} alt="" className="w-5 h-5 object-contain clay-icon" />
      </div>
      <span className="text-base font-medium text-foreground">{title}</span>
    </motion.a>
  );
}
