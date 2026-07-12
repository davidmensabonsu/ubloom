import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { getLocalDateStr } from '@/lib/dateUtils';
import { isHabitScheduledForDate } from '@/components/routine/FrequencyPicker';
import type { CoreHabit, TimeOfDay } from '@/stores/userStore';

// Reminders must be handed to iOS ahead of time so they fire while the app is
// closed. We reschedule the whole horizon on every relevant change (habits,
// completions, settings, app foregrounded), so each schedule only needs to
// cover the days until the user plausibly opens the app again. iOS caps
// pending local notifications at 64, which also argues for a short horizon.
const HORIZON_DAYS = 3;
const MAX_NOTIFICATIONS = 60;
const STREAK_REMINDER_TIME = '20:30';

const BUCKET_TITLES: Record<TimeOfDay, string> = {
  morning: 'Good morning 🌅',
  midday: 'Midday check-in ☀️',
  evening: 'Evening wind-down 🌙',
};
const BUCKET_BODY = 'A gentle nudge to complete your tasks — small steps, big blooms 🌸';

export const isCapacitorNative = () => Capacitor.isNativePlatform();

export async function requestReminderPermission(): Promise<boolean> {
  if (!isCapacitorNative()) return false;
  const { display } = await LocalNotifications.requestPermissions();
  return display === 'granted';
}

function dateAt(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const d = new Date(day);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function format12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`;
}

export interface SyncRemindersArgs {
  enabled: boolean;
  habits: CoreHabit[];
  times: Record<TimeOfDay, string>;
  isCompletedToday: (habitId: string) => boolean;
}

export async function syncNativeReminders({ enabled, habits, times, isCompletedToday }: SyncRemindersArgs): Promise<void> {
  if (!isCapacitorNative()) return;

  // Always start from a clean slate so completed/deleted tasks never fire.
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
  }

  if (!enabled || habits.length === 0) return;
  const { display } = await LocalNotifications.checkPermissions();
  if (display !== 'granted') return;

  const now = new Date();
  const notifications: LocalNotificationSchema[] = [];
  let id = 1;
  const push = (title: string, body: string, at: Date) => {
    if (at <= now || notifications.length >= MAX_NOTIFICATIONS) return;
    notifications.push({
      id: id++,
      title,
      body,
      schedule: { at, allowWhileIdle: true },
      extra: { route: '/routine' },
    });
  };

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);
    const dateStr = getLocalDateStr(day);
    const isToday = offset === 0;
    const dayHabits = habits.filter((h) => isHabitScheduledForDate(h, dateStr));
    if (dayHabits.length === 0) continue;

    // Specific-time tasks: name the task at its scheduled time.
    for (const habit of dayHabits) {
      if (!habit.scheduledTime) continue;
      if (isToday && isCompletedToday(habit.id)) continue;
      push(`⏰ Time for: ${habit.title}`, `Scheduled for ${format12(habit.scheduledTime)}`, dateAt(day, habit.scheduledTime));
    }

    // Morning/midday/evening buckets: one generic streak-style nudge each.
    for (const tod of ['morning', 'midday', 'evening'] as TimeOfDay[]) {
      const bucket = dayHabits.filter((h) => h.timeOfDay === tod && !h.scheduledTime);
      if (bucket.length === 0) continue;
      if (isToday && bucket.every((h) => isCompletedToday(h.id))) continue;
      push(BUCKET_TITLES[tod], BUCKET_BODY, dateAt(day, times[tod] || '12:00'));
    }

    // End-of-day streak reminder if anything is still open.
    if (!(isToday && dayHabits.every((h) => isCompletedToday(h.id)))) {
      push(
        "Don't break your streak 🌸",
        'You still have tasks today — bloom before the day ends!',
        dateAt(day, STREAK_REMINDER_TIME),
      );
    }
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
}
