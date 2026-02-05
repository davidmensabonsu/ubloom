 import { useEffect, useCallback } from 'react';
 import { useUserStore, TimeOfDay } from '@/stores/userStore';
 import { toast } from 'sonner';
 
 const timeOfDayLabels: Record<TimeOfDay, string> = {
   morning: '🌅 Good morning!',
   midday: '☀️ Midday check-in!',
   evening: '🌙 Evening reminder!',
 };
 
 export function useReminders() {
   const { profile, markReminderSent, isHabitCompletedToday } = useUserStore();
   const { reminderSettings, coreHabits } = profile;
 
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
 
   const sendNotification = useCallback((timeOfDay: TimeOfDay, habits: string[]) => {
     if (Notification.permission !== 'granted') return;
 
     const title = timeOfDayLabels[timeOfDay];
     const body = habits.length > 0
       ? `You have ${habits.length} ${timeOfDay} habit${habits.length > 1 ? 's' : ''} to complete`
       : 'Time to check your habits!';
 
     try {
       new Notification(title, {
         body,
         icon: '/favicon.ico',
         badge: '/favicon.ico',
         tag: `habit-reminder-${timeOfDay}`,
         requireInteraction: false,
       });
 
       // Also show in-app toast
       toast(title, {
         description: body,
         duration: 5000,
       });
     } catch (error) {
       // Fallback to toast only
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
     const today = now.toISOString().split('T')[0];
 
     const timesOfDay: TimeOfDay[] = ['morning', 'midday', 'evening'];
 
     timesOfDay.forEach((tod) => {
       const reminderTime = reminderSettings.times[tod];
       const lastNotified = reminderSettings.lastNotified[tod];
 
       // Check if it's time and we haven't notified today
       if (currentTime === reminderTime && lastNotified !== today) {
         // Get incomplete habits for this time of day
         const incompleteHabits = coreHabits
           .filter((h) => h.timeOfDay === tod && !isHabitCompletedToday(h.id))
           .map((h) => h.title);
 
         if (incompleteHabits.length > 0) {
           sendNotification(tod, incompleteHabits);
           markReminderSent(tod);
         }
       }
     });
   }, [reminderSettings, coreHabits, isHabitCompletedToday, sendNotification, markReminderSent]);
 
   // Check every minute
   useEffect(() => {
     if (!reminderSettings.enabled) return;
 
     // Check immediately on mount
     checkAndNotify();
 
     const interval = setInterval(checkAndNotify, 60000); // Check every minute
 
     return () => clearInterval(interval);
   }, [reminderSettings.enabled, checkAndNotify]);
 
   return {
     requestPermission,
     isSupported: 'Notification' in window,
     permissionStatus: typeof window !== 'undefined' && 'Notification' in window 
       ? Notification.permission 
       : 'denied',
   };
 }