import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Sparkles, Heart, Feather } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const feelingOptions = [
  { value: 'calm', label: 'Calm', emoji: '🌿' },
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'grateful', label: 'Grateful', emoji: '💕' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { value: 'confident', label: 'Confident', emoji: '👑' },
  { value: 'grounded', label: 'Grounded', emoji: '🌱' },
  { value: 'joyful', label: 'Joyful', emoji: '✨' },
];

export default function Alignment() {
  const { profile, addJournalEntry, addMoodEntry } = useUserStore();
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [journalText, setJournalText] = useState('');
  const [saved, setSaved] = useState(false);

  const toggleFeeling = (value: string) => {
    if (selectedFeelings.includes(value)) {
      setSelectedFeelings(selectedFeelings.filter((f) => f !== value));
    } else if (selectedFeelings.length < 3) {
      setSelectedFeelings([...selectedFeelings, value]);
    }
  };

  const handleSave = () => {
    if (selectedFeelings.length > 0) {
      addMoodEntry(selectedFeelings);
    }
    if (journalText.trim()) {
      addJournalEntry({
        content: journalText,
        date: new Date().toISOString(),
        mood: selectedFeelings[0],
      });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mb-1"
        >
          {todayFormatted}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Daily Alignment
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1"
        >
          A quiet moment before your day unfolds
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-5 space-y-6">
        {/* How do you want to feel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-primary" />
            <h2 className="section-title">How do you want today to feel?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Choose up to 3</p>
          <div className="flex flex-wrap gap-2">
            {feelingOptions.map((feeling) => (
              <motion.button
                key={feeling.value}
                onClick={() => toggleFeeling(feeling.value)}
                className={`mood-pill ${
                  selectedFeelings.includes(feeling.value) ? 'selected' : ''
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span>{feeling.emoji}</span>
                <span>{feeling.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Future Self Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary" />
            <h2 className="section-title">From your future self</h2>
          </div>
          <p className="font-display text-lg leading-relaxed text-foreground/90 italic">
            "Today, let go of the need to have everything figured out. Trust that
            clarity comes through action, not endless planning. You are more
            capable than you know."
          </p>
        </motion.div>

        {/* Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Feather size={18} className="text-primary" />
            <h2 className="section-title">Private Journal</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            What's on your heart right now?
          </p>
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Write freely, this is just for you..."
            className="journal-input"
            rows={5}
          />
        </motion.div>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={selectedFeelings.length === 0 && !journalText.trim()}
          className={`soft-button w-full flex items-center justify-center gap-2 ${
            selectedFeelings.length === 0 && !journalText.trim() ? 'opacity-50' : ''
          }`}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {saved ? (
            <>
              <span>Saved</span>
              <Heart size={18} className="fill-current" />
            </>
          ) : (
            <>
              <span>Save & align</span>
              <Sparkles size={18} />
            </>
          )}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
