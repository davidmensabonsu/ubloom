import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Square, Plus, History, ThumbsUp, ThumbsDown, ArrowLeft, X, Search, MessageCircle, Lock, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUbiChat, UbiMessage, UbiConversation } from '@/hooks/useUbiChat';
import { useUserStore } from '@/stores/userStore';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { getLocalDateStr } from '@/lib/dateUtils';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/UpgradeModal';
import { parseOptions, parseRoutinePlan, stripPlanMarkers, type PlannedTask, type RoutinePlan } from '@/lib/routinePlanParser';
import { useRoutinePlanner } from '@/hooks/useRoutinePlanner';
import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
import ubiAvatar from '@/assets/ubi-avatar-bloom.png';
import speechBubbleIcon from '@/assets/icons/speech-bubble.png';
import ubloomFlower from '@/assets/ubloom-flower.png';
import UbiOnboarding from '@/components/ubi/UbiOnboarding';
import PlanPreviewCard from '@/components/ubi/PlanPreviewCard';

import crystalBallIcon from '@/assets/icons/crystal-ball.png';
import sparklesIcon from '@/assets/icons/sparkles.png';
import starIcon from '@/assets/icons/star.png';
import sunriseIcon from '@/assets/icons/sunrise.png';
import heartIcon from '@/assets/icons/heart.png';
import flameIcon from '@/assets/icons/flame.png';
import brainIcon from '@/assets/icons/brain.png';
import butterflyIcon from '@/assets/icons/butterfly.png';

const presetPrompts = [
  { text: "I feel lost — help me find direction", icon: crystalBallIcon },
  { text: "What should I focus on today?", icon: starIcon },
  { text: "Be honest, am I on the right track?", icon: sunriseIcon },
];

const promptIcons = [crystalBallIcon, sparklesIcon, starIcon, sunriseIcon, heartIcon, flameIcon, brainIcon, butterflyIcon];

