import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import speechBubbleIcon from '@/assets/icons/speech-bubble.png';

type StepType = 'choice' | 'multi' | 'text';

interface OnboardingStep {
  message: string;
  type: StepType;
  options?: string[];
  field?: keyof typeof FIELDS;
  placeholder?: string;
}

const FIELDS = {
  preferredName: 'preferredName',
  lifeStage: 'lifeStage',
  primaryFocusArea: 'primaryFocusArea',
  struggles: 'struggles',
  communicationTone: 'communicationTone',
  neverForget: 'neverForget',
} as const;

const STEPS: OnboardingStep[] = [
  {
    message: "Before we start, I want to actually know you. Not just your name — the real stuff. Is that okay?",
    type: 'choice',
    options: ["Yes, let's do it", 'Sure, keep it short'],
  },
  {
    message: 'What should I call you?',
    type: 'text',
    field: 'preferredName',
    placeholder: 'Type your name...',
  },
  {
    message: 'Where are you in life right now? Pick what feels most true.',
    type: 'choice',
    options: ['Building something', 'Healing & resetting', 'In transition', 'Thriving & expanding'],
    field: 'lifeStage',
  },
  {
    message: "What's your biggest focus right now?",
    type: 'choice',
    options: ['Business & career', 'Health & wellness', 'Relationships', 'Personal growth', 'Finances'],
    field: 'primaryFocusArea',
  },
  {
    message: 'What do you struggle with most?',
    type: 'multi',
    options: ['Staying consistent', 'Self-confidence', 'Getting clear', 'Staying motivated', 'Overthinking'],
    field: 'struggles',
  },
  {
    message: 'How do you want me to talk to you?',
    type: 'choice',
    options: ['Warm & direct', 'Gentle & encouraging', 'Push me hard', 'Unfiltered & real'],
    field: 'communicationTone',
  },
  {
    message: "Last one. What's one thing you never want to forget about yourself?",
    type: 'text',
    field: 'neverForget',
    placeholder: 'Type your answer...',
  },
];

interface Props {
  onComplete: () => void;
}

