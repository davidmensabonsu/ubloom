import { motion } from 'framer-motion';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Plus } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import RoutineSetup from '@/components/routine/RoutineSetup';
import CoreHabitsSection from '@/components/routine/CoreHabitsSection';
import CustomTasksSection from '@/components/routine/CustomTasksSection';
import AddTaskDialog from '@/components/routine/AddTaskDialog';
import { useCallback } from 'react';
import WeeklyProgress from '@/components/routine/WeeklyProgress';
import CelebrationOverlay from '@/components/routine/CelebrationOverlay';
import ReminderSettings from '@/components/routine/ReminderSettings';
import { useReminders } from '@/hooks/useReminders';

export default function Routine() {
   const { profile, skipRoutineSetup, isHabitCompletedToday } = useUserStore();
  const [showSetup, setShowSetup] = useState(!profile.routineSetupComplete);
  const [showAddTask, setShowAddTask] = useState(false);
  
   const [celebration, setCelebration] = useState<{
     show: boolean;
     type: 'all-complete' | 'streak-milestone';
     streakDays?: number;
   }>({ show: false, type: 'all-complete' });
   
   // Track previous completion state to detect transitions
   const prevAllCompletedRef = useRef(false);
   const celebratedStreaksRef = useRef<Set<number>>(new Set());
 
   // Calculate completion status
   const coreHabits = profile.coreHabits || [];
   const completedCount = coreHabits.filter((h) => isHabitCompletedToday(h.id)).length;
   const allCompleted = coreHabits.length > 0 && completedCount === coreHabits.length;
 
    // Calculate streak (same logic as WeeklyProgress)
    const calculateStreak = () => {
      if (coreHabits.length === 0) return 0;
      const habitCompletions = profile.habitCompletions || [];
      const coreHabitIds = new Set(coreHabits.map((h) => h.id));
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      for (let i = 0; i <= 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateStr(date);

       const dayCompletions = habitCompletions.filter(
         (c) => c.date === dateStr && c.completed && coreHabitIds.has(c.habitId)
       );

       const effectiveTotal = Math.max(coreHabits.length, dayCompletions.length);
       const completionRate = effectiveTotal > 0 ? dayCompletions.length / effectiveTotal : 0;

       if (completionRate >= 0.5) {
         currentStreak++;
       } else if (i > 0) {
         break;
       }
     }
 
     return currentStreak;
   };
 
   const streak = calculateStreak();
   const streakMilestones = [3, 7, 14, 30, 60, 90, 180, 365];
 
   // Trigger celebrations
   useEffect(() => {
     // All habits completed celebration
     if (allCompleted && !prevAllCompletedRef.current) {
       setCelebration({ show: true, type: 'all-complete' });
     }
     prevAllCompletedRef.current = allCompleted;
   }, [allCompleted]);
 
   useEffect(() => {
     // Streak milestone celebration
     if (streakMilestones.includes(streak) && !celebratedStreaksRef.current.has(streak)) {
       celebratedStreaksRef.current.add(streak);
       // Delay slightly if all-complete is also showing
       const delay = celebration.show ? 3500 : 0;
       setTimeout(() => {
         setCelebration({ show: true, type: 'streak-milestone', streakDays: streak });
       }, delay);
     }
   }, [streak]);
 
   const handleCelebrationComplete = () => {
     setCelebration({ show: false, type: 'all-complete' });
   };
 
   // Initialize reminders hook
    useReminders();
    // Listen for open-habit-setup event from CoreHabitsSection empty state
    useEffect(() => {
      const handler = () => setShowSetup(true);
      window.addEventListener('open-habit-setup', handler);
      return () => window.removeEventListener('open-habit-setup', handler);
    }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const currentMood = profile.moodHistory[0]?.moods[0] || 'peaceful';

  // Show setup flow for first-time users or when editing habits
  if (showSetup) {
    return (
      <RoutineSetup
        onComplete={() => {
          setShowSetup(false);
        }}
        onSkip={() => {
          skipRoutineSetup();
          setShowSetup(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen gradient-background pb-24">
       {/* Celebration Overlay */}
       <CelebrationOverlay
         show={celebration.show}
         type={celebration.type}
         streakDays={celebration.streakDays}
         onComplete={handleCelebrationComplete}
       />
 
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            {todayFormatted}
          </motion.p>
          <ProfileButton />
        </div>
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
        <CoreHabitsSection />

        {/* Custom Tasks */}
        <CustomTasksSection />

 
         {/* Reminder Settings */}
         <div className="pt-2">
           <h2 className="section-title mb-3">Settings</h2>
           <ReminderSettings />
         </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog open={showAddTask} onOpenChange={setShowAddTask} />

      {/* Floating Action Button */}
       <motion.button
        onClick={() => setShowAddTask(true)}
        className="floating-action"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      <BottomNav />
    </div>
  );
}