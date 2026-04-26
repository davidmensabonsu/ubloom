import { useState, useCallback, useRef, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import { getCurrentCycleDay, getCurrentPhase } from '@/lib/cycleUtils';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/hooks/useAnalytics';

export interface UbiMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  rating?: 'up' | 'down' | null;
}

export interface UbiConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  preview?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`;
const MAX_MESSAGES = 50;
const PROMPTS_REGEX = /<!--PROMPTS:(.*?)-->/;

async function buildUserContext(
  profile: ReturnType<typeof useUserStore.getState>['profile'],
  userId: string | null,
) {
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

  // Fetch top 15 most important memories Ubi has stored about this user
  let ubiMemories: string[] = [];
  if (userId) {
    try {
      const { data: memories } = await (supabase as any)
        .from('ubi_memory')
        .select('memory_type, content, importance, created_at')
        .eq('user_id', userId)
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(15);
      ubiMemories = (memories || []).map((m: any) => `[${m.memory_type}] ${m.content}`);
    } catch (e) {
      console.error('Failed to fetch ubi memories:', e);
    }
  }

  // Compute cycle phase + day using the SAME util the rest of the app uses,
  // so Ubi's opener never disagrees with the on-screen context pill.
  let cyclePhase: string | null = null;
  let cycleDay: number | null = null;
  const c = profile.cycleData;
  if (c?.setupComplete && c.lastPeriodStart && c.cycleLength && c.periodLength) {
    try {
      cycleDay = getCurrentCycleDay(c.lastPeriodStart, c.cycleLength);
      cyclePhase = getCurrentPhase(cycleDay, c.periodLength, c.cycleLength);
    } catch (e) {
      console.error('Failed to compute cycle phase for Ubi context:', e);
    }
  }

  return {
    currentFeeling: profile.currentFeeling,
    struggles: profile.struggles,
    reactionStyle: profile.reactionStyle,
    interests: profile.interests,
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
    dailyCheckinState: profile.dailyCheckinState,
    // Ubi onboarding context
    preferredName: profile.preferredName,
    lifeStage: profile.lifeStage,
    primaryFocusArea: profile.primaryFocusArea,
    communicationTone: profile.communicationTone,
    neverForget: profile.neverForget,
    ubiSummary: profile.ubiSummary,
    cycleData: profile.cycleData,
    cyclePhase,
    cycleDay,
    ubiMemories,
  };
}

async function extractAndSaveMemories(params: {
  userId: string;
  conversationId: string;
  messages: UbiMessage[];
}) {
  try {
    const userMessageCount = params.messages.filter((m) => m.role === 'user').length;
    if (userMessageCount < 2) return;

    const last10 = params.messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-memory-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: last10,
        userId: params.userId,
        conversationId: params.conversationId,
      }),
    });

    if (!resp.ok) return;
    const data = await resp.json();
    const memories = Array.isArray(data?.memories) ? data.memories : [];
    if (memories.length === 0) return;

    const rows = memories.map((m: any) => ({
      user_id: params.userId,
      memory_type: m.type,
      content: m.content,
      importance: m.importance ?? 5,
      source_conversation_id: params.conversationId,
    }));
    await (supabase as any).from('ubi_memory').insert(rows);
  } catch (e) {
    console.error('Memory extraction failed (non-fatal):', e);
  }
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

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export function useUbiChat() {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [messages, setMessages] = useState<UbiMessage[]>([]);
  const [conversations, setConversations] = useState<UbiConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const usedPromptsRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const migrationDoneRef = useRef(false);

  // Load conversations on mount + migrate old data
  useEffect(() => {
    (async () => {
      const userId = await getCurrentUserId();
      if (!userId) { setIsLoading(false); return; }

      // Load conversations
      const { data: convos } = await (supabase as any)
        .from('ubi_conversations')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (convos && convos.length > 0) {
        // Get preview for each (last message)
        const withPreviews: UbiConversation[] = await Promise.all(
          convos.map(async (c: any) => {
            const { data: lastMsg } = await (supabase as any)
              .from('ubi_messages')
              .select('content')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: false })
              .limit(1);
            return {
              ...c,
              preview: lastMsg?.[0]?.content?.slice(0, 80) || '',
            };
          })
        );
        setConversations(withPreviews);

        // Don't auto-load latest — always start with a fresh chat
      } else if (!migrationDoneRef.current) {
        // Migrate old messages if any
        migrationDoneRef.current = true;
        const oldMessages = (profile as any).ubiMessages as UbiMessage[] | undefined;
        if (oldMessages && oldMessages.length > 0) {
          const { data: newConvo } = await (supabase as any)
            .from('ubi_conversations')
            .insert({ user_id: userId, title: generateTitle(oldMessages) })
            .select('id')
            .single();

          if (newConvo) {
            const rows = oldMessages.map((m) => ({
              conversation_id: newConvo.id,
              user_id: userId,
              role: m.role,
              content: m.content,
              rating: m.rating || null,
            }));
            await (supabase as any).from('ubi_messages').insert(rows);
            setCurrentConversationId(newConvo.id);
            setMessages(oldMessages);
            setConversations([{
              id: newConvo.id,
              title: generateTitle(oldMessages),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              preview: oldMessages[oldMessages.length - 1]?.content?.slice(0, 80) || '',
            }]);
            // Clear legacy local array so it stops syncing to user_data.data
            updateProfile({ ubiMessages: [] });
          }
        }
      }
      setIsLoading(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMessagesForConversation(convoId: string) {
    const { data } = await (supabase as any)
      .from('ubi_messages')
      .select('id, role, content, rating, created_at')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        rating: m.rating,
      })));
    } else {
      setMessages([]);
    }
  }

  function generateTitle(msgs: UbiMessage[]): string {
    const firstUser = msgs.find((m) => m.role === 'user');
    if (firstUser) return firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '…' : '');
    return 'New chat';
  }

  const loadConversation = useCallback(async (convoId: string) => {
    setCurrentConversationId(convoId);
    setSuggestedPrompts([]);
    usedPromptsRef.current.clear();
    await loadMessagesForConversation(convoId);
  }, []);

  const refreshConversations = useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) return;
    const { data: convos } = await (supabase as any)
      .from('ubi_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (convos) {
      const withPreviews: UbiConversation[] = await Promise.all(
        convos.map(async (c: any) => {
          const { data: lastMsg } = await (supabase as any)
            .from('ubi_messages')
            .select('content')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1);
          return { ...c, preview: lastMsg?.[0]?.content?.slice(0, 80) || '' };
        })
      );
      setConversations(withPreviews);
    }
  }, []);

  const startNewChat = useCallback(async () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSuggestedPrompts([]);
    usedPromptsRef.current.clear();
  }, []);

  const deleteConversation = useCallback(async (convoId: string) => {
    await (supabase as any).from('ubi_conversations').delete().eq('id', convoId);
    setConversations((prev) => prev.filter((c) => c.id !== convoId));
    if (currentConversationId === convoId) {
      setMessages([]);
      setCurrentConversationId(null);
      setSuggestedPrompts([]);
    }
  }, [currentConversationId]);

  const buildChatHistorySummary = useCallback((): string => {
    if (conversations.length === 0) return '';
    return conversations.slice(0, 10).map((c) =>
      `- "${c.title}" (${new Date(c.updated_at).toLocaleDateString()}): ${c.preview || 'No preview'}`
    ).join('\n');
  }, [conversations]);

  const sendMessage = useCallback(
    async (input: string, options?: { hideUserMessage?: boolean }) => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      // Create conversation if needed
      let convoId = currentConversationId;
      if (!convoId) {
        const title = options?.hideUserMessage ? 'New chat' : input.slice(0, 40) + (input.length > 40 ? '…' : '');
        const { data: newConvo } = await (supabase as any)
          .from('ubi_conversations')
          .insert({ user_id: userId, title })
          .select('id, title, created_at, updated_at')
          .single();
        if (!newConvo) return;
        convoId = newConvo.id;
        setCurrentConversationId(convoId);
        setConversations((prev) => [{ ...newConvo, preview: '' }, ...prev]);
      }

      const userMsg: UbiMessage = { role: 'user', content: input };
      track('ubi_message_sent', { conversationId: convoId, source: 'ubi_chat' });

      // Insert user message into DB
      if (!options?.hideUserMessage) {
        await (supabase as any).from('ubi_messages').insert({
          conversation_id: convoId,
          user_id: userId,
          role: 'user',
          content: input,
        });
      }

      const apiMessages = [...messages, userMsg];
      const displayMessages = options?.hideUserMessage ? [...messages] : apiMessages;
      setMessages(displayMessages);
      setIsStreaming(true);
      setSuggestedPrompts([]);

      const userContext = await buildUserContext(profile, userId);
      const chatHistory = buildChatHistorySummary();
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
            chatHistory,
          }),
          signal: controller.signal,
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Something went wrong' }));
          const errorMsg: UbiMessage = { role: 'assistant', content: err.error || 'Something went wrong. Try again in a moment.' };
          const final = [...displayMessages, errorMsg];
          setMessages(final);
          setIsStreaming(false);
          return;
        }

        if (!resp.body) throw new Error('No response body');
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const upsert = (chunk: string) => {
          assistantSoFar += chunk;
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
            if (jsonStr === '[DONE]') { streamDone = true; break; }

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

        // Extract prompts
        const { cleanContent, prompts } = extractPrompts(assistantSoFar);
        const filtered = prompts.filter(p => !usedPromptsRef.current.has(p));
        if (filtered.length > 0) setSuggestedPrompts(filtered);

        // Save assistant message to DB
        await (supabase as any).from('ubi_messages').insert({
          conversation_id: convoId,
          user_id: userId,
          role: 'assistant',
          content: cleanContent,
        });

        // Fire-and-forget memory extraction (silent background task)
        const assistantMsg: UbiMessage = { role: 'assistant', content: cleanContent };
        const fullThread = [...apiMessages, assistantMsg];
        void extractAndSaveMemories({
          userId,
          conversationId: convoId,
          messages: fullThread,
        });
        await (supabase as any).from('ubi_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convoId);

        // Auto-title on first assistant response if title is 'New chat'
        const convo = conversations.find(c => c.id === convoId);
        if (convo?.title === 'New chat' && !options?.hideUserMessage) {
          const firstUser = messages.find(m => m.role === 'user') || userMsg;
          const newTitle = firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? '…' : '');
          await (supabase as any).from('ubi_conversations').update({ title: newTitle }).eq('id', convoId);
          setConversations(prev => prev.map(c => c.id === convoId ? { ...c, title: newTitle } : c));
        }

        // Update display with clean content
        setMessages((prev) => {
          return prev.map((m, i) =>
            i === prev.length - 1 && m.role === 'assistant' ? { ...m, content: cleanContent } : m
          );
        });

        // Update conversation preview
        setConversations(prev => prev.map(c =>
          c.id === convoId ? { ...c, preview: cleanContent.slice(0, 80), updated_at: new Date().toISOString() } : c
        ));
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error('Ubi chat error:', e);
          const errorMsg: UbiMessage = { role: 'assistant', content: "I couldn't connect right now. Try again in a moment 💛" };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, profile, currentConversationId, conversations, buildChatHistorySummary]
  );

  const clearChat = useCallback(async () => {
    await startNewChat();
  }, [startNewChat]);

  const markPromptUsed = useCallback((prompt: string) => {
    usedPromptsRef.current.add(prompt);
    setSuggestedPrompts(prev => prev.filter(p => p !== prompt));
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const rateMessage = useCallback(
    async (index: number, rating: 'up' | 'down') => {
      setMessages((prev) => {
        return prev.map((m, i) =>
          i === index ? { ...m, rating: m.rating === rating ? null : rating } : m
        );
      });

      const msg = messages[index];
      if (!msg || msg.role !== 'assistant') return;

      const isUnrating = msg.rating === rating;
      const userId = await getCurrentUserId();
      if (!userId) return;

      // Update in ubi_messages table if we have the id
      if (msg.id) {
        await (supabase as any).from('ubi_messages')
          .update({ rating: isUnrating ? null : rating })
          .eq('id', msg.id);
      }

      // Also persist to ubi_ratings for analytics
      if (isUnrating) {
        await (supabase as any).from('ubi_ratings')
          .delete()
          .eq('user_id', userId)
          .eq('message_content', msg.content);
      } else {
        let context: string | null = null;
        for (let i = index - 1; i >= 0; i--) {
          if (messages[i].role === 'user') { context = messages[i].content; break; }
        }
        await (supabase as any).from('ubi_ratings')
          .delete()
          .eq('user_id', userId)
          .eq('message_content', msg.content);
        await (supabase as any).from('ubi_ratings')
          .insert({
            user_id: userId,
            message_content: msg.content,
            rating,
            conversation_context: context,
          });
      }
    },
    [messages]
  );

  return {
    messages,
    isStreaming,
    isLoading,
    sendMessage,
    clearChat,
    stopStreaming,
    rateMessage,
    suggestedPrompts,
    markPromptUsed,
    conversations,
    currentConversationId,
    loadConversation,
    startNewChat,
    deleteConversation,
    refreshConversations,
  };
}
