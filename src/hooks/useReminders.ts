import { useEffect, useCallback, useRef } from "react";
import { getLocalDateStr } from "@/lib/dateUtils";
import { useUserStore, TimeOfDay } from "@/stores/userStore";
import { isHabitScheduledForDate } from "@/components/routine/FrequencyPicker";
import { toast } from "sonner";

const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: "Good morning!",
  midday: "Midday check-in!",
  evening: "Evening reminder!",
};

interface DespiaLocalPush {
  schedule: (options: { title: string; body: string; id?: string; scheduleAt?: Date }) => Promise<void>;
  requestPermission?: () => Promise<"granted" | "denied" | "prompt">;
  checkPermissions?: () => Promise<{ receive?: "granted" | "denied" | "prompt" }>;
}

interface DespiaRuntime {
  LocalPush: DespiaLocalPush;
}

declare global {
  interface Window {
    Despia?: DespiaRuntime;
    despia?: string;
  }
}

const getDespiaPush = (): DespiaLocalPush | undefined => window.Despia?.LocalPush;
const isDespiaRuntime = () => typeof window !== "undefined" && !!getDespiaPush();
export const isDespiaNative = (): boolean =>
  typeof window !== "undefined" && /despia/i.test(navigator.userAgent);

export function useReminders() {
  const { profile, markReminderSent, isHabitCompletedToday } = useUserStore();

  // Safe defaults for users with old persisted data (and partial nested objects)
  const defaultTimes = { morning: "08:00", midday: "12:00", evening: "20:00" };
  const reminderSettingsFromProfile = profile.reminderSettings as any;

  const reminderSettings = {
    enabled: reminderSettingsFromProfile?.enabled ?? false,
    times: { ...defaultTimes, ...(reminderSettingsFromProfile?.times ?? {}) },
    lastNotified: { ...(reminderSettingsFromProfile?.lastNotified ?? {}) },
  };

  const coreHabits = profile.coreHabits ?? [];

  // Track which individual habit reminders we've already sent today (habitId:date)
  const sentHabitRemindersRef = useRef<Set<string>>(new Set());
  // Track which 30-min heads-up reminders we've already sent today (habitId:date)
  const sentUpcomingRemindersRef = useRef<Set<string>>(new Set());

  const HEADS_UP_MINUTES = 30;

  const requestPermission = useCallback(async () => {
    if (isDespiaNative()) return true;

    const despia = getDespiaPush();
    if (despia) {
      try {
        if (despia.requestPermission) {
          const result = await despia.requestPermission();
          return result === "granted";
        }
        const permissions = await despia.checkPermissions?.();
        return permissions?.receive === "granted";
      } catch (error) {
        toast.error("Could not enable Despia push notifications");
        return false;
      }
    }

    if (!("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    toast.error("Notifications are blocked. Please enable them in browser settings.");
    return false;
  }, []);

  const sendNotification = useCallback((title: string, body: string, tag: string) => {
    const despia = getDespiaPush();
    if (despia) {
      despia.schedule({ title, body, id: tag }).catch(() => {
        toast(title, { description: body, duration: 5000 });
      });
      toast(title, { description: body, duration: 5000 });
      return;
    }

    if (Notification.permission !== "granted") return;

    try {
      if (isDespiaNative()) {
        const encodedTitle = encodeURIComponent(title);
        const encodedBody = encodeURIComponent(body);
        window.despia = `sendlocalpushmsg://?title=${encodedTitle}&body=${encodedBody}&tag=${tag}`;
      } else {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag,
          requireInteraction: false,
        });
      }

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
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const today = getLocalDateStr(now);

    // --- Time-of-day group reminders (existing) ---
    const timesOfDay: TimeOfDay[] = ["morning", "midday", "evening"];

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
            `You have ${incompleteHabits.length} ${tod} habit${incompleteHabits.length > 1 ? "s" : ""} to complete`,
            `habit-reminder-${tod}`,
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

      const [hStr, mStr] = habit.scheduledTime.split(":");
      const h = parseInt(hStr);
      const m = parseInt(mStr);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      const timeStr = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;

      // 30-minute heads-up reminder
      const upcomingKey = `${habit.id}:${today}:upcoming`;
      if (!sentUpcomingRemindersRef.current.has(upcomingKey)) {
        const scheduledDate = new Date(now);
        scheduledDate.setHours(h, m, 0, 0);
        const headsUpDate = new Date(scheduledDate.getTime() - HEADS_UP_MINUTES * 60000);
        const headsUpTime = `${headsUpDate.getHours().toString().padStart(2, "0")}:${headsUpDate.getMinutes().toString().padStart(2, "0")}`;

        // Only fire if heads-up time is on the same day (avoid weird negative times like 00:15 → -00:15)
        if (currentTime === headsUpTime && headsUpDate.getDate() === now.getDate()) {
          sendNotification(
            `⏰ Coming up: ${habit.title}`,
            `In ${HEADS_UP_MINUTES} minutes — scheduled for ${timeStr}`,
            `habit-upcoming-${habit.id}`,
          );
          sentUpcomingRemindersRef.current.add(upcomingKey);
        }
      }

      // Exact-time reminder
      const key = `${habit.id}:${today}`;
      if (sentHabitRemindersRef.current.has(key)) return;

      if (currentTime === habit.scheduledTime) {
        sendNotification(`⏰ Time for: ${habit.title}`, `Scheduled for ${timeStr}`, `habit-time-${habit.id}`);
        sentHabitRemindersRef.current.add(key);
      }
    });
  }, [reminderSettings, coreHabits, isHabitCompletedToday, sendNotification, markReminderSent]);

  // Check every minute + reset sent habit reminders at midnight
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    checkAndNotify();
    let lastDate = getLocalDateStr();

    const interval = setInterval(() => {
      const currentDate = getLocalDateStr();
      if (currentDate !== lastDate) {
        sentHabitRemindersRef.current.clear();
        sentUpcomingRemindersRef.current.clear();
        lastDate = currentDate;
      }
      checkAndNotify();
    }, 60000);

    return () => clearInterval(interval);
  }, [reminderSettings.enabled, checkAndNotify]);

  useEffect(() => {
    if (!reminderSettings.enabled) return;
    const now = new Date();
    const target = new Date();
    target.setHours(20, 30, 0, 0);
    const msUntil = target.getTime() - now.getTime();
    if (msUntil <= 0) return;
    const tid = setTimeout(() => {
      const today = getLocalDateStr();
      const todaysHabits = (profile.coreHabits ?? []).filter(h => isHabitScheduledForDate(h, today));
      const allDone = todaysHabits.every(h => isHabitCompletedToday(h.id));
      if (!allDone && todaysHabits.length > 0) {
        sendNotification(
          "Don't break your streak 🌸",
          "You haven't finished your routine today. Bloom before the day ends!",
          "streak-reminder-8pm"
        );
      }
    }, msUntil);
    return () => clearTimeout(tid);
  }, [reminderSettings.enabled, profile, isHabitCompletedToday, sendNotification]);

  return {
    requestPermission,
    isSupported: isDespiaRuntime() || "Notification" in window,
    permissionStatus: isDespiaRuntime()
      ? "prompt"
      : typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "denied",
  };
}
