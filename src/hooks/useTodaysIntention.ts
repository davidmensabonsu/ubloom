import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentCycleDay, getCurrentPhase, type CyclePhase } from '@/lib/cycleUtils';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const FALLBACK = 'Choose one small thing today that moves you closer to who you want to be.';

async function streamIntention(prompt: string): Promise<string> {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      userContext: null,
      chatHistory: '',
    }),
  });

  if (!resp.ok || !resp.body) throw new Error(`Intention generation failed: ${resp.status}`);

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  const consumeLine = (line: string) => {
    if (line.endsWith('\r')) line = line.slice(0, -1);
    if (line.startsWith(':') || line.trim() === '') return;
    if (!line.startsWith('data: ')) return;
    const jsonStr = line.slice(6).trim();
    if (jsonStr === '[DONE]') return;
    try {
      const parsed = JSON.parse(jsonStr);
      const content = parsed.choices?.[0]?.delta?.content as string | undefined;
      if (content) full += content;
    } catch {/* ignore */}
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      consumeLine(line);
    }
  }
  if (buffer.trim()) buffer.split('\n').forEach(consumeLine);

  // Strip any prompts marker, quotes, and trailing punctuation noise
  return full.replace(/<!--PROMPTS:.*?-->/s, '').replace(/^["'""]|["'""]$/g, '').trim();
}

export function useTodaysIntention() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const todayKey = getLocalDateStr();

  const cached = profile.cachedFocusToday;
  const isFresh = cached?.dateKey === todayKey && !!cached?.message;

  const [intention, setIntention] = useState<string>(isFresh ? cached!.message : '');
  const [loading, setLoading] = useState<boolean>(!isFresh);

  useEffect(() => {
    if (isFresh) {
      setIntention(cached!.message);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Compute cycle phase if available
        let cyclePhase: CyclePhase | null = null;
        if (profile.cycleData?.setupComplete && profile.cycleData.lastPeriodStart) {
          const day = getCurrentCycleDay(profile.cycleData.lastPeriodStart, profile.cycleData.cycleLength);
          cyclePhase = getCurrentPhase(day, profile.cycleData.periodLength, profile.cycleData.cycleLength);
        }

        // Top 3 ubi memories
        let topMemories: string[] = [];
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await (supabase as any)
              .from('ubi_memory')
              .select('memory_type, content')
              .eq('user_id', user.id)
              .order('importance', { ascending: false })
              .limit(3);
            topMemories = (data || []).map((m: any) => `[${m.memory_type}] ${m.content}`);
          }
        } catch {/* non-fatal */}

        const context = {
          preferredName: profile.preferredName || null,
          dailyCheckinState: profile.dailyCheckinState || null,
          cyclePhase,
          topMemories,
        };

        const prompt = `Based on this user's current state, write a single powerful intention for today. It should be one sentence, maximum 15 words, written in second person, actionable and specific to their cycle phase and mood. Return only the sentence, nothing else.\n\nContext:\n${JSON.stringify(context)}`;

        const result = await streamIntention(prompt);
        if (cancelled) return;

        const final = result || FALLBACK;
        setIntention(final);
        updateProfile({ cachedFocusToday: { message: final, dateKey: todayKey } });
      } catch (e) {
        if (cancelled) return;
        console.error('Intention generation failed:', e);
        setIntention(cached?.message || FALLBACK);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  return { intention, loading };
}
