import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { getCurrentCycleDay, getCurrentPhase } from '@/lib/cycleUtils';
import { supabase } from '@/integrations/supabase/client';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const PROMPTS_REGEX = /<!--PROMPTS:(.*?)-->/;

interface JournalPromptResult {
  prompt: string;
  loading: boolean;
  refresh: () => Promise<void>;
  context: { cycleDay: number | null; cyclePhase: string | null; mood: string | null };
}

export function useUbiJournalPrompt(): JournalPromptResult {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [prompt, setPrompt] = useState<string>(profile.cachedJournalPrompt?.prompt || '');
  const [loading, setLoading] = useState(false);

  // Build context once per render — used by UI tags too
  const cycleDay = (() => {
    const c = profile.cycleData;
    if (!c?.setupComplete || !c.lastPeriodStart) return null;
    try { return getCurrentCycleDay(c.lastPeriodStart, c.cycleLength); } catch { return null; }
  })();
  const cyclePhase = (() => {
    const c = profile.cycleData;
    if (!c?.setupComplete || cycleDay == null) return null;
    try { return getCurrentPhase(cycleDay, c.periodLength, c.cycleLength); } catch { return null; }
  })();
  const recentMoods = (profile.moodHistory || []).slice(0, 3).flatMap((m) => m.moods).slice(0, 3);
  const todayMood = profile.dailyCheckinState || recentMoods[0] || null;

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const userMsg = `Based on this user's current cycle phase (${cyclePhase || 'unknown'}, Day ${cycleDay ?? '?'}) and recent mood pattern (${profile.dailyCheckinState || 'no check-in'}, recent moods: ${recentMoods.join(', ') || 'none logged'}), write one journalling prompt for today. It should be a single open question, maximum 20 words, that helps them reflect on something meaningful. Make it specific to their phase and mood — not generic. Return only the question.`;

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
            cyclePhase, cycleDay, dailyCheckinState: profile.dailyCheckinState, recentMoods,
            preferredName: profile.preferredName,
          },
        }),
      });
      if (!resp.ok || !resp.body) throw new Error('prompt fetch failed');

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
        setPrompt(cleaned);
        updateProfile({ cachedJournalPrompt: { prompt: cleaned, dateKey: getLocalDateStr() } });
      }
    } catch (e) {
      console.error('Journal prompt generation failed:', e);
    } finally {
      setLoading(false);
    }
  }, [cyclePhase, cycleDay, profile.dailyCheckinState, profile.preferredName, recentMoods, updateProfile]);

  // Auto-generate once per day
  useEffect(() => {
    const today = getLocalDateStr();
    const cached = profile.cachedJournalPrompt;
    if (cached?.dateKey === today && cached.prompt) {
      setPrompt(cached.prompt);
      return;
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    prompt,
    loading,
    refresh: generate,
    context: { cycleDay, cyclePhase, mood: todayMood },
  };
}
