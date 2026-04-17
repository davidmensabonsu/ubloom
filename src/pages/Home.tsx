import { motion } from 'framer-motion';
import { Heart, Sun, Moon, Cloud, Target } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import TrialBanner from '@/components/TrialBanner';
import { useSubscription } from '@/hooks/useSubscription';

import logo from '@/assets/logo.png';
import { quickActionIcons } from '@/lib/moodIcons';
import ProfileButton from '@/components/ProfileButton';

const timeGreetings = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: Cloud };
  if (hour < 21) return { text: 'Good evening', icon: Moon };
  return { text: 'Sweet dreams', icon: Moon };
};

export default function Home() {
  const { futureSelfMessage, mindsetMessage, focusToday, loading } = useHomeMessages();
  const { status, isTrial, isExpired, trialDaysLeft } = useSubscription();
  const greeting = timeGreetings();
  const GreetingIcon = greeting.icon;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="h-[100dvh] flex flex-col gradient-background overflow-hidden md:overflow-auto">
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
          className="font-display text-2xl md:text-3xl font-normal tracking-tight text-white mt-2"
        >
          {greeting.text}, beautiful
        </motion.h1>
      </div>

      {/* Main content — fits viewport on mobile, scrollable on desktop */}
      <div className="flex-1 min-h-0 px-5 pb-20 flex flex-col gap-2 md:gap-3">
        {/* Trial / Expired Banner */}
        {(isTrial || isExpired) && status !== 'loading' && (
          <TrialBanner status={isTrial ? 'trial' : 'expired'} trialDaysLeft={trialDaysLeft} />
        )}

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dark-accent-card p-3 md:p-4 flex-1 min-h-0 md:flex-none overflow-hidden"
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
            <p className="font-display text-xs md:text-sm leading-relaxed text-white/95 italic line-clamp-3">
              "{futureSelfMessage}"
            </p>
          )}
        </motion.div>

        {/* Mindset */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-3 md:p-4 flex-1 min-h-0 md:flex-none overflow-hidden"
        >
          <h2 className="text-sm md:text-base font-display font-semibold tracking-tight text-foreground mb-1 flex items-center gap-2">
            <Heart size={14} className="text-primary shrink-0" />
            Mindset
          </h2>
          {loading ? (
            <Skeleton className="h-3 w-3/4" />
          ) : (
            <p className="text-xs md:text-sm text-foreground/80 leading-relaxed line-clamp-2 md:line-clamp-none">
              {mindsetMessage}
            </p>
          )}
        </motion.div>

        {/* Focus */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-3 md:p-4 border border-primary/20 flex-1 min-h-0 md:flex-none overflow-hidden"
        >
          <h2 className="text-sm md:text-base font-display font-semibold tracking-tight text-foreground mb-1 flex items-center gap-2">
            <Target size={14} className="text-primary shrink-0" />
            Focus
          </h2>
          {loading ? (
            <Skeleton className="h-3 w-3/4" />
          ) : (
            <p className="text-xs md:text-sm font-medium text-foreground/90 leading-relaxed line-clamp-2 md:line-clamp-none">
              {focusToday}
            </p>
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
