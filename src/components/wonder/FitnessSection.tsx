import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Dumbbell } from 'lucide-react';
import { fitnessWorkouts, type FitnessWorkout, type FitnessType } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import FitnessWorkoutCard from './FitnessWorkoutCard';
import FitnessDetailSheet from './FitnessDetailSheet';

type TabKey = FitnessType | 'saved';

const fitnessTabs: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'saved', label: 'Saved', emoji: '💾' },
  { key: 'upper-body', label: 'Upper Body', emoji: '💪' },
  { key: 'lower-body', label: 'Lower Body', emoji: '🦵' },
  { key: 'core', label: 'Core', emoji: '🔥' },
  { key: 'full-body', label: 'Full Body', emoji: '🏋️‍♀️' },
  { key: 'cardio', label: 'Cardio', emoji: '🫀' },
  { key: 'stretches-yoga', label: 'Stretches & Yoga', emoji: '🧘‍♀️' },
];

export default function FitnessSection() {
  const [activeTab, setActiveTab] = useState<TabKey>('upper-body');
  const [selectedWorkout, setSelectedWorkout] = useState<FitnessWorkout | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const savedIds = profile.savedResources || [];

  const filtered = activeTab === 'saved'
    ? fitnessWorkouts.filter((w) => savedIds.includes(w.id))
    : fitnessWorkouts.filter((w) => w.fitnessType === activeTab);

  const handleSelect = (workout: FitnessWorkout) => {
    setSelectedWorkout(workout);
    setSheetOpen(true);
  };

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedIds.includes(id) ? unsaveResource(id) : saveResource(id);
  };

  const savedCount = fitnessWorkouts.filter((w) => savedIds.includes(w.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {fitnessTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === tab.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.emoji} {tab.label}
            {tab.key === 'saved' && savedCount > 0 && (
              <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {savedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'saved' && filtered.length === 0 ? (
          <motion.div
            key="empty-saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any workout to save it
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {filtered.map((workout, i) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <FitnessWorkoutCard workout={workout} onTap={() => handleSelect(workout)} />
                <button
                  onClick={(e) => handleToggleSave(e, workout.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors hover:bg-background z-10"
                >
                  <Bookmark
                    size={14}
                    className={savedIds.includes(workout.id) ? 'text-primary fill-primary' : 'text-muted-foreground'}
                  />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <FitnessDetailSheet
        workout={selectedWorkout}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
