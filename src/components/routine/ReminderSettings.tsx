import { motion } from 'framer-motion';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Clock, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useReminders } from '@/hooks/useReminders';

export default function ReminderSettings() {
  const { profile, updateReminderSettings } = useUserStore();
  const { requestPermission } = useReminders();

  // Safe defaults for older persisted profiles (and partial nested objects)
  const defaultTimes = { morning: '08:00', midday: '12:00', evening: '20:00' };
  const reminderSettingsFromProfile = profile.reminderSettings as {
    enabled?: boolean;
    times?: Partial<Record<TimeOfDay, string>>;
  } | undefined;

  const enabled = reminderSettingsFromProfile?.enabled ?? false;
  const times = { ...defaultTimes, ...(reminderSettingsFromProfile?.times ?? {}) };

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      updateReminderSettings({ enabled: false });
      return;
    }
    const granted = await requestPermission();
    if (!granted) {
      toast.error('Notifications are turned off for uBloom. Enable them in Settings to get reminders.');
      return;
    }
    updateReminderSettings({ enabled: true });
    toast.success("Reminders on — we'll nudge you about your tasks.");
  };

  const handleTimeChange = (timeOfDay: TimeOfDay, time: string) => {
    updateReminderSettings({ times: { ...times, [timeOfDay]: time } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5"
    >
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bell size={16} className="text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Task reminders</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get nudged about your routine, even when the app is closed
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggle} />
      </div>

      {/* Time settings */}
      {enabled && (
        <div className="space-y-3 mt-4 pt-4 border-t border-border/60">
          {[
            { key: 'morning' as const, label: 'Morning' },
            { key: 'midday' as const, label: 'Midday' },
            { key: 'evening' as const, label: 'Evening' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <Clock size={14} strokeWidth={2.5} className="text-muted-foreground" />
                <input
                  type="time"
                  value={times[key]}
                  onChange={(e) => handleTimeChange(key, e.target.value)}
                  className="bg-muted rounded-lg px-3 py-1.5 text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground leading-snug">
            Tasks with their own time are reminded at that exact time. Morning, midday and
            evening tasks get one gentle reminder at the times above.
          </p>
        </div>
      )}
    </motion.div>
  );
}
