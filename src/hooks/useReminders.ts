 import { useEffect, useCallback, useRef } from 'react';
 import { getLocalDateStr } from '@/lib/dateUtils';
 import { useUserStore, TimeOfDay } from '@/stores/userStore';
 import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
 import { toast } from 'sonner';
 
 const timeOfDayLabels: Record<TimeOfDay, string> = {
   morning: '🌅 Good morning!',
   midday: '☀️ Midday check-in!',
   evening: '🌙 Evening reminder!',
 };
 
export function useReminders() {
  const { profile, markReminderSent, isHabitCompletedToday } = useUserStore();
  
  // Safe defaults for users with old persisted data (and partial nested objects)
  const defaultTimes = { morning: '08:00', midday: '12:00', evening: '20:00' };
  const reminderSettingsFromProfile = profile.reminderSettings as any;

  const reminderSettings = {
    enabled: reminderSettingsFromProfile?.enabled ?? false,
    times: { ...defaultTimes, ...(reminderSettingsFromProfile?.times ?? {}) },
    lastNotified: { ...(reminderSettingsFromProfile?.lastNotified ?? {}) },
  };

  const coreHabits = profile.coreHabits ?? [];

  // Track which individual habit reminders we've already sent today (habitId:date)
  const sentHabitRemindersRef = useRef<Set<string>>(new Set());
 
   const requestPermission = useCallback(async () => {
     if (!('Notification' in window)) {
       toast.error('Notifications not supported in this browser');
       return false;
     }
 
     if (Notification.permission === 'granted') {
       return true;
     }
 
     if (Notification.permission !== 'denied') {
       const permission = await Notification.requestPermission();
       return permission === 'granted';
     }
 
     toast.error('Notifications are blocked. Please enable them in browser settings.');
     return false;
   }, []);
 
   const sendNotification = useCallback((title: string, body: string, tag: string) => {
     if (Notification.permission !== 'granted') return;
 
     try {
       new Notification(title, {
         body,
         icon: '/favicon.ico',
         badge: '/favicon.ico',
         tag,
         requireInteraction: false,
       });
 
       toast(title, {
         description: body,
         duration: 5000,
       });
     } catch (error) {
       toast(title, {
         description: body,
         duration: 5000,
       });
     }
   }, []);
 
   const checkAndNotify = useCallback(() => {
     if (!reminderSettings.enabled) return;
 
     const now = new Date();
     const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
     const today = getLocalDateStr(now);
 
     // --- Time-of-day group reminders (existing) ---
     const timesOfDay: TimeOfDay[] = ['morning', 'midday', 'evening'];
 
     timesOfDay.forEach((tod) => {
       const reminderTime = reminderSettings.times[tod];
       const lastNotified = reminderSettings.lastNotified[tod];
 
       if (currentTime === reminderTime && lastNotified !== today) {
         const incompleteHabits = coreHabits
           .filter((h) => h.timeOfDay === tod && !isHabitCompletedToday(h.id) && isHabitScheduledForDate(h, today))
           .map((h) => h.title);
 
         if (incompleteHabits.length > 0) {
           sendNotification(
             timeOfDayLabels[tod],
             `You have ${incompleteHabits.length} ${tod} habit${incompleteHabits.length > 1 ? 's' : ''} to complete`,
             `habit-reminder-${tod}`
           );
           markReminderSent(tod);
         }
       }
     });

     // --- Individual habit scheduled-time reminders ---
     coreHabits.forEach((habit) => {
       if (!habit.scheduledTime) return;
       if (!isHabitScheduledForDate(habit, today)) return;
       if (isHabitCompletedToday(habit.id)) return;

       const key = `${habit.id}:${today}`;
       if (sentHabitRemindersRef.current.has(key)) return;

       if (currentTime === habit.scheduledTime) {
         const h = parseInt(habit.scheduledTime.split(':')[0]);
         const m = parseInt(habit.scheduledTime.split(':')[1]);
         const ampm = h >= 12 ? 'PM' : 'AM';
         const h12 = h % 12 || 12;
         const timeStr = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;

         sendNotification(
           `⏰ Time for: ${habit.title}`,
           `Scheduled for ${timeStr}`,
           `habit-time-${habit.id}`
         );
         sentHabitRemindersRef.current.add(key);
       }
     });
   }, [reminderSettings, coreHabits, isHabitCompletedToday, sendNotification, markReminderSent]);
 
   // Check every minute
   useEffect(() => {
     if (!reminderSettings.enabled) return;
 
     checkAndNotify();
 
     const interval = setInterval(checkAndNotify, 60000);
 
     return () => clearInterval(interval);
   }, [reminderSettings.enabled, checkAndNotify]);

   // Reset sent habit reminders at midnight
   useEffect(() => {
     const lastDateRef = getLocalDateStr();
     const midnightCheck = setInterval(() => {
       const currentDate = getLocalDateStr();
       if (currentDate !== lastDateRef) {
         sentHabitRemindersRef.current.clear();
       }
     }, 60000);
     return () => clearInterval(midnightCheck);
   }, []);
 
   return {
     requestPermission,
     isSupported: 'Notification' in window,
     permissionStatus: typeof window !== 'undefined' && 'Notification' in window 
       ? Notification.permission 
       : 'denied',
   };
 }