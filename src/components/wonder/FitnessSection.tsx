import { useState } from 'react';
import { motion } from 'framer-motion';
import { fitnessWorkouts, type FitnessWorkout, type FitnessType } from '@/lib/wonderResources';
import FitnessWorkoutCard from './FitnessWorkoutCard';
import FitnessDetailSheet from './FitnessDetailSheet';

const fitnessTabs: { key: FitnessType; label: string; emoji: string }[] = [
  { key: 'upper-body', label: 'Upper Body', emoji: '💪' },
  { key: 'lower-body', label: 'Lower Body', emoji: '🦵' },
  { key: 'core', label: 'Core', emoji: '🔥' },
  { key: 'stretches-yoga', label: 'Stretches & Yoga', emoji: '🧘‍♀️' },
];

export default function FitnessSection() {
  const [activeTab, setActiveTab] = useState<FitnessType>('upper-body');
  const [selectedWorkout, setSelectedWorkout] = useState<FitnessWorkout | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = fitnessWorkouts.filter((w) => w.fitnessType === activeTab);

  const handleSelect = (workout: FitnessWorkout) => {
    setSelectedWorkout(workout);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {fitnessTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Workout grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((workout, i) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FitnessWorkoutCard workout={workout} onTap={() => handleSelect(workout)} />
          </motion.div>
        ))}
      </div>

      <FitnessDetailSheet
        workout={selectedWorkout}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
