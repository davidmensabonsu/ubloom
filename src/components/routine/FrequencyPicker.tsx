import { HabitFrequency } from '@/stores/userStore';
import { getLocalDateStr } from '@/lib/dateUtils';

const frequencyOptions: { value: HabitFrequency; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'specific-days', label: 'Specific days' },
  { value: 'one-off', label: 'One-off' },
];

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface FrequencyPickerProps {
  frequency: HabitFrequency;
  specificDays: number[];
  onFrequencyChange: (f: HabitFrequency) => void;
  onSpecificDaysChange: (days: number[]) => void;
}

export default function FrequencyPicker({
  frequency,
  specificDays,
  onFrequencyChange,
  onSpecificDaysChange,
}: FrequencyPickerProps) {
  const toggleDay = (day: number) => {
    if (specificDays.includes(day)) {
      onSpecificDaysChange(specificDays.filter((d) => d !== day));
    } else {
      onSpecificDaysChange([...specificDays, day].sort());
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Frequency</label>
      <div className="flex gap-2">
        {frequencyOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onFrequencyChange(opt.value)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
              frequency === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {frequency === 'specific-days' && (
        <div className="flex gap-1.5 pt-1">
          {dayLabels.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                specificDays.includes(i)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {frequency === 'one-off' && (
        <p className="text-xs text-muted-foreground">This habit will only appear today.</p>
      )}
    </div>
  );
}

/** Check if a habit should be visible on a given date */
export function isHabitScheduledForDate(
  habit: { frequency?: HabitFrequency; specificDays?: number[]; oneOffDate?: string; createdDate?: string; skippedDates?: string[]; startsOn?: string },
  dateStr: string,
): boolean {
  if ((habit.skippedDates || []).includes(dateStr)) return false;
  if (habit.startsOn && dateStr < habit.startsOn) return false;
  const freq = habit.frequency;
  // Tasks with no recurrence setting should only appear on the day they were
  // scheduled for (oneOffDate) or, if missing, the day they were created.
  if (!freq) {
    const anchor = habit.oneOffDate || habit.createdDate;
    return anchor ? anchor === dateStr : false;
  }
  if (freq === 'daily') return true;
  if (freq === 'one-off') {
    const anchor = habit.oneOffDate || habit.createdDate;
    return !!anchor && anchor === dateStr;
  }
  if (freq === 'specific-days') {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return (habit.specificDays || []).includes(date.getDay());
  }
  return false;
}

/** Get a short label for frequency display */
export function getFrequencyLabel(habit: { frequency?: HabitFrequency; specificDays?: number[]; oneOffDate?: string }): string | null {
  const freq = habit.frequency || 'daily';
  if (freq === 'daily') return null;
  if (freq === 'one-off') return 'one-off';
  if (freq === 'specific-days') {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (habit.specificDays || []).map((d) => names[d]).join(', ');
  }
  return null;
}
