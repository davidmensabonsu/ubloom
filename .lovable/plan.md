

## Plan: Add Optional Specific Time to Habits

### Approach

The cleanest way is to add an **optional** `scheduledTime` field (e.g. `"08:30"`) to each habit. This keeps the existing Morning/Midday/Evening grouping as the primary organizer, but lets users optionally pin a specific time within that group. Habits with a time set would display it as a subtle label, and sort earlier-to-later within their time-of-day section.

### What Changes

**1. Data model** — Add `scheduledTime?: string` (HH:mm format) to the `CoreHabit` interface in `userStore.ts`.

**2. Add Task dialog** — Add an optional time picker input below the time-of-day selector. A small clock button toggles a native `<input type="time">` field. Leaving it blank means no specific time (current behavior).

**3. Edit Habit dialog** — Same time picker added to `EditHabitDialog.tsx` so users can set/change/remove the time on existing habits.

**4. CoreHabitsSection display** — Within each Morning/Midday/Evening group, habits with a `scheduledTime` sort chronologically, followed by habits without one. The time displays as a small muted label (e.g. "8:30 AM") next to the habit title.

### Files to Edit

| File | Change |
|------|--------|
| `src/stores/userStore.ts` | Add `scheduledTime?: string` to `CoreHabit` |
| `src/components/routine/AddTaskDialog.tsx` | Add optional time picker input |
| `src/components/routine/EditHabitDialog.tsx` | Add optional time picker input |
| `src/components/routine/CoreHabitsSection.tsx` | Display time label, sort by time within groups |

