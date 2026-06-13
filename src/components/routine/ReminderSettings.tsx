 import { motion } from 'framer-motion';
 import { useUserStore } from '@/stores/userStore';
import { Clock } from 'lucide-react';
 
export default function ReminderSettings() {
  const { profile, updateReminderSettings } = useUserStore();

  // Safe defaults for older persisted profiles (and partial nested objects)
  const defaultTimes = { morning: '08:00', midday: '12:00', evening: '20:00' };
  const reminderSettingsFromProfile = profile.reminderSettings as any;

  const reminderSettings = {
    enabled: reminderSettingsFromProfile?.enabled ?? false,
    times: { ...defaultTimes, ...(reminderSettingsFromProfile?.times ?? {}) },
    lastNotified: { ...(reminderSettingsFromProfile?.lastNotified ?? {}) },
  };

   const handleTimeChange = (timeOfDay: 'morning' | 'midday' | 'evening', time: string) => {
     updateReminderSettings({
       times: {
         ...reminderSettings.times,
         [timeOfDay]: time,
       },
     });
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="glass-card rounded-3xl p-5"
     >
      {/* Time settings */}
      <div className="space-y-3">
           {[
             { key: 'morning' as const, label: '🌅 Morning', icon: '☀️' },
             { key: 'midday' as const, label: '☀️ Midday', icon: '🌤️' },
             { key: 'evening' as const, label: '🌙 Evening', icon: '🌙' },
           ].map(({ key, label }) => (
             <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} strokeWidth={2.5} className="text-muted-foreground" />
                 <input
                   type="time"
                   value={reminderSettings.times[key]}
                   onChange={(e) => handleTimeChange(key, e.target.value)}
                   className="bg-muted rounded-lg px-3 py-1.5 text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
                 />
               </div>
             </div>
           ))}
      </div>
     </motion.div>
   );
 }