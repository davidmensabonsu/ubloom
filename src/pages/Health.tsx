import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Droplets, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getCurrentCycleDay, getCurrentPhase, getFormattedNextPeriod } from '@/lib/cycleUtils';
import { getLocalDateStr } from '@/lib/dateUtils';
import { toast } from 'sonner';

import CycleSetup from '@/components/cycle/CycleSetup';
import CycleWheel from '@/components/cycle/CycleWheel';
import CycleInsightCard from '@/components/cycle/CycleInsightCard';
import CycleMoodCard from '@/components/cycle/CycleMoodCard';

import crystalBallIcon from '@/assets/icons/crystal-ball.png';

export default function Health() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();
  const cycleData = profile.cycleData;
  const [showSetup, setShowSetup] = useState(false);
  const [showPeriodConfirm, setShowPeriodConfirm] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const setupComplete = cycleData?.setupComplete === true;

  // Compute cycle info
  const cycleDay = setupComplete ? getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength) : 1;
  const currentPhase = setupComplete ? getCurrentPhase(cycleDay, cycleData.periodLength, cycleData.cycleLength) : 'Follicular' as const;
  const nextPeriod = setupComplete ? getFormattedNextPeriod(cycleData.lastPeriodStart, cycleData.cycleLength) : '';

  useEffect(() => {
    if (!setupComplete) { setLoadingInsights(false); return; }
    const fetchInsights = async () => {
      try {
        const context = {
          moodHistory: (profile.moodHistory || []).slice(-14),
          dailyCheckinState: profile.dailyCheckinState || null,
          recentJournals: (profile.journalEntries || []).slice(-5).map((e: any) => e.content),
          healthData: profile.healthData || {},
          cyclePhase: currentPhase,
          cycleDay,
        };
        const { data, error } = await supabase.functions.invoke('health-insights', { body: { context } });
        if (error) throw error;
        setInsights(data?.insights || []);
      } catch (e) {
        console.error('Failed to fetch cycle insights:', e);
        setInsights(['Listen to your body today — even small acts of care make a difference.']);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchInsights();
  }, [setupComplete]);

  // Show setup if first time or user tapped settings
  if (!setupComplete || showSetup) {
    return (
      <CycleSetup
        initialData={cycleData ? { lastPeriodStart: cycleData.lastPeriodStart, cycleLength: cycleData.cycleLength, periodLength: cycleData.periodLength } : undefined}
        onComplete={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate('/alignment')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Reflect</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSetup(true)} className="p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
              <Settings size={18} />
            </button>
            <ProfileButton />
          </div>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title">
          Cycle Tracker
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="subtle-text">
          In sync with your rhythm
        </motion.p>
      </div>

      <div className="px-5 space-y-6">
        {/* Cycle Wheel */}
        <CycleWheel
          currentDay={cycleDay}
          currentPhase={currentPhase}
          cycleLength={cycleData.cycleLength}
          periodLength={cycleData.periodLength}
          nextPeriod={nextPeriod}
        />

        {/* Log Period Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="flex justify-center">
          {!showPeriodConfirm ? (
            <Button
              variant="outline"
              className="rounded-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowPeriodConfirm(true)}
            >
              <Droplets size={16} />
              Log period start
            </Button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-4 w-full text-center space-y-3"
              >
                <p className="text-sm text-foreground/80">Mark today as the start of your period?</p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowPeriodConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                    onClick={() => {
                      const today = getLocalDateStr();
                      updateProfile({
                        cycleData: { ...cycleData, lastPeriodStart: today },
                      });
                      setShowPeriodConfirm(false);
                      toast.success('Period logged — your predictions have been updated');
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Today's Insight */}
        <CycleInsightCard phase={currentPhase} />

        {/* Mood Card */}
        <CycleMoodCard />

        {/* Ubi Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2 mb-3">
            <img src={crystalBallIcon} alt="Ubi" className="w-6 h-6 object-contain clay-icon" />
            <h2 className="section-title">Ubi Insights</h2>
          </div>
          <div className="space-y-3">
            {loadingInsights ? (
              <>
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </>
            ) : (
              insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
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
