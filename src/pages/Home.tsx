import { motion } from 'framer-motion';
import { Heart, Sun, Moon, Cloud, Target } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import WeeklyMoodSummary from '@/components/home/WeeklyMoodSummary';
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
  const greeting = timeGreetings();
  const GreetingIcon = greeting.icon;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="h-[100dvh] flex flex-col gradient-background overflow-hidden md:overflow-auto">
      {/* Header — compact */}
      <div className="px-5 pt-10 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
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
          className="text-2xl font-display font-medium tracking-tight text-foreground mt-1"
        >
          {greeting.text}, beautiful
        </motion.h1>
      </div>

      {/* Main content — fills remaining space */}
      <div className="flex-1 min-h-0 px-5 pb-20 flex flex-col gap-3">
        {/* Weekly Mood Summary */}
        <WeeklyMoodSummary />

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4"
        >
          <h2 className="text-base font-display font-semibold tracking-tight text-foreground mb-1.5 flex items-center gap-2">
            <Heart size={16} className="text-primary" />
            From your future self
          </h2>
          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <p className="font-display text-sm leading-relaxed text-foreground/90 italic line-clamp-3">
              "{futureSelfMessage}"
            </p>
          )}
        </motion.div>

        {/* Mindset + Focus — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-3"
          >
            <h2 className="text-xs font-display font-semibold tracking-tight text-foreground mb-1 flex items-center gap-1.5">
              <Heart size={14} className="text-primary" />
              Mindset
            </h2>
            {loading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">
                {mindsetMessage}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-2xl p-3 border border-primary/20"
          >
            <h2 className="text-xs font-display font-semibold tracking-tight text-foreground mb-1 flex items-center gap-1.5">
              <Target size={14} className="text-primary" />
              Focus
            </h2>
            {loading ? (
              <Skeleton className="h-4 w-3/4" />
            ) : (
              <p className="text-xs font-medium text-foreground/90 leading-relaxed line-clamp-3">
                {focusToday}
              </p>
            )}
          </motion.div>
        </div>

        {/* Quick Actions — pushed to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-2 mt-auto"
        >
          <QuickAction icon={quickActionIcons.journal} title="Journal" href="/alignment" />
          <QuickAction icon={quickActionIcons.routine} title="Routine" href="/routine" />
          <QuickAction icon={quickActionIcons.ubi} title="Ubi" href="/ubi" />
          <QuickAction icon={quickActionIcons.wonder} title="Wander" href="/wonder" />
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
