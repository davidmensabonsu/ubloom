import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Heart, Sun, Moon, Cloud } from 'lucide-react';
import { useHomeMessages } from '@/hooks/useHomeMessages';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNav from '@/components/BottomNav';
import logo from '@/assets/logo.png';

const timeGreetings = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: Sun };
  if (hour < 17) return { text: 'Good afternoon', icon: Cloud };
  if (hour < 21) return { text: 'Good evening', icon: Moon };
  return { text: 'Sweet dreams', icon: Moon };
};

// Removed static message generators - now using AI via useHomeMessages

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
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground">
            
            <GreetingIcon size={18} />
            <span className="text-sm">{todayFormatted}</span>
          </motion.div>
          <motion.img

            alt="ubloom"
            className="h-8 w-8 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }} src="/lovable-uploads/98ee74aa-4350-4922-a6ea-f5e178038d09.png" />
          
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
        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5">
          
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              From your future self
            </span>
          </div>
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

        {/* Today's Mindset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-5">
          
          <h2 className="section-title mb-3 flex items-center gap-2">
            <Heart size={18} className="text-primary" />
            Today's Mindset
          </h2>
          {loading ?
          <Skeleton className="h-5 w-3/4" /> :

          <p className="text-foreground/80">{mindsetMessage}</p>
          }
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4">
          
          <QuickAction
            icon="📝"
            title="Journal"
            subtitle="What's on your heart?"
            href="/alignment" />
          
          <QuickAction
            icon="✨"
            title="Routine"
            subtitle="Your daily glow"
            href="/routine" />
          
          <QuickAction
            icon="🎯"
            title="Goals"
            subtitle="Your vision"
            href="/goals" />
          
          <QuickAction
            icon="🌸"
            title="Moodboard"
            subtitle="Manifest & dream"
            href="/moodboard" />
          
        </motion.div>

        {/* Recent Journal */}
        {profile.journalEntries.length > 0 &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-3xl p-5">
          
            <h2 className="section-title mb-3">Recent Reflection</h2>
            <p className="text-foreground/70 text-sm line-clamp-3">
              {profile.journalEntries[0].content}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(profile.journalEntries[0].date).toLocaleDateString()}
            </p>
          </motion.div>
        }
      </div>

      <BottomNav />
    </div>);

}

function QuickAction({
  icon,
  title,
  subtitle,
  href





}: {icon: string;title: string;subtitle: string;href: string;}) {
  return (
    <motion.a
      href={href}
      className="glass-card rounded-2xl p-4 flex flex-col items-start"
      whileTap={{ scale: 0.97 }}>
      
      <span className="text-2xl mb-2">{icon}</span>
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </motion.a>);

}