export default function UbiOnboarding({ onComplete }: Props) {
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);

  const [stepIndex, setStepIndex] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [collectedAnswers, setCollectedAnswers] = useState<Record<string, any>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  useEffect(() => {
    if (step?.type === 'text') {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
    setTextInput('');
    setMultiSelected([]);
  }, [stepIndex]);

  const saveAnswer = (value: any) => {
    if (!step.field) return collectedAnswers;
    const next = { ...collectedAnswers, [step.field]: value };
    setCollectedAnswers(next);
    updateProfile({ [step.field]: value } as any);
    return next;
  };

  const advance = (collected = collectedAnswers) => {
    if (isLastStep) {
      generateSummary(collected);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleChoice = (option: string) => {
    if (step.field) {
      const collected = saveAnswer(option);
      advance(collected);
    } else {
      advance();
    }
  };

  const handleMultiToggle = (option: string) => {
    setMultiSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleMultiSubmit = () => {
    if (multiSelected.length === 0) return;
    const collected = saveAnswer(multiSelected);
    advance(collected);
  };

  const handleTextSubmit = () => {
    const value = textInput.trim();
    if (!value) return;
    const collected = saveAnswer(value);
    advance(collected);
  };

  const generateSummary = async (collected: Record<string, any>) => {
    setIsGeneratingSummary(true);
    try {
      const userMsg =
        `The user has just completed their Ubi onboarding. Here is what they shared: ` +
        `Name preference: ${collected.preferredName || profile.preferredName || ''}, ` +
        `Life stage: ${collected.lifeStage || profile.lifeStage || ''}, ` +
        `Focus area: ${collected.primaryFocusArea || profile.primaryFocusArea || ''}, ` +
        `Struggles: ${(collected.struggles || profile.struggles || []).join(', ')}, ` +
        `Communication tone: ${collected.communicationTone || profile.communicationTone || ''}, ` +
        `Never forget: ${collected.neverForget || profile.neverForget || ''}. ` +
        `Write a warm, personal 3-4 sentence paragraph starting with their preferred name that summarises what you now know about them and what kind of mentor you will be for them. Speak directly to them as Ubi. Make it feel like the beginning of something real.`;

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ubi-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          userContext: {
            preferredName: collected.preferredName,
            lifeStage: collected.lifeStage,
            primaryFocusArea: collected.primaryFocusArea,
            struggles: collected.struggles,
            communicationTone: collected.communicationTone,
            neverForget: collected.neverForget,
          },
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to generate summary');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) full += content;
          } catch { /* ignore */ }
        }
      }

      const cleaned = full.replace(/<!--PROMPTS:.*?-->/, '').trim();
      const finalText = cleaned || `Welcome${collected.preferredName ? ', ' + collected.preferredName : ''}. I'm so glad you're here. From now on, I'll be the mentor who remembers what matters to you — and reminds you of it when you forget.`;
      setSummary(finalText);
      updateProfile({ ubiSummary: finalText });
    } catch (e) {
      console.error('Summary generation failed:', e);
      const fallback = `Welcome${collected.preferredName ? ', ' + collected.preferredName : ''}. I'm so glad we're starting this together. From now on, I'll show up as the mentor you need — direct when you need clarity, gentle when you need rest, always honest. This is the beginning of something real.`;
      setSummary(fallback);
      updateProfile({ ubiSummary: fallback });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleBegin = async () => {
    updateProfile({ ubiOnboardingComplete: true });

    // Seed Ubi's memory from onboarding answers (fire-and-forget)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const lifeStage = collectedAnswers.lifeStage || profile.lifeStage;
        const primaryFocusArea = collectedAnswers.primaryFocusArea || profile.primaryFocusArea;
        const struggles = collectedAnswers.struggles || profile.struggles || [];
        const communicationTone = collectedAnswers.communicationTone || profile.communicationTone;
        const neverForget = collectedAnswers.neverForget || profile.neverForget;

        const seeds: Array<{ memory_type: string; content: string; importance: number }> = [];
        if (lifeStage) seeds.push({ memory_type: 'life_context', content: `User is currently: ${lifeStage}`, importance: 8 });
        if (primaryFocusArea) seeds.push({ memory_type: 'goal', content: `User's primary focus is: ${primaryFocusArea}`, importance: 9 });
        if (Array.isArray(struggles) && struggles.length > 0) {
          seeds.push({ memory_type: 'struggle', content: `User struggles with: ${struggles.join(', ')}`, importance: 8 });
        }
        if (communicationTone) seeds.push({ memory_type: 'preference', content: `User prefers Ubi to communicate in a ${communicationTone} style`, importance: 10 });
        if (neverForget) seeds.push({ memory_type: 'never_forget', content: String(neverForget), importance: 10 });

        if (seeds.length > 0) {
          await (supabase as any).from('ubi_memory').insert(
            seeds.map((s) => ({ ...s, user_id: user.id }))
          );
        }
      }
    } catch (e) {
      console.error('Failed to seed Ubi memories from onboarding:', e);
    }

    onComplete();
  };

  // Summary screen
  if (summary || isGeneratingSummary) {
    return (
      <div className="min-h-[100dvh] hero-gradient flex flex-col px-6 py-10">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
          {isGeneratingSummary ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
              <p className="text-white/80 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Getting to know you…
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <div className="bg-white/15 backdrop-blur-md rounded-3xl p-7 border border-white/25 shadow-xl">
                <p
                  className="text-white text-xl leading-relaxed italic"
                  style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
                >
                  {summary}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <Button
                  onClick={handleBegin}
                  className="bg-white text-rose-600 hover:bg-white/95 rounded-full px-8 py-6 text-base font-medium shadow-lg"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  Let's begin →
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] hero-gradient flex flex-col px-5 py-8">
      <Header />

      {/* Conversation area */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4"
          >
            {/* Ubi message - left aligned */}
            <div className="flex justify-start">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] border border-white/20">
                <p className="text-white text-[15px] leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {step.message}
                </p>
              </div>
            </div>

            {/* Options */}
            {step.type === 'choice' && step.options && (
              <div className="flex flex-col items-end gap-2 pt-2">
                {step.options.map((opt) => (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleChoice(opt)}
                    className="bg-white/95 hover:bg-white text-rose-700 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-colors"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            )}

            {step.type === 'multi' && step.options && (
              <>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  {step.options.map((opt) => {
                    const selected = multiSelected.includes(opt);
                    return (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleMultiToggle(opt)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                          selected
                            ? 'bg-white text-rose-700 border-white shadow-md'
                            : 'bg-white/15 text-white border-white/40 hover:bg-white/25'
                        }`}
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
                {multiSelected.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end pt-2"
                  >
                    <Button
                      onClick={handleMultiSubmit}
                      className="bg-white text-rose-700 hover:bg-white/95 rounded-full px-6"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      Continue →
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: progress + input */}
      <div className="max-w-lg mx-auto w-full space-y-4 pb-2">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === stepIndex ? 1.15 : 1,
                opacity: i <= stepIndex ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
              className={`rounded-full transition-all ${
                i < stepIndex
                  ? 'w-2 h-2 bg-white'
                  : i === stepIndex
                  ? 'w-2.5 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                  : 'w-2 h-2 bg-transparent border border-white/50'
              }`}
            />
          ))}
        </div>

        {/* Free text input */}
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full border border-white/25 pl-4 pr-1.5 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
            }}
            placeholder={step.type === 'text' ? step.placeholder : 'Or tell me in your own words...'}
            className="flex-1 bg-transparent text-white placeholder:text-white/60 text-sm focus:outline-none"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-9 h-9 rounded-full bg-white text-rose-600 flex items-center justify-center disabled:opacity-40 transition-opacity shadow-sm shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-3 max-w-lg mx-auto w-full">
      <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white/40 shadow-sm bg-white/20">
        <img src={speechBubbleIcon} alt="Ubi" className="w-6 h-6 object-contain clay-icon" />
      </div>
      <div>
        <h1
          className="text-2xl text-white leading-none"
          style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}
        >
          Meet Ubi
        </h1>
        <p
          className="text-xs text-white/85 mt-1"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Your personal mentor
        </p>
      </div>
    </div>
  );
}
