import { useState } from 'react';
import { useUserStore, TimeOfDay, HabitFrequency } from '@/stores/userStore';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun, Clock, Moon, Timer } from 'lucide-react';
import { Search } from 'lucide-react';
import { taskIconOptions, iconCategories, renderTaskIcon, getTaskIcon } from '@/lib/taskIcons';
import FrequencyPicker from '@/components/routine/FrequencyPicker';
import { getLocalDateStr } from '@/lib/dateUtils';

const timeOptions: { value: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { value: 'morning', label: 'Morning', icon: Sun },
  { value: 'midday', label: 'Midday', icon: Clock },
  { value: 'evening', label: 'Evening', icon: Moon },
];

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTaskDialog({ open, onOpenChange }: AddTaskDialogProps) {
  const { profile, setCoreHabits } = useUserStore();
  const [title, setTitle] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [icon, setIcon] = useState(taskIconOptions[0].id);
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [iconSearch, setIconSearch] = useState('');

  const reset = () => {
    setTitle('');
    setTimeOfDay('morning');
    setIcon(taskIconOptions[0].id);
    setFrequency('daily');
    setSpecificDays([]);
    setShowTimePicker(false);
    setScheduledTime('');
    setIconSearch('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newHabit: any = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      timeOfDay,
      icon,
      frequency,
      ...(scheduledTime ? { scheduledTime } : {}),
    };

    if (frequency === 'specific-days') {
      newHabit.specificDays = specificDays;
    }
    if (frequency === 'one-off') {
      newHabit.oneOffDate = getLocalDateStr();
    }

    setCoreHabits([...profile.coreHabits, newHabit]);
    reset();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl">Add to-do</DrawerTitle>
          <DrawerDescription className="text-muted-foreground text-sm">
            Add a new item to your to-do list
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-5 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To-do name</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read for 20 minutes"
              className="rounded-xl"
              maxLength={100}
            />
          </div>

          {/* Icon */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Icon</label>
            {iconCategories.map((category) => (
              <div key={category.label} className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium">{category.label}</span>
                <div className="flex flex-wrap gap-2">
                  {category.iconIds.map((id) => {
                    const opt = getTaskIcon(id);
                    if (!opt) return null;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setIcon(opt.id)}
                        className={`transition-all ${
                          icon === opt.id
                            ? 'ring-2 ring-primary ring-offset-2'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        title={opt.label}
                      >
                        <div>
                          {renderTaskIcon(opt, 20)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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

          {/* Specific time (optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Specific time</label>
              <button
                onClick={() => {
                  setShowTimePicker(!showTimePicker);
                  if (showTimePicker) setScheduledTime('');
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all ${
                  showTimePicker
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Timer size={14} strokeWidth={2.5} />
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

        </div>

        <DrawerFooter>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full rounded-2xl py-6 text-base font-semibold"
          >
            Add to-do
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
