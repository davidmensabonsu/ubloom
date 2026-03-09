import { useState } from 'react';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun, Clock, Moon, CalendarDays, Repeat, RotateCcw } from 'lucide-react';
import { taskIconOptions } from '@/lib/taskIcons';

const timeOptions: { value: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'midday', label: 'Midday', icon: Clock },
  { value: 'evening', label: 'Evening', icon: Moon },
];

const recurrenceOptions = [
  { value: 'daily' as const, label: 'Every day', icon: Repeat },
  { value: 'weekly' as const, label: 'Weekly', icon: CalendarDays },
  { value: 'oneoff' as const, label: 'One-off', icon: RotateCcw },
];

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



function getUpcomingDays(): { label: string; date: string; dayIndex: number }[] {
  const days: { label: string; date: string; dayIndex: number }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = getLocalDateStr(d);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayLabels[d.getDay()];
    days.push({ label, date: dateStr, dayIndex: d.getDay() });
  }
  return days;
}

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const { addCustomTask } = useUserStore();
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'oneoff'>('daily');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [icon, setIcon] = useState('✨');

  const upcomingDays = getUpcomingDays();

  const toggleWeeklyDay = (day: number) => {
    setWeeklyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const reset = () => {
    setTitle('');
    setTimeOfDay('morning');
    setRecurrence('daily');
    setWeeklyDays([]);
    setScheduledDate('');
    setIcon('✨');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (recurrence === 'weekly' && weeklyDays.length === 0) return;
    if (recurrence === 'oneoff' && !scheduledDate) return;

    addCustomTask({
      title: title.trim(),
      timeOfDay,
      icon,
      recurrence,
      ...(recurrence === 'weekly' ? { weeklyDays } : {}),
      ...(recurrence === 'oneoff' ? { scheduledDate } : {}),
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl">Add Task</DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-sm">
            Create a new task for your routine
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-5 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Task name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read for 20 minutes"
              className="rounded-xl"
              maxLength={100}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    icon === emoji
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Time of day */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time of day</label>
            <div className="flex gap-2">
              {timeOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeOfDay(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      timeOfDay === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Frequency</label>
            <div className="flex gap-2">
              {recurrenceOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setRecurrence(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      recurrence === opt.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly day picker */}
          {recurrence === 'weekly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Which days?</label>
              <div className="flex gap-1.5">
                {dayLabels.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleWeeklyDay(idx)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                      weeklyDays.includes(idx)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* One-off date picker */}
          {recurrence === 'oneoff' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Which day?</label>
              <div className="flex flex-wrap gap-2">
                {upcomingDays.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setScheduledDate(day.date)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      scheduledDate === day.date
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={
              !title.trim() ||
              (recurrence === 'weekly' && weeklyDays.length === 0) ||
              (recurrence === 'oneoff' && !scheduledDate)
            }
            className="w-full rounded-2xl py-6 text-base font-semibold"
          >
            Add Task
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
