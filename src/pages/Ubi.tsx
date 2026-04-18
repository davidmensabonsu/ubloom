import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Square, Plus, History, ThumbsUp, ThumbsDown, ArrowLeft, X, Search, MessageCircle, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUbiChat, UbiMessage, UbiConversation } from '@/hooks/useUbiChat';
import { useUserStore } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useSubscription } from '@/hooks/useSubscription';
import ubiAvatar from '@/assets/ubi-avatar-bloom.png';
import speechBubbleIcon from '@/assets/icons/speech-bubble.png';
import ubloomFlower from '@/assets/ubloom-flower.png';
import UbiOnboarding from '@/components/ubi/UbiOnboarding';

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
  } = useUbiChat();
  const profile = useUserStore((s) => s.profile);
  const { canUse, ubiMessagesRemaining, incrementUbiMessageCount, isActive, DAILY_UBI_LIMIT } = useSubscription();
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const welcomeSent = useRef(false);
  const journalHandled = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-send welcome message only once ever
  useEffect(() => {
    if (isLoading) return;
    if (!profile.ubiOnboardingComplete) return; // wait for onboarding
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    markPromptUsed(prompt);
    // Persist to localStorage for daily tracking
    const key = `ubi-used-presets-${getLocalDateStr()}`;
    const used: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!used.includes(prompt)) {
      used.push(prompt);
      localStorage.setItem(key, JSON.stringify(used));
    }
    setInput(prompt);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
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
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleNewChat = () => {
    startNewChat();
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
      <div className="sticky top-0 z-10 hero-gradient px-4 pt-6 pb-5">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/40 shadow-sm bg-white/20">
              <MessageCircle size={20} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-base font-semibold text-white">Ubi</h1>
              <p className="text-xs text-white/85" style={{ fontFamily: 'DM Sans, sans-serif' }}>Your personal mentor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Sheet open={historyOpen} onOpenChange={(open) => { setHistoryOpen(open); if (!open) setHistorySearch(''); }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/90 hover:text-white hover:bg-white/15" title="Chat history">
                  <History size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                <SheetHeader className="flex flex-row items-center justify-between pb-2">
                  <SheetTitle className="text-base">Chat History</SheetTitle>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-full" onClick={handleNewChat}>
                    <Plus size={14} />
                    New Chat
                  </Button>
                </SheetHeader>
                <div className="relative mb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-input bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="overflow-y-auto flex-1 -mx-2">
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
              className="text-white/90 hover:text-white hover:bg-white/15"
              title="New chat"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-36 pt-4">
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
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} index={i} onRate={rateMessage} />
                  ))}
                  {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 items-start"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/20 shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
                        <img src={speechBubbleIcon} alt="Ubi" className="w-4 h-4 object-contain clay-icon" />
                      </div>
                      <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-muted-foreground/50"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              duration: 0.6,
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

              {/* Inline follow-up prompts below last Ubi message */}
              {!isStreaming && suggestedPrompts.length > 0 && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-x-auto scrollbar-hide -mx-1"
                >
                  <div className="flex gap-2 px-1 py-1 w-max">
                    {suggestedPrompts.map((text, i) => (
                      <button
                        key={`${text}-${i}`}
                        onClick={() => handlePreset(text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors whitespace-nowrap shrink-0"
                      >
                        <img src={promptIcons[i % promptIcons.length]} alt="" className="w-4 h-4 object-contain shrink-0 clay-icon" />
                        <span className="text-xs text-foreground/90">{text}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-8">
                  Tap a prompt or type your own question to get started
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input area with prompts strip */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 z-10">
        {/* Horizontal scrollable prompts */}
        {!isStreaming && (() => {
          const hasMessages = messages.length > 0;
          if (hasMessages) return null; // AI suggestions now shown inline in chat
          // No messages yet — show presets filtered by today's used list
          const usedToday: string[] = JSON.parse(localStorage.getItem(`ubi-used-presets-${getLocalDateStr()}`) || '[]');
          const filtered = presetPrompts.filter(p => !usedToday.includes(p.text));
          if (filtered.length === 0) return null;
          return (
            <div className="overflow-x-auto scrollbar-hide border-b border-border/30">
              <div className="flex gap-2 px-4 py-2 max-w-lg mx-auto w-max min-w-full">
                {filtered.map((prompt, i) => (
                  <button
                    key={`${prompt.text}-${i}`}
                    onClick={() => handlePreset(prompt.text)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 hover:bg-secondary/90 border border-border/40 transition-colors whitespace-nowrap shrink-0"
                  >
                    <img src={prompt.icon} alt="" className="w-4 h-4 object-contain shrink-0 clay-icon" />
                    <span className="text-xs text-foreground/90">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Ubi limit notice */}
        {!isActive && (
          <div className="max-w-lg mx-auto px-4 py-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {ubiMessagesRemaining > 0
                ? `${ubiMessagesRemaining} of ${DAILY_UBI_LIMIT} messages left today`
                : 'Daily limit reached'}
            </span>
            {ubiMessagesRemaining === 0 && (
              <button
                onClick={() => navigate('/upgrade')}
                className="text-[11px] font-medium text-primary"
              >
                Upgrade
              </button>
            )}
          </div>
        )}

        {/* Input row */}
        <div className="max-w-lg mx-auto flex items-end gap-2 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={!canUse('ubi_chat') ? 'Daily limit reached — upgrade for unlimited' : 'Talk to Ubi...'}
            rows={1}
            disabled={!canUse('ubi_chat')}
            className="flex-1 resize-none rounded-2xl border border-input bg-secondary/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-[120px] disabled:opacity-50"
          />
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
              className="shrink-0 rounded-full h-10 w-10"
            >
              <Send size={16} />
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function MessageBubble({ message, index, onRate }: { message: UbiMessage; index: number; onRate: (index: number, rating: 'up' | 'down') => void }) {
  const isUser = message.role === 'user';

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
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-secondary/80 text-foreground rounded-bl-md'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
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
