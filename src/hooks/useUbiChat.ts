import { useState, useCallback, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';

export interface UbiMessage {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const MAX_MESSAGES = 50;

function buildUserContext(profile: ReturnType<typeof useUserStore.getState>['profile']) {
  const today = getLocalDateStr();

  // Recent moods (last 14 days)
  const recentMoods = (profile.moodHistory || []).slice(0, 14).map((m) => ({
    date: m.date,
    moods: m.moods,
  }));

  // Habit completion rate (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return getLocalDateStr(d);
  });
  const totalHabits = (profile.coreHabits || []).length * 7;
  const completedHabits = (profile.habitCompletions || []).filter(
    (c) => last7.includes(c.date) && c.completed
  ).length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Recent journal themes
  const recentJournal = (profile.journalEntries || []).slice(0, 5).map((j) => j.content.slice(0, 200));

  // Today's mood
  const todayMood = (profile.moodHistory || []).find((m) =>
    m.date.startsWith(today)
  );

  return {
    currentFeeling: profile.currentFeeling,
    struggles: profile.struggles,
    wantsMoreOf: profile.wantsMoreOf,
    dreamSelfFeels: profile.dreamSelfFeels,
    identityStatement: profile.identityStatement,
    futureNote: profile.futureNote,
    dreamSelf: profile.dreamSelf,
    recentMoods,
    todayMood: todayMood?.moods || [],
    habitCompletionRate: `${habitCompletionRate}%`,
    coreHabits: (profile.coreHabits || []).map((h) => h.title),
    recentJournalSnippets: recentJournal,
    lastMoodCheckinDate: profile.lastMoodCheckinDate,
  };
}

export function useUbiChat() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [messages, setMessages] = useState<UbiMessage[]>(
    () => (profile as any).ubiMessages || []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const persistMessages = useCallback(
    (msgs: UbiMessage[]) => {
      const pruned = msgs.slice(-MAX_MESSAGES);
      updateProfile({ ubiMessages: pruned } as any);
    },
    [updateProfile]
  );

  const sendMessage = useCallback(
    async (input: string, options?: { hideUserMessage?: boolean }) => {
      const userMsg: UbiMessage = { role: 'user', content: input };
      const apiMessages = [...messages, userMsg];
      // If hideUserMessage, don't show the user bubble (used for welcome prompt)
      const displayMessages = options?.hideUserMessage ? [...messages] : apiMessages;
      setMessages(displayMessages);
      setIsStreaming(true);

      const userContext = buildUserContext(profile);
      const controller = new AbortController();
      abortRef.current = controller;

      let assistantSoFar = '';

      try {
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages.map((m) => ({ role: m.role, content: m.content })),
            userContext,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Something went wrong' }));
          const errorMsg: UbiMessage = { role: 'assistant', content: err.error || 'Something went wrong. Try again in a moment.' };
          const final = [...displayMessages, errorMsg];
          setMessages(final);
          persistMessages(final);
          setIsStreaming(false);
          return;
        }

        if (!resp.body) throw new Error('No response body');
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const upsert = (chunk: string) => {
          assistantSoFar += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
              );
            }
            return [...prev, { role: 'assistant', content: assistantSoFar }];
          });
        };

        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '') continue;
            if (!line.startsWith('data: ')) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsert(content);
            } catch {
              buffer = line + '\n' + buffer;
              break;
            }
          }
        }

        // Flush remaining
        if (buffer.trim()) {
          for (let raw of buffer.split('\n')) {
            if (!raw) continue;
            if (raw.endsWith('\r')) raw = raw.slice(0, -1);
            if (raw.startsWith(':') || raw.trim() === '') continue;
            if (!raw.startsWith('data: ')) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) upsert(content);
            } catch { /* ignore */ }
          }
        }

        // Persist final
        setMessages((prev) => {
          persistMessages(prev);
          return prev;
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Ubi chat error:', e);
          const errorMsg: UbiMessage = { role: 'assistant', content: "I couldn't connect right now. Try again in a moment 💛" };
          const final = [...newMessages, errorMsg];
          setMessages(final);
          persistMessages(final);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, profile, persistMessages]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    persistMessages([]);
  }, [persistMessages]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, clearChat, stopStreaming };
}
