import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import { useUserStore, HealthData, HealthHistoryEntry } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalDateStr } from '@/lib/dateUtils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import moonIcon from '@/assets/icons/moon.png';
import bedIcon from '@/assets/icons/bed.png';
import brainIcon from '@/assets/icons/brain.png';
import leafIcon from '@/assets/icons/leaf.png';
import runningIcon from '@/assets/icons/running.png';
import sparklesIcon from '@/assets/icons/sparkles.png';
import crystalBallIcon from '@/assets/icons/crystal-ball.png';
import sunriseIcon from '@/assets/icons/sunrise.png';

const cycleOptions = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal', 'N/A'];

interface CardConfig {
  label: string;
  icon: string;
  key: keyof HealthData | 'mood';
  type: 'cycle' | 'number' | 'scale' | 'mood';
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

const healthCards: CardConfig[] = [
  { label: 'Cycle Phase', icon: moonIcon, key: 'cycle', type: 'cycle' },
  { label: 'Sleep', icon: bedIcon, key: 'sleepHours', type: 'number', unit: 'hrs', placeholder: '7.5', min: 0, max: 24 },
  { label: 'Stress', icon: brainIcon, key: 'stressLevel', type: 'scale', unit: '/10', min: 1, max: 10 },
  { label: 'Recovery', icon: leafIcon, key: 'recoveryLevel', type: 'scale', unit: '/10', min: 1, max: 10 },
  { label: 'Activity', icon: runningIcon, key: 'activityMinutes', type: 'number', unit: 'min', placeholder: '30', min: 0, max: 1440 },
  { label: 'Mood Patterns', icon: sparklesIcon, key: 'mood', type: 'mood' },
];

const trendMetrics = [
  { key: 'sleepHours', label: 'Sleep', color: 'hsl(var(--primary))' },
  { key: 'stressLevel', label: 'Stress', color: 'hsl(var(--destructive, 0 84% 60%))' },
  { key: 'recoveryLevel', label: 'Recovery', color: 'hsl(142 71% 45%)' },
  { key: 'activityMinutes', label: 'Activity', color: 'hsl(217 91% 60%)' },
];

function HealthCard({ card, value, moodSummary, onSave }: {
  card: CardConfig;
  value: string | number | undefined;
  moodSummary: string | null;
  onSave: (key: string, value: string | number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const displayValue = card.key === 'mood'
    ? moodSummary || 'Not tracked yet'
    : value !== undefined
      ? `${value}${card.unit || ''}`
      : 'Not tracked yet';

  const handleTap = () => {
    if (card.type === 'mood') return;
    setInputValue(value !== undefined ? String(value) : '');
    setEditing(true);
  };

  const handleSave = () => {
    if (card.type === 'number' || card.type === 'scale') {
      const num = parseFloat(inputValue);
      if (isNaN(num) || (card.min !== undefined && num < card.min) || (card.max !== undefined && num > card.max)) {
        setEditing(false);
        return;
      }
      onSave(card.key as string, card.type === 'scale' ? Math.round(num) : Math.round(num * 10) / 10);
    }
    setEditing(false);
  };

  const handleCycleSelect = (phase: string) => {
    onSave(card.key as string, phase);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 flex flex-col items-center text-center gap-2 cursor-pointer relative"
      onClick={() => !editing && handleTap()}
    >
      <img src={card.icon} alt={card.label} className="w-8 h-8 object-contain clay-icon" />
      <span className="text-sm font-medium text-foreground">{card.label}</span>

      <AnimatePresence mode="wait">
        {editing && card.type === 'cycle' ? (
          <motion.div
            key="cycle-picker"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-1 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {cycleOptions.map((phase) => (
              <button
                key={phase}
                onClick={() => handleCycleSelect(phase)}
                className="text-xs py-1.5 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors"
              >
                {phase}
              </button>
            ))}
            <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground mt-1">Cancel</button>
          </motion.div>
        ) : editing && (card.type === 'number' || card.type === 'scale') ? (
          <motion.div
            key="number-input"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-1 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              min={card.min}
              max={card.max}
              step={card.type === 'scale' ? 1 : 0.5}
              placeholder={card.placeholder || ''}
              autoFocus
              className="w-full text-center text-sm bg-primary/10 rounded-lg py-1.5 px-2 text-foreground outline-none focus:ring-1 focus:ring-primary/30"
            />
            <button onClick={handleSave} className="p-1 rounded-full bg-primary/20 text-primary">
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} className="p-1 rounded-full bg-muted text-muted-foreground">
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <motion.span
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-xs ${value !== undefined || (card.key === 'mood' && moodSummary) ? 'text-foreground/80' : 'text-muted-foreground'}`}
          >
            {displayValue}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WeeklyTrendsChart({ history }: { history: HealthHistoryEntry[] }) {
  const [activeMetric, setActiveMetric] = useState('sleepHours');

  const chartData = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
    return sorted.map((entry) => ({
      day: new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      value: (entry as any)[activeMetric] ?? null,
    })).filter(d => d.value !== null);
  }, [history, activeMetric]);

  const currentMetric = trendMetrics.find(m => m.key === activeMetric)!;

  if (history.length < 2) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center">
        <p className="text-sm text-muted-foreground">Log health data for at least 2 days to see trends</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-4">
      {/* Metric selector pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {trendMetrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setActiveMetric(metric.key)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              activeMetric === metric.key
                ? 'bg-primary/20 text-primary font-medium'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {chartData.length < 2 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Not enough {currentMetric.label.toLowerCase()} data yet
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={currentMetric.color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: currentMetric.color }}
              activeDot={{ r: 6 }}
              name={currentMetric.label}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Health() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserStore();
  const healthData = profile.healthData || {};
  const healthHistory = profile.healthHistory || [];
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

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

  const handleSaveCard = (key: string, value: string | number) => {
    const today = getLocalDateStr();
    const updatedHealthData = {
      ...healthData,
      [key]: value,
      lastUpdated: new Date().toISOString(),
    };

    // Update or create today's history entry
    const existingHistory = [...healthHistory];
    const todayIdx = existingHistory.findIndex(e => e.date === today);
    const todayEntry: HealthHistoryEntry = todayIdx >= 0
      ? { ...existingHistory[todayIdx], [key]: value }
      : { date: today, [key]: value };

    if (todayIdx >= 0) {
      existingHistory[todayIdx] = todayEntry;
    } else {
      existingHistory.push(todayEntry);
    }

    // Keep only last 90 days
    const pruned = existingHistory.slice(-90);

    updateProfile({
      healthData: updatedHealthData,
      healthHistory: pruned,
    });
  };

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const context = {
          moodHistory: (profile.moodHistory || []).slice(-14),
          dailyCheckinState: profile.dailyCheckinState || null,
          recentJournals: (profile.journalEntries || []).slice(-5).map((e: any) => e.content),
          healthData,
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
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="subtle-text">
          Tap any card to log your data
        </motion.p>
      </div>

      <div className="px-5 space-y-6">
        {/* Health Data Cards */}
        <div className="grid grid-cols-2 gap-3">
          {healthCards.map((card, i) => (
            <HealthCard
              key={card.key}
              card={card}
              value={card.key !== 'mood' ? (healthData as any)[card.key] : undefined}
              moodSummary={moodSummary}
              onSave={handleSaveCard}
            />
          ))}
        </div>

        {/* Weekly Trends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-3">
            <img src={sunriseIcon} alt="Trends" className="w-6 h-6 object-contain clay-icon" />
            <h2 className="section-title">Weekly Trends</h2>
          </div>
          <WeeklyTrendsChart history={healthHistory} />
        </motion.div>

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
