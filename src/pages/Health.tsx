import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Settings, Droplets, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { track } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getCurrentCycleDay, getCurrentPhase, getFormattedNextPeriod } from '@/lib/cycleUtils';
import { differenceInYears } from 'date-fns';
import { getLocalDateStr } from '@/lib/dateUtils';
import { toast } from 'sonner';
import { computeBloomScore } from '@/lib/bloomScore';

import CycleSetup from '@/components/cycle/CycleSetup';
import CycleWheel from '@/components/cycle/CycleWheel';
import CycleInsightCard from '@/components/cycle/CycleInsightCard';
import DeviceConnectionBanner from '@/components/cycle/DeviceConnectionBanner';
import BloomScoreCard from '@/components/cycle/BloomScoreCard';
import BloomScoreSheet from '@/components/alignment/BloomScoreSheet';
import HealthDataTiles from '@/components/cycle/HealthDataTiles';
import UbiInsightsCard from '@/components/cycle/UbiInsightsCard';
import LockedOverlay from '@/components/LockedOverlay';
import { useSubscription } from '@/hooks/useSubscription';

export default function Health() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();
  const { canUse } = useSubscription();
  const cycleData = profile.cycleData;
  const [showSetup, setShowSetup] = useState(false);
  const [showPeriodConfirm, setShowPeriodConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [bloomSheetOpen, setBloomSheetOpen] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const setupComplete = cycleData?.setupComplete === true;

  // Compute cycle info
  const cycleDay = setupComplete ? getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength) : 1;
  const currentPhase = setupComplete ? getCurrentPhase(cycleDay, cycleData.periodLength, cycleData.cycleLength) : 'Follicular' as const;
  const nextPeriod = setupComplete ? getFormattedNextPeriod(cycleData.lastPeriodStart, cycleData.cycleLength) : '';

  // Bloom score
  const totalHabits = (profile.coreHabits || []).length;
  const bloom = useMemo(() => computeBloomScore(profile, totalHabits), [profile, totalHabits]);

  useEffect(() => { track('feature_used', { feature: 'health' }); }, []);

  useEffect(() => {
    if (profile.bloomScore !== bloom.total) {
      updateProfile({ bloomScore: bloom.total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloom.total]);

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
        initialData={cycleData ? { lastPeriodStart: cycleData.lastPeriodStart, cycleLength: cycleData.cycleLength, periodLength: cycleData.periodLength, dateOfBirth: cycleData.dateOfBirth } : undefined}
        onComplete={() => setShowSetup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-background pb-24">
      <div className="hero-gradient px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => navigate('/alignment')} className="flex items-center gap-1 text-white/85 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Reflect</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSetup(true)} className="p-2 rounded-full hover:bg-white/15 transition-colors text-white/85 hover:text-white">
              <Settings size={18} />
            </button>
            <ProfileButton />
          </div>
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title text-white">
          Cycle Tracker
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-sm text-white/85">
          In sync with your rhythm{cycleData?.dateOfBirth ? ` · Age ${differenceInYears(new Date(), new Date(cycleData.dateOfBirth + 'T00:00:00'))}` : ''}
        </motion.p>
      </div>

      <div className="px-5 space-y-6 pt-6">
        {/* Device connection banner */}
        <DeviceConnectionBanner />

        {/* Bloom Score */}
        <div>
          <div className="section-label mb-3">Bloom Score</div>
          <button
            onClick={() => setBloomSheetOpen(true)}
            className="w-full text-left rounded-2xl active:scale-[0.99] transition-transform"
            aria-label="View Bloom Score breakdown"
          >
            <BloomScoreCard score={bloom.total} />
          </button>
        </div>

        <BloomScoreSheet open={bloomSheetOpen} onOpenChange={setBloomSheetOpen} breakdown={bloom} />

        {/* Horizontal scroll data tiles */}
        <HealthDataTiles />

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
                      const history = cycleData.periodHistory || [];
                      const prevStart = cycleData.lastPeriodStart;
                      const daysSinceLast = Math.round((new Date(today).getTime() - new Date(prevStart).getTime()) / (1000 * 60 * 60 * 24));
                      const newEntry = { date: today, cycleLength: daysSinceLast > 0 ? daysSinceLast : undefined };
                      const updatedHistory = [newEntry, ...history].slice(0, 24);

                      // Calculate rolling average from entries with valid cycle lengths
                      const validLengths = updatedHistory.filter(e => e.cycleLength && e.cycleLength > 14 && e.cycleLength < 50).map(e => e.cycleLength!);
                      const newCycleLength = validLengths.length >= 2
                        ? Math.round(validLengths.reduce((a, b) => a + b, 0) / validLengths.length)
                        : cycleData.cycleLength;

                      updateProfile({
                        cycleData: {
                          ...cycleData,
                          lastPeriodStart: today,
                          cycleLength: newCycleLength,
                          periodHistory: updatedHistory,
                        },
                      });
                      setShowPeriodConfirm(false);
                      const msg = newCycleLength !== cycleData.cycleLength
                        ? `Period logged — cycle length updated to ${newCycleLength} days`
                        : 'Period logged — your predictions have been updated';
                      toast.success(msg);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Period History */}
        {(cycleData.periodHistory?.length ?? 0) > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 mb-3 w-full"
            >
              <CalendarDays size={18} className="text-muted-foreground" />
              <h2 className="section-title flex-1 text-left">Period History</h2>
              {showHistory ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {cycleData.periodHistory!.map((entry, i) => {
                    const dateObj = new Date(entry.date + 'T00:00:00');
                    const formatted = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets size={14} className="text-destructive/70" />
                          <span className="text-sm text-foreground">{formatted}</span>
                        </div>
                        {entry.cycleLength && entry.cycleLength > 0 && (
                          <span className="text-xs text-muted-foreground">{entry.cycleLength}-day cycle</span>
                        )}
                      </div>
                    );
                  })}
                  {cycleData.periodHistory!.length >= 2 && (() => {
                    const lengths = cycleData.periodHistory!.filter(e => e.cycleLength && e.cycleLength > 0).map(e => e.cycleLength!);
                    if (lengths.length === 0) return null;
                    const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
                    return (
                      <div className="glass-card rounded-xl px-4 py-3 text-center">
                        <span className="text-xs text-muted-foreground">Average cycle length: </span>
                        <span className="text-sm font-semibold text-foreground">{avg} days</span>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Today's Cycle Insight */}
        <CycleInsightCard phase={currentPhase} />

        {/* Ubi Insights — consolidated */}
        <LockedOverlay locked={!canUse('ubi_insights')} message="Upgrade for personalised health insights">
          <UbiInsightsCard insights={insights} loading={loadingInsights} />
        </LockedOverlay>
      </div>

      <BottomNav />
    </div>
  );
}