export default function Ubi() {
  const {
    messages, isStreaming, isLoading, sendMessage, clearChat, stopStreaming,
    rateMessage, suggestedPrompts, markPromptUsed,
    conversations, currentConversationId, loadConversation, startNewChat, deleteConversation
    , loadPreviews
  } = useUbiChat();
  const profile = useUserStore((s) => s.profile);
  const { canUse, ubiMessagesRemaining, incrementUbiMessageCount, isActive, DAILY_UBI_LIMIT } = useSubscription();
  const planner = useRoutinePlanner();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [planConsumed, setPlanConsumed] = useState<Set<string>>(new Set());
  const [duplicatePrompt, setDuplicatePrompt] = useState<{ tasks: PlannedTask[]; duplicateTitles: string[]; markerKey: string } | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  // Forces a re-evaluation of date-keyed UI (like the "Plan today" pill)
  // exactly when the user's local clock rolls over to the next day.
  const [todayKey, setTodayKey] = useState<string>(() => getLocalDateStr());
  useEffect(() => {
    let timeoutId: number | undefined;
    const scheduleMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 1, 0
      );
      const ms = Math.max(1000, nextMidnight.getTime() - now.getTime());
      timeoutId = window.setTimeout(() => {
        setTodayKey(getLocalDateStr());
        scheduleMidnight();
      }, ms);
    };
    const handleVisibility = () => {
      // Catch the case where the device was asleep across midnight.
      const current = getLocalDateStr();
      setTodayKey((prev) => (prev !== current ? current : prev));
    };
    scheduleMidnight();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  // Snapshot of the textarea value at the moment recording starts, so
  // interim transcripts append to (rather than overwrite) what the user
  // had already typed.
  const inputBeforeListenRef = useRef<string>('');
  const {
    isListening,
    isSupported: isVoiceSupported,
    error: voiceError,
    start: startListening,
    stop: stopListening,
  } = useSpeechToText({
    onTranscriptChange: (transcript) => {
      const base = inputBeforeListenRef.current;
      const next = base ? `${base.trimEnd()} ${transcript}` : transcript;
      setInput(next);
      // Resize textarea to match new content
      const el = inputRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 96) + 'px';
      }
    },
  });

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (!canUse('ubi_chat')) return;
    inputBeforeListenRef.current = input;
    startListening();
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const welcomeSent = useRef(false);
  const [openerSent, setOpenerSent] = useState(false);
  const journalHandled = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  const hasMessages = messages.length > 0;
  const conversationActive = hasMessages || !!currentConversationId;

  // Compute the small context pill (cycle phase + check-in state)
  const contextPill = (() => {
    const parts: string[] = [];
    const c = profile.cycleData;
    if (c?.setupComplete && c.lastPeriodStart) {
      try {
        const start = new Date(c.lastPeriodStart + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000);
        const day = ((diffDays % c.cycleLength) + c.cycleLength) % c.cycleLength + 1;
        let phase = 'Luteal';
        const ovulation = Math.round(c.cycleLength / 2);
        if (day <= c.periodLength) phase = 'Menstrual';
        else if (day <= ovulation - 2) phase = 'Follicular';
        else if (day <= ovulation + 1) phase = 'Ovulatory';
        parts.push(`Day ${day}`, phase);
      } catch { /* ignore */ }
    }
    if (profile.dailyCheckinState) {
      const stateLabel = profile.dailyCheckinState
        .replace(/_/g, ' ')
        .toLowerCase();
      parts.push(`Feeling ${stateLabel}`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  })();

  // Auto-send the original onboarding welcome message only once ever
  useEffect(() => {
    if (isLoading) return;
    if (!profile.ubiOnboardingComplete) return;
    if (messages.length === 0 && !currentConversationId && !welcomeSent.current && !isStreaming && !profile.ubiIntroSeen) {
      welcomeSent.current = true;
      updateProfile({ ubiIntroSeen: true });
      const dreamFeels = profile.dreamSelfFeels?.length ? profile.dreamSelfFeels.join(', ') : '';
      const identity = profile.identityStatement || '';
      const name = profile.preferredName || (profile.currentFeeling ? `someone feeling ${profile.currentFeeling}` : '');

      let contextHint = '';
      if (identity) contextHint = `Their identity statement is: "${identity}".`;
      else if (dreamFeels) contextHint = `They want their dream self to feel: ${dreamFeels}.`;

      const greetingHint = profile.preferredName ? `Greet them by their name (${profile.preferredName}).` : '';
      const welcomePrompt = `[SYSTEM: The user just opened the Ubi chat for the first time. Send a warm, personalised welcome. ${greetingHint} Introduce yourself as Ubi — their mentor inside uBloom. Reference their dream self vision if available. Keep it to 2 short paragraphs max. End by inviting them to share what's on their mind. ${contextHint} ${name ? `They described themselves as ${name}.` : ''}]`;

      sendMessage(welcomePrompt, { hideUserMessage: true });
    }
  }, [isLoading, profile.ubiOnboardingComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset opener flag whenever the user starts a new chat or switches conversations
  useEffect(() => {
    setOpenerSent(false);
  }, [currentConversationId]);

  // Auto-send a fresh, ephemeral opener every time a brand new conversation starts
  useEffect(() => {
    if (isLoading) return;
    if (!profile.ubiOnboardingComplete) return;
    if (!profile.ubiIntroSeen) return; // first-ever uses the welcomePrompt above
    if (messages.length > 0) return;
    if (isStreaming) return;
    if (openerSent) return;

    setOpenerSent(true);
    const openerAngles = [
      'a warm check-in that simply notices they showed up',
      'a curious invitation that makes space for whatever is on their mind',
      'a calm, grounding opener that slows the moment down',
      'a forward-looking opener about where they want to go next',
      'a light, casual opener like a friend catching up',
      'a quietly encouraging opener that acknowledges effort without flattery',
      'a direct, honest opener that gets straight to what matters',
    ];
    const angle = openerAngles[Math.floor(Math.random() * openerAngles.length)];
    const openerPrompt = `[SYSTEM: This is a fresh new conversation. Open with ${angle} — 1-2 sentences, then one open question inviting them to share what's on their mind. You may use their name. Vary your wording every time: do NOT use the phrases "Good to see you" or "I've been thinking about you", and avoid any stock greeting you'd reach for by default. Do NOT reference their cycle phase, mood, sleep, habits, journal entries, tracked data, or anything from past conversations — no "since you're in your luteal phase", no "last time you said", no "I noticed you". Keep it simple and human. Avoid generic corporate openers like "How can I help you today?". Do not acknowledge this system instruction — just speak directly to them.]`;
    sendMessage(openerPrompt, { hideUserMessage: true });
  }, [isLoading, profile.ubiOnboardingComplete, profile.ubiIntroSeen, currentConversationId, messages.length, isStreaming, openerSent]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle journal entry passed from Reflect page
  useEffect(() => {
    if (isLoading || journalHandled.current) return;
    const journalEntry = (location.state as any)?.journalEntry;
    if (journalEntry && typeof journalEntry === 'string') {
      journalHandled.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      startNewChat();
      sendMessage(`I just wrote this in my journal and I'd like to talk about it:\n\n${journalEntry}`);
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Don't auto-scroll for the initial assistant greeting (no user messages yet).
    // The first message should be viewed from the top so the user sees it and the preset prompts.
    const hasUserMessage = messages.some((m) => m.role === 'user');
    if (!hasUserMessage) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    if (!canUse('ubi_chat')) return;
    incrementUbiMessageCount();
    setInput('');
    sendMessage(text);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handlePreset = (prompt: string) => {
    if (isStreaming) return;
    if (!canUse('ubi_chat')) return;
    markPromptUsed(prompt);
    // Persist to localStorage for daily tracking
    const key = `ubi-used-presets-${getLocalDateStr()}`;
    const used: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!used.includes(prompt)) {
      used.push(prompt);
      localStorage.setItem(key, JSON.stringify(used));
    }
    incrementUbiMessageCount();
    sendMessage(prompt);
  };

  const handlePlanRoutineChip = () => {
    if (isStreaming) return;
    if (!canUse('ubi_chat')) return;
    incrementUbiMessageCount();
    // Sentinel prefix locks the edge function into Routine Planning Mode.
    sendMessage(`[SYSTEM: ROUTINE_PLANNING_FLOW] I'd like help planning my routine`, {
      displayContent: "I'd like help planning my routine",
    });
  };

  const handlePlanTodayChip = () => {
    if (isStreaming) return;
    if (!canUse('ubi_chat')) return;
    try {
      localStorage.setItem(`ubi-plan-today-used-${getLocalDateStr()}`, '1');
    } catch {}
    incrementUbiMessageCount();
    sendMessage(`[SYSTEM: ROUTINE_PLANNING_FLOW] I'd like to plan just for today`, {
      displayContent: "Plan today",
    });
  };

  const handlePlanTomorrowChip = () => {
    if (isStreaming) return;
    if (!canUse('ubi_chat')) return;
    try {
      localStorage.setItem(`ubi-plan-tomorrow-used-${getLocalDateStr()}`, '1');
    } catch {}
    incrementUbiMessageCount();
    sendMessage(`[SYSTEM: ROUTINE_PLANNING_FLOW] I'd like to plan just for tomorrow`, {
      displayContent: "Plan tomorrow",
    });
  };

  const sendOptionReply = (text: string) => {
    if (isStreaming || !canUse('ubi_chat')) return;
    incrementUbiMessageCount();
    sendMessage(text);
  };

  const approvePlan = (plan: RoutinePlan, markerKey: string) => {
    if (!isActive) {
      setUpgradeOpen(true);
      return;
    }
    // Only the plain "add" flow needs the duplicate prompt — replace/clear
    // are deliberate today-only swaps.
    if (plan.action === 'add') {
      const dupes = planner.findDuplicates(plan.tasks);
      if (dupes.length) {
        setDuplicatePrompt({
          tasks: plan.tasks,
          duplicateTitles: dupes.map((d) => d.existing.title),
          markerKey,
        });
        return;
      }
    }
    applyPlanWithMode(plan, 'keep-both', markerKey);
  };

  const writePlan = (
    tasks: PlannedTask[],
    mode: 'replace' | 'keep-both' | 'skip',
    markerKey: string,
  ) => {
    applyPlanWithMode({ action: 'add', scope: 'ongoing', tasks }, mode, markerKey);
  };

  const applyPlanWithMode = (
    plan: RoutinePlan,
    mode: 'replace' | 'keep-both' | 'skip',
    markerKey: string,
  ) => {
    const cyclePhase = profile.cycleData?.setupComplete ? 'tracked' : null;
    const { added, replaced, cleared } = planner.applyPlan(plan, mode, {
      planType: plan.action,
      cyclePhase,
    });
    setPlanConsumed((prev) => new Set(prev).add(markerKey));
    setDuplicatePrompt(null);
    if (added > 0) {
      try { localStorage.setItem('ubi-has-made-first-plan', '1'); } catch {}
    }
    let msg: string;
    if (plan.action === 'clear_today') {
      msg = `Done — I've cleared today's list${cleared ? ` (${cleared} task${cleared === 1 ? '' : 's'} paused)` : ''}. Your recurring tasks will return tomorrow.`;
    } else if (plan.action === 'replace_today') {
      msg = `Done — today is now set to your new plan (${added} task${added === 1 ? '' : 's'}). Your usual routine returns tomorrow.`;
    } else {
      msg = `Done — I've added ${added} task${added === 1 ? '' : 's'} to your routine${
        replaced ? ` and replaced ${replaced}` : ''
      }. Head over to the Routine page to see everything in place. You can always edit, reorder, or remove anything that doesn't feel right once you see it in action.`;
    }
    setConfirmation(msg);
  };

  const requestChanges = () => {
    sendOptionReply("I'd like to change something about the plan.");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  };

  const handleNewChat = () => {
    startNewChat();
    setOpenerSent(false);
    setHistoryOpen(false);
  };

  const handleSelectConversation = (convoId: string) => {
    loadConversation(convoId);
    setHistoryOpen(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, convoId: string) => {
    e.stopPropagation();
    deleteConversation(convoId);
  };

  // Show onboarding flow first time
  if (!profile.ubiOnboardingComplete) {
    return <UbiOnboarding onComplete={() => { /* state update triggers re-render */ }} />;
  }

  return (
    <div className="min-h-screen gradient-background flex flex-col">
      {/* Hero gradient header */}
      <div className="sticky top-0 z-10 hero-gradient px-4 pt-[max(1.75rem,calc(env(safe-area-inset-top)+0.5rem))] pb-8">
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/25 border border-white/30 shadow-sm backdrop-blur-sm shrink-0">
              <MessageCircle size={28} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-white leading-tight">Ubi</h1>
              <p className="text-xs text-white/80" style={{ fontFamily: 'Jost, sans-serif' }}>Your personal mentor</p>
              {conversationActive && contextPill && (
                <span
                  className="inline-block mt-1.5 bg-white/20 text-white rounded-full px-3 py-1 text-[11px] backdrop-blur-sm"
                  style={{ fontFamily: 'Jost, sans-serif' }}
                >
                  {contextPill}
                </span>
              )}
              {!conversationActive && (
                <p className="font-display italic text-white/70 text-[13px] mt-1.5">Here to know you, not just help you</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Sheet open={historyOpen} onOpenChange={(open) => { setHistoryOpen(open); if (open) loadPreviews?.(); if (!open) setHistorySearch(''); }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/15" title="Chat history">
                  <History size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl flex flex-col">
                <SheetHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                  <SheetTitle className="text-base">Chat History</SheetTitle>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={handleNewChat}>
                    <Plus size={14} />
                    New Chat
                  </Button>
                </SheetHeader>
                <div className="relative mb-2 shrink-0">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-input bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="overflow-y-auto flex-1 min-h-0 -mx-2 pb-4">
                  {(() => {
                    const q = historySearch.toLowerCase().trim();
                    const filtered = q
                      ? conversations.filter(c => c.title.toLowerCase().includes(q) || c.preview?.toLowerCase().includes(q))
                      : conversations;
                    return filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {conversations.length === 0 ? 'No conversations yet' : 'No matches found'}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {filtered.map((convo) => (
                        <div key={convo.id} className="relative overflow-hidden rounded-xl">
                          {/* Delete background */}
                          <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-5 rounded-xl">
                            <Trash2 size={18} className="text-destructive-foreground" />
                          </div>
                          {/* Swipeable foreground */}
                          <motion.div
                            drag="x"
                            dragConstraints={{ left: -120, right: 0 }}
                            dragElastic={0.1}
                            onDragEnd={(_, info) => {
                              if (info.offset.x < -80) {
                                deleteConversation(convo.id);
                              }
                            }}
                            className={`relative z-10 bg-background px-3 py-3 transition-colors hover:bg-secondary/60 cursor-grab active:cursor-grabbing ${
                              convo.id === currentConversationId ? 'bg-secondary/80' : ''
                            }`}
                            onClick={() => handleSelectConversation(convo.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{convo.title}</p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.preview}</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                  {new Date(convo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  );
                  })()}
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="text-white hover:text-white hover:bg-white/15"
              title="New chat"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-[calc(13rem+env(safe-area-inset-bottom,0px))] pt-4">
        <div className="max-w-lg mx-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
                />
                Loading...
              </div>
            </div>
          ) : (
            <>
              {messages.length > 0 && (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isLast = i === messages.length - 1;
                    const shimmer = isStreaming && isLast && msg.role === 'assistant';
                    return (
                      <div key={msg.id || `idx-${i}-${msg.role}`}>
                        <MessageBubble
                          message={{ ...msg, content: msg.role === 'assistant' ? stripPlanMarkers(msg.content) : msg.content }}
                          index={i}
                          onRate={rateMessage}
                          shimmer={shimmer}
                        />
                        {msg.role === 'assistant' && !shimmer && (() => {
                          const markerKey = `${i}:${msg.id || ''}`;
                          const options = parseOptions(msg.content);
                          const plan = parseRoutinePlan(msg.content);
                          if (plan && !planConsumed.has(markerKey)) {
                            const todayStr = getLocalDateStr();
                            // For replace/clear targeting a future date (e.g. tomorrow),
                            // show what currently lives on THAT date so the user can see
                            // exactly what will be wiped.
                            const targetDate =
                              (plan.action === 'replace_today' || plan.action === 'clear_today') &&
                              plan.startsOn && /^\d{4}-\d{2}-\d{2}$/.test(plan.startsOn)
                                ? plan.startsOn
                                : todayStr;
                            const existingTodayTasks = (profile.coreHabits || []).filter((h) =>
                              isHabitScheduledForDate(h, targetDate),
                            );
                            return (
                              <PlanPreviewCard
                                tasks={plan.tasks}
                                action={plan.action}
                                existingTodayTasks={existingTodayTasks}
                                startsOn={plan.startsOn}
                                onApprove={() => approvePlan(plan, markerKey)}
                                onRequestChanges={requestChanges}
                              />
                            );
                          }
                          if (options && isLast) {
                            return (
                              <div className="mt-2 ml-9 flex flex-wrap gap-2 max-w-[85%]">
                                {options.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() => sendOptionReply(opt)}
                                    className="px-3 py-1.5 rounded-full bg-white border border-rose-300/80 text-rose-600 hover:bg-rose-50 text-xs shadow-sm"
                                    style={{ fontFamily: 'Jost, sans-serif' }}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    );
                  })}
                  {isStreaming && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 items-start"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/20 shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
                        <img src={speechBubbleIcon} alt="Ubi" className="w-4 h-4 object-contain clay-icon" />
                      </div>
                      <div className="bg-white border border-primary/20 shadow-soft rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 ubi-bubble-shimmer">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* Duplicate-resolution prompt */}
              {duplicatePrompt && !isStreaming && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full border border-primary/20 shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
                    <img src={speechBubbleIcon} alt="Ubi" className="w-4 h-4 object-contain clay-icon" />
                  </div>
                  <div className="flex flex-col max-w-[85%] gap-2">
                    <div className="bg-white border border-primary/20 shadow-soft rounded-2xl rounded-tl-sm px-4 py-3 text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                      Before I add everything, I noticed you already have <strong>{duplicatePrompt.duplicateTitles.join(', ')}</strong> in your routine. Should I replace those with the new versions, keep both, or skip adding those ones?
                    </div>
                    <Button onClick={() => writePlan(duplicatePrompt.tasks, 'replace', duplicatePrompt.markerKey)} className="rounded-full bg-rose-400 hover:bg-rose-500 text-white">Replace the existing ones</Button>
                    <Button variant="outline" onClick={() => writePlan(duplicatePrompt.tasks, 'keep-both', duplicatePrompt.markerKey)} className="rounded-full border-rose-300 text-rose-500 hover:bg-rose-50">Keep both</Button>
                    <Button variant="outline" onClick={() => writePlan(duplicatePrompt.tasks, 'skip', duplicatePrompt.markerKey)} className="rounded-full border-rose-300 text-rose-500 hover:bg-rose-50">Skip those ones</Button>
                  </div>
                </div>
              )}

              {/* Confirmation after writing tasks */}
              {confirmation && !isStreaming && (
                <div className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full border border-primary/20 shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
                    <img src={speechBubbleIcon} alt="Ubi" className="w-4 h-4 object-contain clay-icon" />
                  </div>
                  <div className="flex flex-col max-w-[85%] gap-2">
                    <div className="bg-white border border-primary/20 shadow-soft rounded-2xl rounded-tl-sm px-4 py-3 text-sm" style={{ fontFamily: 'Jost, sans-serif' }}>
                      {confirmation}
                    </div>
                    <Button onClick={() => navigate('/routine')} className="rounded-full bg-rose-400 hover:bg-rose-500 text-white">Go to Routine →</Button>
                  </div>
                </div>
              )}

              {/* Inline follow-up prompts below last Ubi message — only after the user has engaged */}
              {!isStreaming && suggestedPrompts.length > 0 && messages.some((m) => m.role === 'user') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="overflow-x-auto scrollbar-hide -mx-1 mt-3 mb-4"
                >
                  <div className="flex gap-2 px-1 py-1 w-max">
                    {suggestedPrompts.map((text, i) => (
                      <button
                        key={`${text}-${i}`}
                        onClick={() => handlePreset(text)}
                        className="px-3 py-1.5 rounded-full bg-white border border-primary/30 hover:bg-primary/5 transition-colors whitespace-nowrap shrink-0 text-xs text-foreground/90 shadow-sm"
                        style={{ fontFamily: 'Jost, sans-serif' }}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.length === 0 && !isStreaming && !(profile.ubiOnboardingComplete && profile.ubiIntroSeen) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex flex-col items-center justify-center text-center pt-16 pb-8"
                >
                  <img
                    src={ubloomFlower}
                    alt=""
                    className="w-12 h-12 object-contain mb-4 opacity-90"
                    style={{ filter: 'hue-rotate(0deg)' }}
                  />
                  <p className="font-display italic text-foreground/85 text-lg leading-snug">
                    What's on your mind today?
                  </p>
                  <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'Jost, sans-serif' }}>
                    Your conversations are private and just for you
                  </p>
                </motion.div>
              )}

            </>
          )}
          <div
            ref={bottomRef}
            aria-hidden
            className="h-1"
            style={{ scrollMarginBottom: '12rem' }}
          />
        </div>
      </div>

      {/* Input area with prompts strip */}
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 z-10">
        {/* Initial user-centric preset prompts — shown until the user sends their first real message */}
        {!isStreaming && (() => {
          const hasUserMessage = messages.some((m) => m.role === 'user');
          if (hasUserMessage) return null; // AI suggestions now shown inline in chat after engagement
          // No user messages yet — show presets filtered by today's used list
          const usedToday: string[] = JSON.parse(localStorage.getItem(`ubi-used-presets-${getLocalDateStr()}`) || '[]');
          const filtered = presetPrompts.filter(p => !usedToday.includes(p.text));
          if (filtered.length === 0) return null;
          return (
            <div className="max-w-lg mx-auto px-4 pt-1.5 pb-2">
              <div className="overflow-x-auto scrollbar-hide -mx-1">
                <div className="flex gap-2 px-1 py-1 w-max">
                  {filtered.map((prompt, i) => (
                    <motion.button
                      key={`${prompt.text}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.06 }}
                      onClick={() => handlePreset(prompt.text)}
                      className="px-3 py-1.5 rounded-full bg-white border border-primary/30 hover:bg-primary/5 transition-colors whitespace-nowrap shrink-0 text-xs text-foreground/90 shadow-sm"
                      style={{ fontFamily: 'Jost, sans-serif' }}
                    >
                      {prompt.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic plan preset — "Plan today" before 4pm, "Plan tomorrow" from 4pm */}
        {(() => {
          if (confirmation) return null;
          if (messages.some((m) => m.role === 'user')) return null;
          if (localStorage.getItem('ubi-has-made-first-plan') !== '1') return null;

          const now = new Date();
          const hour = now.getHours();
          const isBefore4pm = hour < 16;

          if (isBefore4pm) {
            if (localStorage.getItem(`ubi-plan-today-used-${todayKey}`) === '1') return null;
            return (
              <div className="max-w-lg mx-auto px-4 pt-1.5 pb-2">
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handlePlanTodayChip}
                  disabled={isStreaming || !canUse('ubi_chat')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-primary/20 hover:border-primary/40 hover:bg-white transition-all text-left shadow-soft disabled:opacity-50"
                >
                  <span className="text-sm text-foreground flex-1" style={{ fontFamily: 'Jost, sans-serif' }}>
                    Plan today
                  </span>
                </motion.button>
              </div>
            );
          }

          // 4pm onwards — show Plan tomorrow
          if (localStorage.getItem(`ubi-plan-tomorrow-used-${todayKey}`) === '1') return null;
          return (
            <div className="max-w-lg mx-auto px-4 pt-1.5 pb-2">
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handlePlanTomorrowChip}
                disabled={isStreaming || !canUse('ubi_chat')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-primary/20 hover:border-primary/40 hover:bg-white transition-all text-left shadow-soft disabled:opacity-50"
              >
                <span className="text-sm text-foreground flex-1" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Plan tomorrow
                </span>
              </motion.button>
            </div>
          );
        })()}

        {/* "Plan my routine" preset — shown at the start of every new chat until the user uses it once */}
        {(() => {
          if (confirmation) return null;
          if (localStorage.getItem('ubi-plan-routine-used') === '1') return null;
          // "Beginning of a new chat" = the user hasn't sent anything yet in this conversation
          if (messages.some((m) => m.role === 'user')) return null;
          return (
            <div className="max-w-lg mx-auto px-4 pt-1.5 pb-2">
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  if (isStreaming || !canUse('ubi_chat')) return;
                  localStorage.setItem('ubi-plan-routine-used', '1');
                  handlePlanRoutineChip();
                }}
                disabled={isStreaming || !canUse('ubi_chat')}
                className="w-full flex items-center justify-center px-4 py-3 rounded-2xl bg-white border border-primary/20 hover:border-primary/40 hover:bg-white transition-all shadow-soft disabled:opacity-50"
              >
                <span className="text-sm text-foreground" style={{ fontFamily: 'Jost, sans-serif' }}>
                  Plan my routine
                </span>

              </motion.button>
            </div>
          );
        })()}


        {/* Ubi limit notice */}
        {!isActive && ubiMessagesRemaining > 0 && messages.length > 0 && (
          <div className="max-w-lg mx-auto px-4 py-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {ubiMessagesRemaining} of {DAILY_UBI_LIMIT} messages left today
            </span>
          </div>
        )}

        {/* Soft upgrade card — once free user is fully blocked from sending */}
        {!isActive && ubiMessagesRemaining === 0 && messages.length > 0 && (
          <div className="max-w-lg mx-auto px-4 pt-2 pb-1">
            <div className="dark-accent-card p-4 text-center">
              <p className="font-display italic text-white text-base leading-snug">
                You've used your {DAILY_UBI_LIMIT} free messages today. Upgrade to Premium for unlimited access to Ubi.
              </p>
              <button
                onClick={() => navigate('/upgrade')}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
              >
                Upgrade to Premium →
              </button>
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                !canUse('ubi_chat')
                  ? 'Daily limit reached — upgrade for unlimited'
                  : isListening
                    ? 'Listening… tap the mic again to stop'
                    : 'Talk to Ubi...'
              }
              rows={1}
              disabled={!canUse('ubi_chat')}
              className="flex-1 resize-none rounded-2xl border border-primary/30 bg-white/80 px-5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 min-h-[44px] max-h-[96px] overflow-y-auto disabled:opacity-50"
              style={{ fontFamily: 'Jost, sans-serif' }}
            />
            {isVoiceSupported && (
              <Button
                size="icon"
                variant="outline"
                onClick={handleMicToggle}
                disabled={!canUse('ubi_chat') || isStreaming}
                title={isListening ? 'Stop recording' : 'Speak your message'}
                aria-label={isListening ? 'Stop recording' : 'Speak your message'}
                aria-pressed={isListening}
                className={`shrink-0 rounded-full h-10 w-10 transition-all ${
                  isListening
                    ? 'bg-rose-500 hover:bg-rose-500 border-rose-500 text-white animate-pulse'
                    : 'border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                <Mic size={16} />
              </Button>
            )}
            {isStreaming ? (
              <Button
                size="icon"
                variant="outline"
                onClick={stopStreaming}
                className="shrink-0 rounded-full h-10 w-10"
              >
                <Square size={16} />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || !canUse('ubi_chat')}
                className={`shrink-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 ${
                  input.trim() && canUse('ubi_chat')
                    ? 'opacity-100 scale-105 shadow-md'
                    : 'opacity-60 scale-100'
                } disabled:bg-primary`}
              >
                <Send size={16} />
              </Button>
            )}
          </div>
          {voiceError && (
            <p className="mt-2 text-[11px] text-rose-500 text-center" style={{ fontFamily: 'Jost, sans-serif' }}>
              {voiceError}
            </p>
          )}
          {!conversationActive && (
            <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground/70">
              <Lock size={10} />
              <span className="text-[10px]" style={{ fontFamily: 'Jost, sans-serif' }}>Private &amp; secure</span>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} source="ubi_routine_plan" />
    </div>
  );
}

function MessageBubble({ message, index, onRate, shimmer }: { message: UbiMessage; index: number; onRate: (index: number, rating: 'up' | 'down') => void; shimmer?: boolean }) {
  const isUser = message.role === 'user';
  const [revealed, setRevealed] = useState(message.content.length);
  const revealedRef = useRef(message.content.length);

  // Typewriter reveal while streaming (assistant only)
  useEffect(() => {
    if (isUser) return;
    if (!shimmer) {
      // Streaming finished — show full content immediately
      revealedRef.current = message.content.length;
      setRevealed(message.content.length);
      return;
    }
    // While streaming, progressively catch up to message.content
    let raf: number;
    const tick = () => {
      const target = message.content.length;
      if (revealedRef.current < target) {
        // Reveal a few chars per frame for smooth typewriter
        const step = Math.max(2, Math.ceil((target - revealedRef.current) / 18));
        revealedRef.current = Math.min(target, revealedRef.current + step);
        setRevealed(revealedRef.current);
      }
      raf = window.setTimeout(tick, 28) as unknown as number;
    };
    raf = window.setTimeout(tick, 28) as unknown as number;
    return () => clearTimeout(raf);
  }, [shimmer, message.content, isUser]);

  const displayedContent = isUser || !shimmer ? message.content : message.content.slice(0, revealed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 items-start ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full border border-primary/20 shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
          <img src={speechBubbleIcon} alt="Ubi" className="w-4 h-4 object-contain clay-icon" />
        </div>
      )}
      <div className="flex flex-col max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-primary/15 text-foreground rounded-tr-sm'
              : `bg-white text-foreground border border-primary/20 rounded-tl-sm shadow-soft ${shimmer ? 'ubi-bubble-shimmer' : ''}`
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap" style={{ fontFamily: 'Jost, sans-serif' }}>{message.content}</p>
          ) : (
            <div
              className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2"
              style={{ fontFamily: message.content.length > 160 ? 'Cormorant Garamond, serif' : 'Jost, sans-serif' }}
            >
              <ReactMarkdown>{displayedContent}</ReactMarkdown>
              {shimmer && (
                <span
                  aria-hidden
                  className="inline-block w-[2px] h-[1em] -mb-[2px] ml-0.5 bg-primary align-middle animate-pulse"
                />
              )}
            </div>
          )}
        </div>
        {!isUser && !shimmer && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <button
              onClick={() => onRate(index, 'up')}
              className={`p-1 rounded-full transition-colors ${
                message.rating === 'up'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => onRate(index, 'down')}
              className={`p-1 rounded-full transition-colors ${
                message.rating === 'down'
                  ? 'text-destructive bg-destructive/10'
                  : 'text-muted-foreground/40 hover:text-muted-foreground'
              }`}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
