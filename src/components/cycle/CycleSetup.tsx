import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { format } from 'date-fns';

import blossomIcon from '@/assets/icons/blossom.png';

interface CycleSetupProps {
  initialData?: { lastPeriodStart?: string; cycleLength?: number; periodLength?: number };
  onComplete: () => void;
}

export default function CycleSetup({ initialData, onComplete }: CycleSetupProps) {
  const { updateProfile } = useUserStore();
  const [step, setStep] = useState(0);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(
    initialData?.lastPeriodStart ? new Date(initialData.lastPeriodStart + 'T00:00:00') : undefined
  );
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState(initialData?.periodLength ?? 5);

  const cycleLengthOptions = Array.from({ length: 15 }, (_, i) => i + 21); // 21-35
  const periodLengthOptions = Array.from({ length: 6 }, (_, i) => i + 3); // 3-8

  const handleSubmit = () => {
    if (!lastPeriodDate) return;
    const year = lastPeriodDate.getFullYear();
    const month = String(lastPeriodDate.getMonth() + 1).padStart(2, '0');
    const day = String(lastPeriodDate.getDate()).padStart(2, '0');

    updateProfile({
      cycleData: {
        lastPeriodStart: `${year}-${month}-${day}`,
        cycleLength,
        periodLength,
        setupComplete: true,
      },
    });
    onComplete();
  };

  const steps = [
    // Step 1: Date picker
    <motion.div key="step-0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-xl font-display font-semibold text-foreground text-center">When did your last period start?</h2>
      <p className="text-sm text-muted-foreground text-center">This helps us calculate your current phase</p>
      <div className="glass-card rounded-2xl p-2">
        <Calendar
          mode="single"
          selected={lastPeriodDate}
          onSelect={setLastPeriodDate}
          disabled={(date) => date > new Date()}
          className={cn("p-3 pointer-events-auto")}
        />
      </div>
      <button
        onClick={() => lastPeriodDate && setStep(1)}
        disabled={!lastPeriodDate}
        className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>,

    // Step 2: Cycle length
    <motion.div key="step-1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-xl font-display font-semibold text-foreground text-center">How long is your average cycle?</h2>
      <p className="text-sm text-muted-foreground text-center">Most cycles are between 21 and 35 days</p>
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {cycleLengthOptions.map((d) => (
          <button
            key={d}
            onClick={() => setCycleLength(d)}
            className={cn(
              "w-12 h-12 rounded-xl text-sm font-medium transition-all",
              cycleLength === d
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-muted/50 text-foreground hover:bg-muted"
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{cycleLength} days</p>
      <button onClick={() => setStep(2)} className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm">
        Continue
      </button>
    </motion.div>,

    // Step 3: Period length
    <motion.div key="step-2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-xl font-display font-semibold text-foreground text-center">How long does your period usually last?</h2>
      <p className="text-sm text-muted-foreground text-center">Select the number of days</p>
      <div className="flex gap-3">
        {periodLengthOptions.map((d) => (
          <button
            key={d}
            onClick={() => setPeriodLength(d)}
            className={cn(
              "w-14 h-14 rounded-xl text-base font-medium transition-all",
              periodLength === d
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-muted/50 text-foreground hover:bg-muted"
            )}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{periodLength} days</p>
      <button onClick={handleSubmit} disabled={!lastPeriodDate} className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm transition-opacity disabled:opacity-40">
        Start tracking
      </button>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
        <img src={blossomIcon} alt="" className="w-12 h-12 clay-icon mb-3" />
        <h1 className="text-2xl font-display font-bold text-foreground">Cycle Tracker</h1>
        <p className="text-xs text-muted-foreground mt-1">Step {step + 1} of 3</p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i <= step ? "bg-primary scale-110" : "bg-muted")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {steps[step]}
      </AnimatePresence>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back
        </button>
      )}
    </div>
  );
}
