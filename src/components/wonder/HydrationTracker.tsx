import { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplets, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GOAL = 8; // 8 glasses

export default function HydrationTracker() {
  const [glasses, setGlasses] = useState(0);
  const isDone = glasses >= GOAL;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {isDone ? 'Goal reached! 💧' : 'Tap a glass to log water'}
      </p>

      {/* Glass grid */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: GOAL }).map((_, i) => {
          const filled = i < glasses;
          return (
            <motion.button
              key={i}
              className="relative w-14 h-16 rounded-xl border-2 overflow-hidden transition-colors"
              style={{
                borderColor: filled ? 'hsl(200 80% 55%)' : 'hsl(var(--muted))',
              }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setGlasses(filled ? i : i + 1)}
            >
              {/* Water fill */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-b-lg"
                style={{ backgroundColor: 'hsl(200 80% 55% / 0.3)' }}
                animate={{ height: filled ? '100%' : '0%' }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets
                  size={18}
                  className="transition-colors"
                  style={{ color: filled ? 'hsl(200 80% 55%)' : 'hsl(var(--muted-foreground) / 0.3)' }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="text-sm font-medium text-foreground">
        {glasses} / {GOAL} glasses
      </p>

      {glasses > 0 && (
        <Button size="sm" variant="ghost" className="rounded-xl gap-1" onClick={() => setGlasses(0)}>
          <RotateCcw size={14} /> Reset
        </Button>
      )}
    </div>
  );
}
