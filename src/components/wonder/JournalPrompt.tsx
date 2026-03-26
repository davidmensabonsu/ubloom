import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playDing, playChime } from '@/lib/feedback';

interface JournalPromptProps {
  prompts: string[];
  placeholder?: string;
  doneMessage?: string;
  maxEntries?: number;
}

export default function JournalPrompt({ prompts, placeholder = 'Write here...', doneMessage = 'Beautiful ✨', maxEntries }: JournalPromptProps) {
  const [entries, setEntries] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const limit = maxEntries || prompts.length;
  const currentPrompt = prompts[Math.min(promptIndex, prompts.length - 1)];

  const addEntry = () => {
    if (!currentText.trim()) return;
    const newEntries = [...entries, currentText.trim()];
    setEntries(newEntries);
    setCurrentText('');
    if (newEntries.length >= limit) {
      setIsDone(true);
      playChime();
    } else {
      setPromptIndex(prev => prev + 1);
      playDing();
    }
  };

  const reset = () => {
    setEntries([]);
    setCurrentText('');
    setPromptIndex(0);
    setIsDone(false);
  };

  return (
    <div className="space-y-4 py-2">
      <AnimatePresence mode="wait">
        {!isDone ? (
          <motion.div
            key={promptIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">{currentPrompt}</p>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-muted/30 p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{entries.length + 1} of {limit}</span>
              <Button size="sm" className="rounded-xl gap-1" onClick={addEntry} disabled={!currentText.trim()}>
                <Plus size={14} /> {entries.length < limit - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">{doneMessage}</p>
            </div>
            <div className="space-y-2">
              {entries.map((entry, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 text-sm text-foreground/80">
                  <span className="text-xs text-primary font-medium mr-2">{i + 1}.</span>
                  {entry}
                </div>
              ))}
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl gap-1" onClick={reset}>
              <X size={14} /> Start over
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
