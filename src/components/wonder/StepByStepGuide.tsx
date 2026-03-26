import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepByStepGuideProps {
  steps: string[];
  title?: string;
}

export default function StepByStepGuide({ steps, title }: StepByStepGuideProps) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4 py-2">
      {title && <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">{title}</p>}

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= current ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[80px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-1"
          >
            <span className="text-xs font-semibold text-primary">Step {current + 1}</span>
            <p className="text-sm text-foreground leading-relaxed">{steps[current]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {current > 0 && (
          <Button size="sm" variant="ghost" className="rounded-xl gap-1" onClick={() => setCurrent(c => c - 1)}>
            <ChevronLeft size={14} /> Back
          </Button>
        )}
        {current < steps.length - 1 ? (
          <Button size="sm" className="rounded-xl gap-1 ml-auto" onClick={() => setCurrent(c => c + 1)}>
            Next <ChevronRight size={14} />
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="rounded-xl gap-1 ml-auto" onClick={() => setCurrent(0)}>
            <RotateCcw size={14} /> Restart
          </Button>
        )}
      </div>
    </div>
  );
}
