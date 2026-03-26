import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Hand, Ear, Flower2, Coffee, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playDing, playChime } from '@/lib/feedback';

const SENSES = [
  { count: 5, label: 'things you can see', icon: Eye, color: 'hsl(var(--primary))' },
  { count: 4, label: 'things you can touch', icon: Hand, color: 'hsl(280 70% 60%)' },
  { count: 3, label: 'things you can hear', icon: Ear, color: 'hsl(150 55% 50%)' },
  { count: 2, label: 'things you can smell', icon: Flower2, color: 'hsl(20 85% 55%)' },
  { count: 1, label: 'thing you can taste', icon: Coffee, color: 'hsl(85 60% 48%)' },
];

export default function GroundingExercise({ onComplete }: { onComplete?: () => void }) {
  const [step, setStep] = useState(-1); // -1 = not started, 0-4 = senses, 5 = done

  const isActive = step >= 0 && step < 5;
  const isDone = step >= 5;
  const current = isActive ? SENSES[step] : null;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <AnimatePresence mode="wait">
        {step === -1 && (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-3">
            <div className="flex justify-center gap-1">
              {SENSES.map((s, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Use your five senses to ground yourself</p>
            <Button size="sm" className="rounded-xl" onClick={() => setStep(0)}>Begin</Button>
          </motion.div>
        )}

        {isActive && current && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="text-center space-y-4 w-full"
          >
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: `${current.color}20` }}>
              <current.icon size={28} style={{ color: current.color }} />
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-foreground">{current.count}</p>
              <p className="text-sm text-muted-foreground mt-1">{current.label}</p>
            </div>
            <p className="text-xs text-muted-foreground/60">Take your time. Notice them slowly.</p>
            <Button size="sm" className="rounded-xl gap-1" onClick={() => { setStep(s => s + 1); if (step < 4) playDing(); else { playChime(); onComplete?.(); } }}>
              {step < 4 ? 'Next' : 'Finish'}
              <ChevronRight size={14} />
            </Button>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-1">
              {SENSES.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-colors"
                  style={{ backgroundColor: i <= step ? SENSES[i].color : 'hsl(var(--muted))' }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {isDone && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3">
            <p className="text-lg font-display font-semibold text-foreground">You're grounded ✨</p>
            <p className="text-sm text-muted-foreground">Notice how your body feels right now.</p>
            <Button size="sm" variant="ghost" className="rounded-xl gap-1" onClick={() => setStep(-1)}>
              <RotateCcw size={14} /> Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
