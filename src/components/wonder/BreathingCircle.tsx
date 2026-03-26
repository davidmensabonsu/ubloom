import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAmbientSound } from '@/hooks/useAmbientSound';

interface BreathingCircleProps {
  /** Pattern as [inhale, hold, exhale] in seconds */
  pattern?: [number, number, number];
  cycles?: number;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'idle' | 'done';

const PHASE_LABELS: Record<Phase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
  idle: 'Ready',
  done: 'Well done ✨',
};

const PHASE_COLORS: Record<Phase, string> = {
  inhale: 'hsl(var(--primary) / 0.3)',
  hold: 'hsl(var(--primary) / 0.5)',
  exhale: 'hsl(var(--accent) / 0.3)',
  idle: 'hsl(var(--muted) / 0.5)',
  done: 'hsl(var(--primary) / 0.4)',
};

export default function BreathingCircle({ pattern = [4, 7, 8], cycles = 4 }: BreathingCircleProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const countRef = useRef(0);
  const cycleRef = useRef(0);
  const ambient = useAmbientSound('breathing');

  const [inhale, hold, exhale] = pattern;

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setPhase('idle');
    setCountdown(0);
    setCurrentCycle(0);
    setIsRunning(false);
    phaseRef.current = 'idle';
    countRef.current = 0;
    cycleRef.current = 0;
  }, [cleanup]);

  const startBreathing = useCallback(() => {
    cleanup();
    phaseRef.current = 'inhale';
    countRef.current = inhale;
    cycleRef.current = 1;
    setPhase('inhale');
    setCountdown(inhale);
    setCurrentCycle(1);
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      countRef.current -= 1;

      if (countRef.current <= 0) {
        // Advance to next phase
        if (phaseRef.current === 'inhale') {
          phaseRef.current = 'hold';
          countRef.current = hold;
          setPhase('hold');
        } else if (phaseRef.current === 'hold') {
          phaseRef.current = 'exhale';
          countRef.current = exhale;
          setPhase('exhale');
        } else if (phaseRef.current === 'exhale') {
          if (cycleRef.current >= cycles) {
            // Done
            phaseRef.current = 'done';
            setPhase('done');
            setCountdown(0);
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return;
          }
          cycleRef.current += 1;
          setCurrentCycle(cycleRef.current);
          phaseRef.current = 'inhale';
          countRef.current = inhale;
          setPhase('inhale');
        }
      }

      setCountdown(countRef.current);
    }, 1000);
  }, [inhale, hold, exhale, cycles, cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const circleScale = phase === 'inhale' ? 1 : phase === 'hold' ? 1 : phase === 'exhale' ? 0.55 : phase === 'done' ? 0.8 : 0.55;
  const duration = phase === 'inhale' ? inhale : phase === 'exhale' ? exhale : phase === 'hold' ? 0.3 : 0.5;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Circle */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/10" />

        {/* Animated breathing circle */}
        <motion.div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 160,
            height: 160,
            background: PHASE_COLORS[phase],
            boxShadow: phase !== 'idle' ? '0 0 40px hsl(var(--primary) / 0.15)' : 'none',
          }}
          animate={{ scale: circleScale }}
          transition={{ duration, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center"
            >
              <p className="text-sm font-medium text-foreground/80">{PHASE_LABELS[phase]}</p>
              {isRunning && phase !== 'done' && (
                <p className="text-2xl font-display font-semibold text-foreground mt-1">{countdown}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Cycle counter */}
      {isRunning && phase !== 'done' && (
        <p className="text-xs text-muted-foreground">
          Cycle {currentCycle} of {cycles}
        </p>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {phase === 'idle' || phase === 'done' ? (
          <Button size="sm" className="rounded-xl gap-2" onClick={startBreathing}>
            <Play size={14} />
            {phase === 'done' ? 'Again' : 'Start'}
          </Button>
        ) : (
          <>
            <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={() => { isRunning ? (cleanup(), setIsRunning(false)) : startBreathing(); }}>
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl" onClick={reset}>
              <RotateCcw size={14} />
            </Button>
          </>
        )}
      </div>

      {/* Sound toggle & pattern info */}
      <div className="flex items-center gap-4">
        <button
          onClick={ambient.toggle}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label={ambient.isPlaying ? 'Mute ambient sound' : 'Play ambient sound'}
        >
          {ambient.isPlaying ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
          <span>{ambient.isPlaying ? 'Sound on' : 'Sound off'}</span>
        </button>
        <div className="flex gap-3 text-[10px] text-muted-foreground uppercase tracking-widest">
          <span>In {inhale}s</span>
          <span>Hold {hold}s</span>
          <span>Out {exhale}s</span>
        </div>
      </div>
    </div>
  );
}
