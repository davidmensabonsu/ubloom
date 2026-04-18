import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Pen, Mic } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import MoodCalendar from '@/components/alignment/MoodCalendar';
import JournalModes from '@/components/alignment/JournalModes';
import WeeklySummaryCard from '@/components/alignment/WeeklySummaryCard';
import heartPulseIcon from '@/assets/icons/heart-pulse.png';
import { getCurrentCycleDay, getCurrentPhase } from '@/lib/cycleUtils';
import { computeBloomScore } from '@/lib/bloomScore';

export default function Alignment() {
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const totalHabits = (profile.coreHabits || []).length;

  // Cycle day + phase (shared util)
  const { cycleDay, cyclePhase } = useMemo(() => {
    const c = profile.cycleData;
    if (!c?.setupComplete || !c.lastPeriodStart) return { cycleDay: null as number | null, cyclePhase: null as string | null };
    try {
      const d = getCurrentCycleDay(c.lastPeriodStart, c.cycleLength);
      return { cycleDay: d, cyclePhase: getCurrentPhase(d, c.periodLength, c.cycleLength) };
    } catch {
      return { cycleDay: null, cyclePhase: null };
    }
  }, [profile.cycleData]);

  // Bloom score — recalculate on page load
  const bloom = useMemo(() => computeBloomScore(profile, totalHabits), [profile, totalHabits]);

  useEffect(() => {
    if (profile.bloomScore !== bloom.total) {
      updateProfile({ bloomScore: bloom.total });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloom.total]);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // Previous entries — last 5
  const recentEntries = (profile.journalEntries || []).slice(0, 5);

  const formatEntryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Hero */}
      <div className="hero-gradient px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-1">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/85">
            {todayFormatted}
          </motion.p>
          <ProfileButton />
        </div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title text-white">
          Daily Reflect
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-sm text-white/85">A quiet moment before your day unfolds</p>
        </motion.div>
      </div>

      <div className="px-5 space-y-6 pt-6">
        {/* Health shortcut card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/health')}
          className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 text-left hover:shadow-md transition-shadow"
        >
          <img src={heartPulseIcon} alt="Health" className="w-8 h-8 object-contain shrink-0 clay-icon" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Health</p>
            <p className="text-xs text-muted-foreground truncate">
              {cycleDay != null && cyclePhase
                ? `Day ${cycleDay} · ${cyclePhase} · Bloom Score ${bloom.total}`
                : `Bloom Score ${bloom.total}`}
            </p>
          </div>
          <span className="text-xs font-medium text-primary shrink-0">View insights →</span>
        </motion.button>

        {/* Journal section */}
        <div>
          <div className="section-label mb-3">Your Journal</div>
          <JournalModes />

          {/* Previous entries */}
          {recentEntries.length > 0 && (
            <div className="mt-5">
              <div className="section-label mb-3">Previous entries</div>
              <div className="space-y-2">
                {recentEntries.map((entry, i) => {
                  const isVoice = entry.content.startsWith('🎙️');
                  const Icon = isVoice ? Mic : Pen;
                  // Strip leading voice marker line for the preview
                  const previewSource = isVoice
                    ? entry.content.replace(/^🎙️[^\n]*\n?/, '').replace(/^Prompt:[^\n]*\n?/, '').trim() || 'Voice memo'
                    : entry.content;
                  const preview = previewSource.slice(0, 80) + (previewSource.length > 80 ? '…' : '');
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-2xl p-3 flex items-start gap-3"
                    >
                      <Icon size={14} className="text-primary mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary">{formatEntryDate(entry.date)}</p>
                        <p className="text-sm text-foreground/85 leading-snug mt-0.5 line-clamp-2">
                          {preview}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mood calendar */}
        <div>
          <div className="section-label mb-3">Your mood this month</div>
          <MoodCalendar moodHistory={profile.moodHistory} profile={profile} />
        </div>

        {/* Weekly summary */}
        <div>
          <div className="section-label mb-3">Ubi's weekly summary</div>
          <WeeklySummaryCard />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
