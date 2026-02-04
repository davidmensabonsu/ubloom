import { motion } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Plus } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import RoutineSetup from '@/components/routine/RoutineSetup';
import CoreHabitsSection from '@/components/routine/CoreHabitsSection';
import OneOffTasksSection from '@/components/routine/OneOffTasksSection';
import WeeklyProgress from '@/components/routine/WeeklyProgress';

export default function Routine() {
  const { profile, skipRoutineSetup } = useUserStore();
  const [showSetup, setShowSetup] = useState(!profile.routineSetupComplete);
  const [editingHabits, setEditingHabits] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const currentMood = profile.moodHistory[0]?.moods[0] || 'peaceful';

  // Show setup flow for first-time users or when editing habits
  if (showSetup || editingHabits) {
    return (
      <RoutineSetup
        onComplete={() => {
          setShowSetup(false);
          setEditingHabits(false);
        }}
        onSkip={() => {
          skipRoutineSetup();
          setShowSetup(false);
          setEditingHabits(false);
        }}
      />
    );
  }

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
          Your Routine
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mt-2"
        >
          <span className="text-sm text-muted-foreground">Feeling</span>
          <span className="mood-pill selected text-xs">{currentMood}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-5 space-y-6">
        {/* Weekly Progress & Streak */}
        <WeeklyProgress />

        {/* Core Daily Habits */}
        <CoreHabitsSection onEditHabits={() => setEditingHabits(true)} />

        {/* One-Off Tasks for Today */}
        <OneOffTasksSection />
      </div>

      {/* Floating Action Button for quick task add */}
      <motion.button
        onClick={() => {
          // Scroll to one-off section and open modal
          const section = document.querySelector('[data-one-off-section]');
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="floating-action"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus size={24} />
      </motion.button>

      <BottomNav />
    </div>
  );
}