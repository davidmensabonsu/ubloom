import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { format, getISOWeek, getISOWeekYear, startOfWeek, endOfWeek } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { computeBloomScore } from '@/lib/bloomScore';
import { getCurrentCycleDay, getCurrentPhase } from '@/lib/cycleUtils';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const PROMPTS_REGEX = /<!--PROMPTS:(.*?)-->/;

const POSITIVE_MOODS = new Set([
  'aligned', 'elevated', 'grounded',
  'calm', 'energized', 'grateful', 'creative', 'peaceful', 'confident', 'joyful', 'hopeful',
]);

function weekKey(d: Date): string {
  const w = getISOWeek(d);
  return `${getISOWeekYear(d)}-W${w.toString().padStart(2, '0')}`;
}

export default function WeeklySummaryCard() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [letter, setLetter] = useState<string>(profile.cachedWeeklySummary?.letter || '');
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return getLocalDateStr(d);
    });

    // Aligned days — count days where dailyCheckinState was aligned/elevated
    // We only have current dailyCheckinState; approximate by also counting moodHistory entries with aligned/elevated
    const alignedDates = new Set<string>();
    (profile.moodHistory || []).forEach((m) => {
      const d = getLocalDateStr(new Date(m.date));
      if (last7.includes(d) && m.moods.some((x) => x === 'aligned' || x === 'elevated')) {
        alignedDates.add(d);
      }
    });
    if (profile.lastMoodCheckinDate && last7.includes(profile.lastMoodCheckinDate)) {
      if (profile.dailyCheckinState === 'aligned' || profile.dailyCheckinState === 'elevated') {
        alignedDates.add(profile.lastMoodCheckinDate);
      }
    }
    const alignedDays = alignedDates.size;

    // Habit completion this week
    const totalHabits = (profile.coreHabits || []).length;
    const completedThisWeek = (profile.habitCompletions || []).filter(
      (c) => c.completed && last7.includes(c.date),
    ).length;
    const habitsDoneStr = totalHabits > 0
      ? `${Math.min(completedThisWeek, totalHabits * 7)}/${totalHabits * 7}`
      : '0/0';
    const habitRatePct = totalHabits > 0
      ? Math.min(100, Math.round((completedThisWeek / (totalHabits * 7)) * 100))
      : 0;

    // Positive mood %
    const loggedDays = new Map<string, string[]>();
    (profile.moodHistory || []).forEach((m) => {
      const d = getLocalDateStr(new Date(m.date));
      if (last7.includes(d)) {
        loggedDays.set(d, [...(loggedDays.get(d) || []), ...m.moods]);
      }
    });
    if (profile.lastMoodCheckinDate && last7.includes(profile.lastMoodCheckinDate) && profile.dailyCheckinState) {
      const cur = loggedDays.get(profile.lastMoodCheckinDate) || [];
      loggedDays.set(profile.lastMoodCheckinDate, [...cur, profile.dailyCheckinState]);
    }
    let positive = 0;
    loggedDays.forEach((moods) => {
      if (moods.some((m) => POSITIVE_MOODS.has(m))) positive++;
    });
    const positiveMoodPercent = loggedDays.size > 0 ? Math.round((positive / loggedDays.size) * 100) : 0;

    const range = `${format(start, 'MMM d')}–${format(end, 'd')}`;
    return {
      start, end, range, alignedDays,
      habitsDoneStr, habitRatePct, positiveMoodPercent,
      loggedDayCount: loggedDays.size,
    };
  }, [profile.moodHistory, profile.lastMoodCheckinDate, profile.dailyCheckinState, profile.habitCompletions, profile.coreHabits]);

  const totalHabits = (profile.coreHabits || []).length;
  const bloom = useMemo(() => computeBloomScore(profile, totalHabits), [profile, totalHabits]);

  const cyclePhase = useMemo(() => {
    const c = profile.cycleData;
    if (!c?.setupComplete || !c.lastPeriodStart) return null;
    try {
      const day = getCurrentCycleDay(c.lastPeriodStart, c.cycleLength);
      return getCurrentPhase(day, c.periodLength, c.cycleLength);
    } catch { return null; }
  }, [profile.cycleData]);

  const generate = async () => {
    setLoading(true);
    try {
      const userMsg = `Write a short personal letter to ${profile.preferredName || 'them'} summarising their week. Reference their actual data: ${stats.alignedDays} aligned days, ${stats.habitRatePct}% habit completion, ${stats.positiveMoodPercent}% positive mood, Bloom Score: ${bloom.total}/100, cycle phase: ${cyclePhase || 'unknown'}. Write in Ubi's voice — warm, direct, honest. 3-4 sentences. Reference one specific pattern you noticed. End with one forward-looking encouragement. Return only the letter text.`;

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('no session');
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          userContext: {
            preferredName: profile.preferredName,
            cyclePhase,
            bloomScore: bloom.total,
            stats,
          },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error('weekly letter failed');
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';
      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) full += content;
          } catch { /* ignore */ }
        }
      }
      const cleaned = full.replace(PROMPTS_REGEX, '').trim().replace(/^["']|["']$/g, '');
      if (cleaned) {
        setLetter(cleaned);
        updateProfile({ cachedWeeklySummary: { letter: cleaned, weekKey: weekKey(new Date()) } });
      }
    } catch (e) {
      console.error('Weekly letter generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate weekly
  useEffect(() => {
    const wk = weekKey(new Date());
    const cached = profile.cachedWeeklySummary;
    if (cached?.weekKey === wk && cached.letter) {
      setLetter(cached.letter);
      return;
    }
    // Only generate if we have at least some data
    const hasData = (profile.moodHistory || []).length > 0 || (profile.habitCompletions || []).length > 0;
    if (hasData) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noData = (profile.moodHistory || []).length === 0 && (profile.habitCompletions || []).length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="dark-accent-card p-5"
    >
      <h2 className="font-display text-xl text-white mb-4">
        Your week · {stats.range}
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 text-center">
          <p className="font-display text-2xl text-white leading-none">{stats.alignedDays}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/70 mt-1">Aligned days</p>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 text-center">
          <p className="font-display text-2xl text-white leading-none">{stats.habitsDoneStr}</p>
          <p className="text-[10px] uppercase tracking-wider text-white/70 mt-1">Habits done</p>
        </div>
        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 text-center">
          <p className="font-display text-2xl text-white leading-none">{stats.positiveMoodPercent}%</p>
          <p className="text-[10px] uppercase tracking-wider text-white/70 mt-1">Positive mood</p>
        </div>
      </div>

      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 mb-2">◆ Ubi's letter to you</p>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 rounded bg-white/15 animate-pulse" />
          <div className="h-3 rounded bg-white/15 animate-pulse w-5/6" />
          <div className="h-3 rounded bg-white/15 animate-pulse w-4/6" />
        </div>
      ) : letter ? (
        <p className="font-display italic text-white/95 leading-relaxed">{letter}</p>
      ) : noData ? (
        <p className="font-display italic text-white/70 leading-relaxed">
          Check back at the end of the week — Ubi will have something to say.
        </p>
      ) : (
        <button
          onClick={generate}
          className="text-sm text-white/80 underline underline-offset-2"
        >
          Tap to generate this week's letter
        </button>
      )}
    </motion.div>
  );
}
