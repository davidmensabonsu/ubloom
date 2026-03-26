import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { playDing, playChime } from '@/lib/feedback';

const BODY_PARTS = [
  { name: 'Toes & Feet', instruction: 'Bring your attention to your toes. Wiggle them gently, then relax.', position: 90 },
  { name: 'Legs', instruction: 'Notice any tension in your calves and thighs. Let it soften.', position: 72 },
  { name: 'Hips & Lower Back', instruction: 'Feel the weight of your body here. Breathe into any tightness.', position: 55 },
  { name: 'Belly & Chest', instruction: 'Notice your breath rising and falling. Don\'t change it — just observe.', position: 40 },
  { name: 'Shoulders & Arms', instruction: 'Drop your shoulders away from your ears. Let your arms be heavy.', position: 28 },
  { name: 'Neck & Head', instruction: 'Soften your jaw. Relax your forehead. Let go of any holding.', position: 12 },
];

export default function BodyScanGuide() {
  const [step, setStep] = useState(-1);
  const ambient = useAmbientSound('bodyscan');
  const isActive = step >= 0 && step < BODY_PARTS.length;
  const isDone = step >= BODY_PARTS.length;
  const current = isActive ? BODY_PARTS[step] : null;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="relative w-full flex gap-4">
        {/* Body silhouette bar */}
        <div className="relative w-8 shrink-0">
          <div className="absolute inset-x-0 top-0 bottom-0 rounded-full bg-muted/30" />
          {isActive && (
            <motion.div
              className="absolute left-0 right-0 h-6 rounded-full bg-primary/30"
              animate={{ top: `${current!.position}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          )}
          {/* Markers */}
          {BODY_PARTS.map((part, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors"
              style={{
                top: `${part.position}%`,
                backgroundColor: i <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[180px] flex items-center">
          <AnimatePresence mode="wait">
            {step === -1 && (
              <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-sm text-muted-foreground">Lie down comfortably. We'll scan from toes to head.</p>
                <Button size="sm" className="rounded-xl" onClick={() => setStep(0)}>Begin scan</Button>
              </motion.div>
            )}
            {isActive && current && (
              <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-primary font-medium">{current.name}</p>
                <p className="text-sm text-foreground leading-relaxed">{current.instruction}</p>
                <Button size="sm" className="rounded-xl gap-1" onClick={() => { setStep(s => s + 1); step < BODY_PARTS.length - 1 ? playDing() : playChime(); }}>
                  {step < BODY_PARTS.length - 1 ? 'Next area' : 'Complete'}
                  <ChevronRight size={14} />
                </Button>
              </motion.div>
            )}
            {isDone && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Scan complete ✨</p>
                <p className="text-xs text-muted-foreground">Rest here for a moment. Notice how your body feels as a whole.</p>
                <Button size="sm" variant="ghost" className="rounded-xl gap-1" onClick={() => setStep(-1)}>
                  <RotateCcw size={14} /> Restart
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={ambient.toggle}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        aria-label={ambient.isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
      >
        {ambient.isPlaying ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
        <span>{ambient.isPlaying ? 'Sound on' : 'Sound off'}</span>
      </button>
    </div>
  );
}
