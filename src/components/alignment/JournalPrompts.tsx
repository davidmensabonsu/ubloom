import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw } from 'lucide-react';

const prompts = [
  "What would I do differently if I knew no one was watching?",
  "What am I tolerating in my life that I no longer want to accept?",
  "If today were my last, what would I regret not saying?",
  "What fear is quietly running my decisions right now?",
  "What would my life look like in 5 years if nothing changed?",
  "What am I avoiding that I know would change everything?",
  "When did I last feel truly alive, and what was I doing?",
  "What story am I telling myself that might not be true?",
  "What would I pursue if failure wasn't possible?",
  "Who do I need to forgive — including myself?",
  "What part of my routine is draining me instead of fuelling me?",
  "What boundary do I need to set but keep putting off?",
  "What does my ideal morning look like, and how far am I from it?",
  "What emotion have I been pushing down instead of feeling?",
  "If I could give my younger self one piece of advice, what would it be?",
  "What habit is silently shaping who I'm becoming?",
  "What would I stop doing immediately if I truly valued my peace?",
  "What does 'enough' actually look like for me?",
  "What conversation am I avoiding that could change a relationship?",
  "What did today teach me that yesterday couldn't?",
];

function pickRandom(arr: string[], count: number, exclude?: string[]): string[] {
  const filtered = exclude ? arr.filter((p) => !exclude.includes(p)) : [...arr];
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface JournalPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function JournalPrompts({ onSelect }: JournalPromptsProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<string[]>(() => pickRandom(prompts, 3));

  const refresh = () => {
    setCurrent(pickRandom(prompts, 3, current));
  };

  return (
    <div className="mb-3">
      <button
        onClick={() => setVisible((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mb-2"
      >
        <Lightbulb size={14} />
        <span>{visible ? 'Hide prompts' : 'Need inspiration?'}</span>
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-1.5 overflow-hidden"
          >
            {current.map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onSelect(prompt)}
                className="w-full text-left text-sm px-3 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-foreground/80 transition-colors leading-snug"
              >
                {prompt}
              </motion.button>
            ))}
            <button
              onClick={refresh}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mt-1 ml-1"
            >
              <RefreshCw size={12} />
              <span>More prompts</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
