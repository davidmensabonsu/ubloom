import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { Heart, Sun, Moon, Cloud, Target } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import WeeklyMoodSummary from '@/components/home/WeeklyMoodSummary';
import BeautyAffirmations from '@/components/home/BeautyAffirmations';
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
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between my-0 py-0 mb-0 mr-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground">
            
            <GreetingIcon size={18} />
            <span className="text-sm">{todayFormatted}</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <ProfileButton />
            <motion.img
              alt="ubloom"
              className="h-12 w-12 object-contain clay-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              src={logo} />
            
          </div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="page-title">
          
          {greeting.text}, beautiful
        </motion.h1>
      </div>

      {/* Main content */}
      <div className="px-5 space-y-5">
        {/* Weekly Mood Summary */}
        <WeeklyMoodSummary />

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5">
          
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            From your future self
          </h2>
          {loading ?
          <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div> :

          <p className="font-display text-lg leading-relaxed text-foreground/90 italic">
              "{futureSelfMessage}"
            </p>
          }
        </motion.div>

        {/* Your Focus Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-3xl p-5 border border-primary/20">
          
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Target size={18} className="text-primary" />
            Your focus today
          </h2>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/5" />
            </div>
          ) : (
            <p className="font-medium text-foreground/90 text-base leading-relaxed">{focusToday}</p>
          )}
        </motion.div>

        {/* Today's Mindset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-3xl p-5">
          
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            Today's Mindset
          </h2>
          {loading ? <Skeleton className="h-5 w-3/4" /> : <p className="text-foreground/80">{mindsetMessage}</p>}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4">
          
          <QuickAction icon={quickActionIcons.journal} title="Journal" subtitle="What's on your heart?" href="/alignment" />
          <QuickAction icon={quickActionIcons.routine} title="Routine" subtitle="Your daily glow" href="/routine" />
          <QuickAction icon={quickActionIcons.goals} title="Goals" subtitle="Your vision" href="/goals" />
          <QuickAction icon={quickActionIcons.moodboard} title="Moodboard" subtitle="Manifest & dream" href="/moodboard" />
        </motion.div>

        {/* Beauty Affirmations */}
        <BeautyAffirmations />

        {/* Recent Journal */}
        {profile.journalEntries.length > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-5">
          
            <h2 className="section-title mb-3">Recent Reflection</h2>
            <p className="text-foreground/70 text-sm line-clamp-3">{profile.journalEntries[0].content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(profile.journalEntries[0].date).toLocaleDateString()}
            </p>
          </motion.div>
        }
      </div>

      <BottomNav />
    </div>);

}

function QuickAction({ icon, title, subtitle, href }: {icon: string;title: string;subtitle: string;href: string;}) {
  return (
    <motion.a href={href} className="glass-card rounded-2xl p-4 flex flex-col items-start" whileTap={{ scale: 0.97 }}>
      <img src={icon} alt="" className="w-8 h-8 object-contain mb-2" style={{ filter: 'none' }} />
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </motion.a>);

}