import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Heart, Sun, Moon, Cloud, ArrowRight, Feather, Target, Palette, Zap } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import WeeklyMoodSummary from '@/components/home/WeeklyMoodSummary';

const timeGreetings = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun, period: 'morning' };
  if (hour < 17) return { text: 'Good afternoon', icon: Cloud, period: 'afternoon' };
  if (hour < 21) return { text: 'Good evening', icon: Moon, period: 'evening' };
  return { text: 'Sweet dreams', icon: Moon, period: 'night' };
};

const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08 } }
  },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }
};

export default function Home() {
  const { futureSelfMessage, mindsetMessage, loading } = useHomeMessages();
  const { profile } = useUserStore();
  const greeting = timeGreetings();
  const GreetingIcon = greeting.icon;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-muted-foreground">
            <GreetingIcon size={16} strokeWidth={2.5} />
            <span className="text-xs font-medium uppercase tracking-wider">{todayFormatted}</span>
          </motion.div>
          <motion.img
            alt="ubloom"
            className="h-24 w-24 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            src="/lovable-uploads/98ee74aa-4350-4922-a6ea-f5e178038d09.png"
          />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="page-title text-4xl leading-tight -mt-3">
          {greeting.text},
          <br />
          <span className="text-primary">beautiful</span>
        </motion.h1>
      </div>

      {/* Main content */}
      <motion.div
        className="px-5 space-y-5 mt-4"
        variants={stagger.container}
        initial="initial"
        animate="animate">

        {/* Weekly Mood Summary */}
        <motion.div variants={stagger.item}>
          <WeeklyMoodSummary />
        </motion.div>

        {/* Future Self Message — Hero Card */}
        <motion.div
          variants={stagger.item}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: 'linear-gradient(145deg, hsl(var(--glow)) 0%, hsl(var(--glow-strong)) 50%, hsl(var(--primary) / 0.15) 100%)',
            boxShadow: 'var(--shadow-elevated)'
          }}>
          {/* Decorative circle */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'hsl(var(--primary))' }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="icon-3d-sm">
                <Sparkles size={14} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                From your future self
              </span>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            ) : (
              <p className="font-display text-xl leading-relaxed text-foreground italic">
                "{futureSelfMessage}"
              </p>
            )}
          </div>
        </motion.div>

        {/* Today's Mindset */}
        <motion.div
          variants={stagger.item}
          className="glass-card rounded-3xl p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="icon-3d-sm">
              <Heart size={14} />
            </div>
            <h2 className="section-title text-lg">Today's Mindset</h2>
          </div>
          {loading ? (
            <Skeleton className="h-5 w-3/4" />
          ) : (
            <p className="text-foreground/80 leading-relaxed">{mindsetMessage}</p>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={stagger.item} className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={Feather}
            title="Journal"
            subtitle="What's on your heart?"
            href="/alignment"
            index={0}
          />
          <QuickAction
            icon={Zap}
            title="Routine"
            subtitle="Your daily glow"
            href="/routine"
            index={1}
          />
          <QuickAction
            icon={Target}
            title="Goals"
            subtitle="Your vision"
            href="/goals"
            index={2}
          />
          <QuickAction
            icon={Palette}
            title="Moodboard"
            subtitle="Manifest & dream"
            href="/moodboard"
            index={3}
          />
        </motion.div>

        {/* Recent Journal */}
        {profile.journalEntries.length > 0 && (
          <motion.a
            href="/alignment"
            variants={stagger.item}
            className="glass-card rounded-3xl p-5 block group">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title text-lg">Recent Reflection</h2>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed line-clamp-3">
              {profile.journalEntries[0].content}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              {new Date(profile.journalEntries[0].date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </motion.a>
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  subtitle,
  href,
  index
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  subtitle: string;
  href: string;
  index: number;
}) {
  return (
    <motion.a
      href={href}
      className="glass-card rounded-2xl p-4 flex flex-col gap-2 group"
      whileTap={{ scale: 0.97 }}>
      <div className="icon-3d-sm">
        <Icon size={14} strokeWidth={2.5} />
      </div>
      <div>
        <span className="font-medium text-foreground text-sm">{title}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </motion.a>
  );
}
