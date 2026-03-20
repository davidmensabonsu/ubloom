import { useState } from 'react';
import { useUserStore, TimeOfDay } from '@/stores/userStore';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sun, Clock, Moon } from 'lucide-react';
import { taskIconOptions, iconCategories, renderTaskIcon, getTaskIcon } from '@/lib/taskIcons';

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

  const reset = () => {
    setTitle('');
    setTimeOfDay('morning');
    setIcon(taskIconOptions[0].id);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newHabit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      timeOfDay,
      icon,
    };

    setCoreHabits([...profile.coreHabits, newHabit]);
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
                        <div className="icon-3d">
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
