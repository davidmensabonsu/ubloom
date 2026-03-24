import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Heart, ChevronDown, X } from 'lucide-react';
import { feelingIcons } from '@/lib/moodIcons';
import { getLocalDateStr } from '@/lib/dateUtils';

const feelingOptions = [
  { value: 'calm', label: 'Calm' },
  { value: 'energized', label: 'Energized' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'creative', label: 'Creative' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'confident', label: 'Confident' },
  { value: 'grounded', label: 'Grounded' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'sad', label: 'Sad' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
  { value: 'frustrated', label: 'Frustrated' },
  { value: 'tired', label: 'Tired' },
  { value: 'lonely', label: 'Lonely' },
  { value: 'numb', label: 'Numb' },
  { value: 'hopeful', label: 'Hopeful' },
];

export default function DailyMoodCheckin() {
  const { addMoodEntry, updateProfile } = useUserStore();
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const toggleFeeling = (value: string) => {
    if (selectedFeelings.includes(value)) {
      setSelectedFeelings(selectedFeelings.filter((f) => f !== value));
    } else if (selectedFeelings.length < 3) {
      setSelectedFeelings([...selectedFeelings, value]);
    }
  };

  const handleConfirm = () => {
    if (selectedFeelings.length > 0) {
      addMoodEntry(selectedFeelings);
    }
    updateProfile({ lastMoodCheckinDate: getLocalDateStr() });
  };

  const handleSkip = () => {
    updateProfile({ lastMoodCheckinDate: getLocalDateStr() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-5"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 relative"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Heart size={20} className="text-primary" />
          <h2 className="section-title text-lg">How are you feeling today?</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">Choose up to 3</p>

        <div className="flex flex-wrap gap-2">
          {feelingOptions.slice(0, 8).map((feeling) => (
            <motion.button
              key={feeling.value}
              onClick={() => toggleFeeling(feeling.value)}
              className={`mood-pill ${selectedFeelings.includes(feeling.value) ? 'selected' : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={feelingIcons[feeling.value]}
                alt=""
                className="w-5 h-5 object-contain"
                style={{ filter: 'saturate(1.6) contrast(1.1)' }}
              />
              <span>{feeling.label}</span>
            </motion.button>
          ))}
          <AnimatePresence>
            {(expanded ||
              selectedFeelings.some((f) =>
                feelingOptions.slice(8).map((o) => o.value).includes(f)
              )) &&
              feelingOptions.slice(8).map((feeling) => (
                <motion.button
                  key={feeling.value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => toggleFeeling(feeling.value)}
                  className={`mood-pill ${selectedFeelings.includes(feeling.value) ? 'selected' : ''}`}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={feelingIcons[feeling.value]}
                    alt=""
                    className="w-5 h-5 object-contain"
                    style={{ filter: 'saturate(1.6) contrast(1.1)' }}
                  />
                  <span>{feeling.label}</span>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
            {expanded ? 'Show less' : 'Show more'}
          </button>

          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for today
          </button>
        </div>

        {selectedFeelings.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleConfirm}
            className="soft-button w-full mt-5 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span>Confirm ({selectedFeelings.length}/3)</span>
            <Heart size={16} className="fill-current" />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
