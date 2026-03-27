import { useState, useCallback, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { supabase } from '@/integrations/supabase/client';

export interface UbiMessage {
  role: 'user' | 'assistant';
  content: string;
  rating?: 'up' | 'down' | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const MAX_MESSAGES = 50;
const PROMPTS_REGEX = /<!--PROMPTS:(.*?)-->/;

function buildUserContext(profile: ReturnType<typeof useUserStore.getState>['profile']) {
  const today = getLocalDateStr();
  const recentMoods = (profile.moodHistory || []).slice(0, 14).map((m) => ({
    date: m.date,
    moods: m.moods,
  }));
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
  const recentJournal = (profile.journalEntries || []).slice(0, 5).map((j) => j.content.slice(0, 200));
  const todayMood = (profile.moodHistory || []).find((m) => m.date.startsWith(today));

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

function extractPrompts(content: string): { cleanContent: string; prompts: string[] } {
  const match = content.match(PROMPTS_REGEX);
  if (!match) return { cleanContent: content, prompts: [] };
  try {
    const prompts = JSON.parse(match[1]);
    const cleanContent = content.replace(PROMPTS_REGEX, '').trimEnd();
    return { cleanContent, prompts: Array.isArray(prompts) ? prompts.filter((p: any) => typeof p === 'string') : [] };
  } catch {
    return { cleanContent: content.replace(PROMPTS_REGEX, '').trimEnd(), prompts: [] };
  }
}

export function useUbiChat() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [messages, setMessages] = useState<UbiMessage[]>(
    () => (profile as any).ubiMessages || []
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const usedPromptsRef = useRef<Set<string>>(new Set());
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
      const displayMessages = options?.hideUserMessage ? [...messages] : apiMessages;
      setMessages(displayMessages);
      setIsStreaming(true);
      setSuggestedPrompts([]);

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
          // Strip prompts block from display but don't extract yet (still streaming)
          const displayContent = assistantSoFar.replace(PROMPTS_REGEX, '').trimEnd();
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: displayContent } : m
              );
            }
            return [...prev, { role: 'assistant', content: displayContent }];
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

        // Extract prompts from final content
        const { cleanContent, prompts } = extractPrompts(assistantSoFar);
        if (prompts.length > 0) {
          setSuggestedPrompts(prompts);
        }

        // Persist with clean content
        setMessages((prev) => {
          const cleaned = prev.map((m, i) =>
            i === prev.length - 1 && m.role === 'assistant' ? { ...m, content: cleanContent } : m
          );
          persistMessages(cleaned);
          return cleaned;
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Ubi chat error:', e);
          const errorMsg: UbiMessage = { role: 'assistant', content: "I couldn't connect right now. Try again in a moment 💛" };
          const final = [...displayMessages, errorMsg];
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
    setSuggestedPrompts([]);
    persistMessages([]);
  }, [persistMessages]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const rateMessage = useCallback(
    async (index: number, rating: 'up' | 'down') => {
      setMessages((prev) => {
        const updated = prev.map((m, i) =>
          i === index ? { ...m, rating: m.rating === rating ? null : rating } : m
        );
        persistMessages(updated);
        return updated;
      });

      // Persist to database
      const msg = messages[index];
      if (!msg || msg.role !== 'assistant') return;

      const isUnrating = msg.rating === rating;
      const messageContent = msg.content;

      // Find preceding user message for context
      let context: string | null = null;
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          context = messages[i].content;
          break;
        }
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (isUnrating) {
          await (supabase as any).from('ubi_ratings')
            .delete()
            .eq('user_id', user.id)
            .eq('message_content', messageContent);
        } else {
          // Delete any existing rating for this message, then insert new one
          await (supabase as any).from('ubi_ratings')
            .delete()
            .eq('user_id', user.id)
            .eq('message_content', messageContent);

          await (supabase as any).from('ubi_ratings')
            .insert({
              user_id: user.id,
              message_content: messageContent,
              rating,
              conversation_context: context,
            });
        }
      } catch (e) {
        console.error('Failed to persist rating:', e);
      }
    },
    [messages, persistMessages]
  );

  return { messages, isStreaming, sendMessage, clearChat, stopStreaming, rateMessage, suggestedPrompts };
}
