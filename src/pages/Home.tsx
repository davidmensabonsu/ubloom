import { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sun, Moon, Cloud, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { useTodaysIntention } from '@/hooks/useTodaysIntention';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import TrialBanner from '@/components/TrialBanner';
import { useSubscription } from '@/hooks/useSubscription';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUserStore } from '@/stores/userStore';
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
  const { intention, loading: intentionLoading, regenerate } = useTodaysIntention();
  const { status, isTrial, isExpired, trialDaysLeft } = useSubscription();
  const habitCompletions = useUserStore((s) => s.profile.habitCompletions);
  const preferredName = useUserStore((s) => s.profile.preferredName);
  const cycleData = useUserStore((s) => s.profile.cycleData);
  const dailyCheckinState = useUserStore((s) => s.profile.dailyCheckinState);
  const intentionCompletedDate = useUserStore((s) => s.profile.intentionCompletedDate);
  const updateProfile = useUserStore((s) => s.updateProfile);

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

  // Subtitle: cycle phase or daily check-in state
  const subtitle = useMemo(() => {
    if (cycleData?.setupComplete && cycleData.lastPeriodStart) {
      const day = getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength);
      const phase = getCurrentPhase(day, cycleData.periodLength, cycleData.cycleLength);
      return `Day ${day} · ${phase} — ${PHASE_ENERGY[phase]}`;
    }
    if (dailyCheckinState) return `Feeling ${dailyCheckinState} today`;
    return null;
  }, [cycleData, dailyCheckinState]);

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

  // Long-press to regenerate intention
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  const handleRegenerate = async () => {
    if (intentionLoading) return;
    triggeredRef.current = true;
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        (navigator as any).vibrate?.(30);
      }
    } catch {/* noop */}
    toast.message('Regenerating today\'s intention…');
    await regenerate();
  };

  const startPress = () => {
    triggeredRef.current = false;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      handleRegenerate();
    }, 600);
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-background">
      {/* Hero gradient header */}
      <div className="hero-gradient px-5 pt-10 pb-8 shrink-0">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/85"
          >
            <GreetingIcon size={16} />
            <span className="text-xs">{todayFormatted}</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <ProfileButton />
            <motion.img
              alt="ubloom"
              className="h-10 w-10 object-contain clay-icon"
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
          className="font-display text-2xl md:text-3xl font-normal tracking-tight text-white mt-2"
        >
          {greeting.text}, {preferredName || 'beautiful'}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="font-body text-xs md:text-sm text-white/80 mt-1.5"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Weekly consistency tracker */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-4"
        >
          <div className="flex items-center gap-2.5">
            {week.days.map((d, i) => {
              const base = d.isToday ? 'w-2.5 h-2.5' : 'w-2 h-2';
              const fill = d.completed
                ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                : 'bg-transparent border border-white/45';
              return (
                <span
                  key={i}
                  className={`${base} ${fill} rounded-full transition-all`}
                  aria-label={`${d.dateStr}${d.completed ? ' completed' : ''}${d.isToday ? ' (today)' : ''}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-white/70 tracking-wide">{week.label}</p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 pb-24 pt-3 flex flex-col gap-3">
        {/* Trial / Expired Banner */}
        {(isTrial || isExpired) && status !== 'loading' && (
          <TrialBanner status={isTrial ? 'trial' : 'expired'} trialDaysLeft={trialDaysLeft} />
        )}

        {/* Today's Intention — chosen by Ubi */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: intentionDone ? 0.7 : 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="dark-accent-card p-4 select-none cursor-pointer"
          onPointerDown={startPress}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
          role="button"
          aria-label="Today's intention. Long-press to regenerate."
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-white/60 font-body text-[10px] uppercase tracking-[0.14em]">
              <span aria-hidden>◆</span>
              <span>Today's intention — chosen by Ubi</span>
            </div>
            <span className="hidden sm:flex items-center gap-1 text-white/40 text-[9px] uppercase tracking-[0.12em]">
              <RefreshCw size={9} />
              Hold to refresh
            </span>
          </div>

          {intentionLoading ? (
            <div className="space-y-2 py-1" aria-busy="true" aria-label="Generating today's intention">
              <div className="h-4 w-11/12 rounded-full bg-white/15 animate-pulse blur-[1px]" />
              <div className="h-4 w-3/4 rounded-full bg-white/15 animate-pulse blur-[1px]" />
            </div>
          ) : (
            <p className="font-display italic text-lg md:text-xl leading-snug text-white">
              {intention}
            </p>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (triggeredRef.current) { triggeredRef.current = false; return; }
              toggleIntentionDone();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={intentionLoading}
            className="mt-3 w-full flex items-center justify-between text-white/80 hover:text-white transition-colors disabled:opacity-50"
            aria-pressed={intentionDone}
            aria-label={intentionDone ? "Mark today's intention as not done" : "Mark today's intention as done"}
          >
            <span className="text-xs font-medium">
              {intentionDone ? 'Done for today' : 'Mark as done'}
            </span>
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full border transition-all ${
                intentionDone
                  ? 'bg-white/90 border-white/90'
                  : 'bg-transparent border-white/40'
              }`}
            >
              {intentionDone && <Check size={14} strokeWidth={3} className="text-foreground/80" />}
            </span>
          </button>

          <p className="sm:hidden mt-2 text-[9px] text-white/35 uppercase tracking-[0.12em] flex items-center gap-1">
            <RefreshCw size={9} />
            Hold card to refresh
          </p>
        </motion.div>

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="dark-accent-card p-4"
        >
          <h2 className="text-sm md:text-base font-display font-semibold tracking-tight text-white mb-1 flex items-center gap-2">
            <Heart size={14} className="text-white/80 shrink-0" />
            From your future self
          </h2>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full bg-white/15" />
              <Skeleton className="h-3 w-4/5 bg-white/15" />
            </div>
          ) : (
            <>
              <p className="font-display text-xs md:text-sm leading-relaxed text-white/95 italic line-clamp-2">
                "{futureSelfMessage}"
              </p>
              <button
                onClick={() => setLetterOpen(true)}
                className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                style={{ color: 'hsl(var(--primary))' }}
              >
                Read full letter →
              </button>
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2 shrink-0"
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

      <BottomNav />
    </div>
  );
}

function QuickAction({ icon, title, href }: { icon: string; title: string; href: string }) {
  return (
    <motion.a
      href={href}
      className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5"
      whileTap={{ scale: 0.97 }}
    >
      <img src={icon} alt="" className="w-7 h-7 object-contain" style={{ filter: 'none' }} />
      <span className="text-xs font-medium text-foreground">{title}</span>
    </motion.a>
  );
}
