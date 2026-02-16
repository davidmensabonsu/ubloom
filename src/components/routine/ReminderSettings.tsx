 import { motion } from 'framer-motion';
 import { useUserStore } from '@/stores/userStore';
 import { useReminders } from '@/hooks/useReminders';
 import { Bell, BellOff, Clock } from 'lucide-react';
 import { Switch } from '@/components/ui/switch';
 import { toast } from 'sonner';
 
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

  const { requestPermission, isSupported, permissionStatus } = useReminders();
 
   const handleToggle = async (enabled: boolean) => {
     if (enabled) {
       const granted = await requestPermission();
       if (!granted) {
         toast.error('Please allow notifications to enable reminders');
         return;
       }
     }
     updateReminderSettings({ enabled });
     toast.success(enabled ? 'Reminders enabled!' : 'Reminders disabled');
   };
 
   const handleTimeChange = (timeOfDay: 'morning' | 'midday' | 'evening', time: string) => {
     updateReminderSettings({
       times: {
         ...reminderSettings.times,
         [timeOfDay]: time,
       },
     });
   };
 
   if (!isSupported) {
     return (
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="glass-card rounded-3xl p-5"
       >
         <div className="flex items-center gap-3 text-muted-foreground">
           <BellOff size={18} strokeWidth={2.5} />
           <p className="text-sm">Notifications not supported in this browser</p>
         </div>
       </motion.div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="glass-card rounded-3xl p-5"
     >
       {/* Header with toggle */}
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3">
           <div className={`p-2 rounded-xl ${reminderSettings.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
              <Bell size={18} strokeWidth={2.5} className={reminderSettings.enabled ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Daily Reminders</h3>
             <p className="text-xs text-muted-foreground">
               {permissionStatus === 'denied' 
                 ? 'Blocked in browser settings' 
                 : 'Get notified when it\'s time'}
             </p>
           </div>
         </div>
         <Switch
           checked={reminderSettings.enabled}
           onCheckedChange={handleToggle}
           disabled={permissionStatus === 'denied'}
         />
       </div>
 
       {/* Time settings */}
       {reminderSettings.enabled && (
         <motion.div
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: 'auto' }}
           exit={{ opacity: 0, height: 0 }}
           className="space-y-3 pt-3 border-t border-border"
         >
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
         </motion.div>
       )}
     </motion.div>
   );
 }