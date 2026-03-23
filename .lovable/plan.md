

## Add Habit Frequency Selection

### What changes

When adding or editing a habit, users will see a new "Frequency" picker with these options:
- **Every day** (default, current behavior)
- **Specific days** — pick which days of the week (Mon, Tue, Wed, etc.)
- **One-off** — appears only today, then disappears

### Technical approach

**1. Extend `CoreHabit` interface in `userStore.ts`**

Add a `frequency` field:
```typescript
export type HabitFrequency = 'daily' | 'specific-days' | 'one-off';

export interface CoreHabit {
  id: string;
  title: string;
  timeOfDay: TimeOfDay;
  icon?: string;
  frequency?: HabitFrequency;       // defaults to 'daily'
  specificDays?: number[];           // 0=Sun, 1=Mon, ... 6=Sat
  oneOffDate?: string;               // yyyy-MM-dd for one-off habits
}
```

**2. Update `AddTaskDialog.tsx`**

Add a frequency selector section below "Time of day":
- Three pill buttons: Every day, Specific days, One-off
- When "Specific days" is selected, show 7 day-of-week toggle buttons (M T W T F S S)
- Save `frequency`, `specificDays`, and `oneOffDate` (auto-set to today) on the new habit

**3. Update `EditHabitDialog.tsx`**

Add the same frequency selector so users can change frequency on existing habits.

**4. Update `CoreHabitsSection.tsx`**

Filter habits shown today based on frequency:
- `daily` — always show
- `specific-days` — show only if today's day-of-week is in `specificDays`
- `one-off` — show only if `oneOffDate` matches today

Add a small label (like the existing "today only" tag) showing the frequency context (e.g., "Mon, Wed, Fri" or "one-off").

**5. Update streak/progress calculations in `Routine.tsx`**

Adjust the streak calculator to only count habits that were scheduled for each day, not all habits.

### Files to modify
- `src/stores/userStore.ts` — extend `CoreHabit` type
- `src/components/routine/AddTaskDialog.tsx` — add frequency picker UI
- `src/components/routine/EditHabitDialog.tsx` — add frequency picker UI
- `src/components/routine/CoreHabitsSection.tsx` — filter habits by frequency for today
- `src/pages/Routine.tsx` — adjust streak calculation for frequency-aware habits

