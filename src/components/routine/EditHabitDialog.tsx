import { useState } from 'react';
import { CoreHabit, TimeOfDay, HabitFrequency } from '@/stores/userStore';
import { taskIconOptions, getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';
import { Sun, Clock, Moon, Sparkles, Timer, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FrequencyPicker from '@/components/routine/FrequencyPicker';

const timeOptions: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '☀️' },
  { value: 'midday', label: 'Midday', emoji: '🌤️' },
  { value: 'evening', label: 'Evening', emoji: '🌙' },
];

interface EditHabitDialogProps {
  habit: CoreHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (habitId: string, updates: Partial<Omit<CoreHabit, 'id'>>) => void;
}

export default function EditHabitDialog({ habit, open, onOpenChange, onSave }: EditHabitDialogProps) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [iconSearch, setIconSearch] = useState('');

  // Sync state when habit changes
  const [lastHabitId, setLastHabitId] = useState<string | null>(null);
  if (habit && habit.id !== lastHabitId) {
    setTitle(habit.title);
    setIcon(habit.icon || 'sparkles');
    setTimeOfDay(habit.timeOfDay);
    setFrequency(habit.frequency || 'daily');
    setSpecificDays(habit.specificDays || []);
    setScheduledTime(habit.scheduledTime || '');
    setShowTimePicker(!!habit.scheduledTime);
    setLastHabitId(habit.id);
    setIconSearch('');
  }
  if (!habit && lastHabitId) {
    setLastHabitId(null);
  }

  const handleSave = () => {
    if (!habit || !title.trim()) return;
    const updates: Partial<Omit<CoreHabit, 'id'>> = { title: title.trim(), icon, timeOfDay, frequency, scheduledTime: scheduledTime || undefined };
    if (frequency === 'specific-days') updates.specificDays = specificDays;
    if (frequency === 'one-off') updates.oneOffDate = habit.oneOffDate;
    onSave(habit.id, updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Edit to-do</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To-do name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-2xl bg-muted border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none text-sm"
            />
          </div>

          {/* Time of Day */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Time of day</label>
            <div className="flex gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeOfDay(opt.value)}
                  className={`mood-pill text-xs flex-1 ${timeOfDay === opt.value ? 'selected' : ''}`}
                >
                  {opt.emoji}
                  <span className="capitalize">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icon</label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {taskIconOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setIcon(opt.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    icon === opt.id
                      ? 'bg-primary/20 ring-2 ring-primary text-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                  title={opt.label}
                >
                  {renderTaskIcon(opt, 18)}
                </button>
              ))}
            </div>
          </div>

          {/* Specific time (optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Specific time</label>
              <button
                onClick={() => {
                  setShowTimePicker(!showTimePicker);
                  if (showTimePicker) setScheduledTime('');
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition-all ${
                  showTimePicker
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Timer size={12} strokeWidth={2.5} />
                {showTimePicker ? 'Remove' : 'Add time'}
              </button>
            </div>
            {showTimePicker && (
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none text-sm"
              />
            )}
          </div>

          {/* Frequency */}
          <FrequencyPicker
            frequency={frequency}
            specificDays={specificDays}
            onFrequencyChange={setFrequency}
            onSpecificDaysChange={setSpecificDays}
          />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="w-full soft-button flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
