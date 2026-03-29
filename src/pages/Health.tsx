import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

import moonIcon from '@/assets/icons/moon.png';
import bedIcon from '@/assets/icons/bed.png';
import brainIcon from '@/assets/icons/brain.png';
import leafIcon from '@/assets/icons/leaf.png';
import runningIcon from '@/assets/icons/running.png';
import sparklesIcon from '@/assets/icons/sparkles.png';
import crystalBallIcon from '@/assets/icons/crystal-ball.png';

const healthCards = [
  { label: 'Cycle Phase', icon: moonIcon, key: 'cycle' },
  { label: 'Sleep', icon: bedIcon, key: 'sleep' },
  { label: 'Stress', icon: brainIcon, key: 'stress' },
  { label: 'Recovery', icon: leafIcon, key: 'recovery' },
  { label: 'Activity', icon: runningIcon, key: 'activity' },
  { label: 'Mood Patterns', icon: sparklesIcon, key: 'mood' },
];

export default function Health() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Derive mood pattern summary
  const moodSummary = (() => {
    const recent = (profile.moodHistory || []).slice(-7);
    if (recent.length === 0) return null;
    const counts: Record<string, number> = {};
    recent.forEach(entry => {
      (entry.moods || []).forEach((m: string) => {
        counts[m] = (counts[m] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([mood]) => mood).join(', ');
  })();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const context = {
          moodHistory: (profile.moodHistory || []).slice(-14),
          dailyCheckinState: profile.dailyCheckinState || null,
          recentJournals: (profile.journalEntries || []).slice(-5).map((e: any) => e.content),
        };
        const { data, error } = await supabase.functions.invoke('health-insights', {
          body: { context },
        });
        if (error) throw error;
        setInsights(data?.insights || []);
      } catch (e) {
        console.error('Failed to fetch health insights:', e);
        setInsights(['Take a moment to check in with your body today. Even a few deep breaths can shift your energy.']);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate('/alignment')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Reflect</span>
          </button>
          <ProfileButton />
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title">
          Health
        </motion.h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Health Data Cards */}
        <div className="grid grid-cols-2 gap-3">
          {healthCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="glass-card rounded-2xl p-4 flex flex-col items-center text-center gap-2"
            >
              <img src={card.icon} alt={card.label} className="w-8 h-8 object-contain clay-icon" />
              <span className="text-sm font-medium text-foreground">{card.label}</span>
              <span className="text-xs text-muted-foreground">
                {card.key === 'mood' && moodSummary ? moodSummary : 'Not tracked yet'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Ubi Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-3">
            <img src={crystalBallIcon} alt="Ubi" className="w-6 h-6 object-contain clay-icon" />
            <h2 className="section-title">Ubi Insights</h2>
          </div>
          <div className="space-y-3">
            {loadingInsights ? (
              <>
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </>
            ) : (
              insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
