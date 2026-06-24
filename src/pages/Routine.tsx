import { motion } from 'framer-motion';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
import { Plus } from 'lucide-react';
import plantImg from '@/assets/icons/plant.png';
import glassWaterImg from '@/assets/icons/glass-water.png';
import yogaImg from '@/assets/icons/yoga.png';
import pencilImg from '@/assets/icons/pencil.png';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import CoreHabitsSection from '@/components/routine/CoreHabitsSection';
import AddTaskDialog from '@/components/routine/AddTaskDialog';
import { useCallback } from 'react';
import WeeklyProgress from '@/components/routine/WeeklyProgress';
import CelebrationOverlay from '@/components/routine/CelebrationOverlay';

import { useReminders } from '@/hooks/useReminders';
import { isDespiaNative } from '@/hooks/useReminders';
import { Switch } from '@/components/ui/switch';
import PastDayView from '@/components/routine/PastDayView';
import FutureDayView from '@/components/routine/FutureDayView';
import UndoRoutineBanner from '@/components/routine/UndoRoutineBanner';
import { parse, format } from 'date-fns';
import { useTypewriter } from '@/hooks/useTypewriter';
import {
  enableRoutineWidget,
  refreshRoutineWidget,
  getStoredWidgetEnabled,
} from '@/lib/enableRoutineWidget';


export default function Routine() {
   const { profile, setCoreHabits, completeRoutineSetup, isHabitCompletedToday, ensureDailySnapshots } = useUserStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const today = getLocalDateStr();
  const [viewDate, setViewDate] = useState<string>(today);
  const [widgetEnabled, setWidgetEnabled] = useState(() => getStoredWidgetEnabled());
  const isPast = viewDate < today;
  const isFuture = viewDate > today;
  const typedTitle = useTypewriter('Your Routine', 45, 200);

  // Capture a snapshot of any past days before the user views them.
  useEffect(() => {
    ensureDailySnapshots();
  }, [ensureDailySnapshots]);
  
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
   const todayScheduled = coreHabits.filter((h) => isHabitScheduledForDate(h, today));
   const completedCount = todayScheduled.filter((h) => isHabitCompletedToday(h.id)).length;
   const allCompleted = todayScheduled.length > 0 && completedCount === todayScheduled.length;
 
    // Calculate streak (same logic as WeeklyProgress)
    const calculateStreak = () => {
      if (coreHabits.length === 0) return 0;
      const habitCompletions = profile.habitCompletions || [];
      let currentStreak = 0;
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
  
      for (let i = 0; i <= 365; i++) {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateStr(date);

        // Only count habits that were scheduled for this specific date
        const scheduledForDay = coreHabits.filter((h) => isHabitScheduledForDate(h, dateStr));
        if (scheduledForDay.length === 0) continue; // skip days with nothing scheduled

        const scheduledIds = new Set(scheduledForDay.map((h) => h.id));
        const dayCompletions = habitCompletions.filter(
          (c) => c.date === dateStr && c.completed && scheduledIds.has(c.habitId)
        );

        const completionRate = dayCompletions.length / scheduledForDay.length;

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

   const handleWidgetToggle = (enabled: boolean) => {
     setWidgetEnabled(enabled);
     void enableRoutineWidget(enabled);
   };
 
   // Initialize reminders hook
    useReminders();

  // Refresh the widget token on every Routine open so the SVG stays current
  // and the token lifetime exposure stays short.
  useEffect(() => {
    void refreshRoutineWidget();
  }, []);

  const headerDateFormatted = isPast || isFuture
    ? format(parse(viewDate, 'yyyy-MM-dd', new Date()), 'EEEE, d MMM')
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

  const currentMood = profile.moodHistory[0]?.moods[0] || 'peaceful';

  return (
    <div className="min-h-screen gradient-background pb-24">
       {/* Celebration Overlay */}
       <CelebrationOverlay
         show={celebration.show}
         type={celebration.type}
         streakDays={celebration.streakDays}
         onComplete={handleCelebrationComplete}
       />

      {/* Header — hero gradient */}
      <div className="hero-gradient px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-white/85"
          >
            {headerDateFormatted}
          </motion.p>
          <ProfileButton />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title text-white"
        >
          {typedTitle}
          <span className="inline-block w-[2px] h-[0.9em] bg-white/80 ml-0.5 align-middle animate-[pulse_1s_ease-in-out_infinite]" />
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mt-2"
        >
          <span className="text-sm text-white/85">Feeling</span>
          <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/25">
            {currentMood}
          </span>
        </motion.div>
      </div>

      {isDespiaNative() && (
        <div className="mx-4 mb-4 p-4 bg-white/80 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#2d1b2e]">Home Screen Widget</p>
            <p className="text-xs text-[#9c7a8b] mt-0.5">Show your routine on your iPhone home screen</p>
          </div>
          <Switch checked={widgetEnabled} onCheckedChange={handleWidgetToggle} />
        </div>
      )}

      {/* Content */}
      <div className="px-5 space-y-6">
        {/* Weekly Progress & Streak */}
        <WeeklyProgress selectedDate={viewDate} onSelectDate={setViewDate} />

        {/* Undo most recent Ubi routine change */}
        {!isPast && <UndoRoutineBanner />}

        {/* Core Daily Habits — live today, snapshot for past, preview for future */}
        {isPast ? (
          <PastDayView dateStr={viewDate} />
        ) : isFuture ? (
          <FutureDayView dateStr={viewDate} />
        ) : (
          <CoreHabitsSection />
        )}

        {/* Empty state when no habits (today only) */}
        {!isPast && !isFuture && (!profile.coreHabits || profile.coreHabits.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-3xl p-8 text-center space-y-4"
          >
            <motion.div
              className="w-14 h-14 mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img src={plantImg} alt="Plant" className="w-full h-full object-contain clay-icon" />
            </motion.div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Build your to-do list
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Start by adding to-dos that matter to you. Small, consistent steps lead to big transformations.
            </p>
            <motion.button
              onClick={() => setShowAddTask(true)}
              className="soft-button inline-flex items-center gap-2 mx-auto"
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={18} />
              <span>Add your first to-do</span>
            </motion.button>

            {/* Suggestion cards */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground/60 font-medium">Popular to-dos</p>
              {[
                { img: glassWaterImg, title: 'Drink a glass of water' },
                { img: yogaImg, title: 'Morning meditation' },
                { img: pencilImg, title: 'Gratitude journaling' },
              ].map((suggestion) => (
                <motion.div
                  key={suggestion.title}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <img src={suggestion.img} alt={suggestion.title} className="w-8 h-8 object-contain clay-icon" />
                  <span className="text-sm text-muted-foreground">{suggestion.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}



      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        defaultOneOffDate={isFuture ? viewDate : undefined}
      />

      {/* Floating Action Button */}
       {!isPast && <motion.button
        onClick={() => setShowAddTask(true)}
        className="floating-action"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>}

      <BottomNav />
    </div>
  );
}