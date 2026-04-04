import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { format, differenceInYears } from 'date-fns';

import blossomIcon from '@/assets/icons/blossom.png';

interface CycleSetupProps {
  initialData?: { lastPeriodStart?: string; cycleLength?: number; periodLength?: number; dateOfBirth?: string };
  onComplete: () => void;
}

const TOTAL_STEPS = 4;

export default function CycleSetup({ initialData, onComplete }: CycleSetupProps) {
  const { updateProfile, profile } = useUserStore();
  const [step, setStep] = useState(0);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    initialData?.dateOfBirth ? new Date(initialData.dateOfBirth + 'T00:00:00') : undefined
  );
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | undefined>(
    initialData?.lastPeriodStart ? new Date(initialData.lastPeriodStart + 'T00:00:00') : undefined
  );
  const [cycleLength, setCycleLength] = useState(initialData?.cycleLength ?? 28);
  const [periodLength, setPeriodLength] = useState(initialData?.periodLength ?? 5);

  const cycleLengthOptions = Array.from({ length: 15 }, (_, i) => i + 21);
  const periodLengthOptions = Array.from({ length: 6 }, (_, i) => i + 3);

  const age = dateOfBirth ? differenceInYears(new Date(), dateOfBirth) : null;

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSubmit = () => {
    if (!lastPeriodDate) return;
    updateProfile({
      cycleData: {
        ...profile.cycleData,
        lastPeriodStart: formatDate(lastPeriodDate),
        cycleLength,
        periodLength,
        setupComplete: true,
        dateOfBirth: dateOfBirth ? formatDate(dateOfBirth) : profile.cycleData?.dateOfBirth,
      },
    });
    onComplete();
  };

  const steps = [
    // Step 0: Date of birth
    <motion.div key="step-dob" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
      <h2 className="text-xl font-display font-semibold text-foreground text-center">What's your date of birth?</h2>
      <p className="text-sm text-muted-foreground text-center">This helps us personalise your experience</p>
      <div className="glass-card rounded-2xl p-2">
        <Calendar
          mode="single"
          selected={dateOfBirth}
          onSelect={setDateOfBirth}
          disabled={(date) => date > new Date() || date < new Date('1940-01-01')}
          defaultMonth={dateOfBirth || new Date(2000, 0)}
          fromYear={1940}
          toYear={new Date().getFullYear()}
          captionLayout="dropdown-buttons"
          className={cn("p-3 pointer-events-auto")}
        />
      </div>
      {age !== null && age >= 0 && (
        <p className="text-sm text-foreground/70">
          You're <span className="font-semibold text-foreground">{age}</span> years old
        </p>
      )}
      <button
        onClick={() => dateOfBirth && setStep(1)}
        disabled={!dateOfBirth}
        className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>,

    // Step 1: Last period date
    <motion.div key="step-period" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
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
        onClick={() => lastPeriodDate && setStep(2)}
        disabled={!lastPeriodDate}
        className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm transition-opacity disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>,

    // Step 2: Cycle length
    <motion.div key="step-cycle" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
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
      <button onClick={() => setStep(3)} className="w-full max-w-xs py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm">
        Continue
      </button>
    </motion.div>,

    // Step 3: Period length
    <motion.div key="step-period-len" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex flex-col items-center gap-6 w-full">
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
        <p className="text-xs text-muted-foreground mt-1">Step {step + 1} of {TOTAL_STEPS}</p>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
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
