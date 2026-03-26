import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playChime } from '@/lib/feedback';

interface SimpleTimerProps {
  /** Duration in seconds */
  duration: number;
  label?: string;
  doneMessage?: string;
  color?: string;
  onComplete?: () => void;
}

export default function SimpleTimer({ duration, label = 'Timer', doneMessage = 'Well done ✨', color, onComplete }: SimpleTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setRemaining(duration);
    setIsRunning(false);
    setIsDone(false);
  }, [cleanup, duration]);

  const toggle = useCallback(() => {
    if (isDone) return;
    setIsRunning(prev => !prev);
  }, [isDone]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            cleanup();
            setIsRunning(false);
            setIsDone(true);
             playChime();
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      cleanup();
    }
    return cleanup;
  }, [isRunning, cleanup]);

  const progress = 1 - remaining / duration;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const accentColor = color || 'hsl(var(--primary))';

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Circular progress */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="64" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <motion.circle
            cx="72" cy="72" r="64"
            fill="none"
            stroke={accentColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 64}
            animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - progress) }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="text-center z-10">
          {isDone ? (
            <p className="text-sm font-medium text-foreground">{doneMessage}</p>
          ) : (
            <>
              <p className="text-2xl font-display font-bold text-foreground tabular-nums">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isDone ? (
          <Button size="sm" className="rounded-xl gap-2" onClick={toggle}>
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            {isRunning ? 'Pause' : remaining < duration ? 'Resume' : 'Start'}
          </Button>
        ) : (
          <Button size="sm" className="rounded-xl gap-2" onClick={reset}>
            <RotateCcw size={14} /> Again
          </Button>
        )}
        {!isDone && remaining < duration && (
          <Button size="sm" variant="ghost" className="rounded-xl" onClick={reset}>
            <RotateCcw size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
