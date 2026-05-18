## The two problems

**1. Ubi misreads "from tomorrow" as "today too"**
When you say "except today, from tomorrow build a daily routine of X/Y/Z", Ubi creates daily habits with `createdDate = today` and `isHabitScheduledForDate` returns true for today, so the tasks appear today as well.

**2. You can't preview future days**
The week chart only goes back from today, and there's no view for tomorrow / next week. So you can't confirm that the new routine "lands" tomorrow.

---

## What we'll build

### A. Teach Ubi a "starts on" concept

Extend the `<routine_plan>` JSON with an optional per-task `startsOn` (YYYY-MM-DD) and a top-level `startsOn` default. Update Ubi's system prompt to detect phrases like:
- "from tomorrow", "starting tomorrow", "except today", "from Monday", "starting next week"

When detected on an `action: "add"`, `scope: "ongoing"` plan, every task gets `startsOn` set to that date (default tomorrow if user said "from tomorrow"/"except today").

If the user's phrasing is ambiguous ("build me a daily routine of X, Y, Z" without a date hint), Ubi asks one tap-option question:
> Start this routine today, or from tomorrow?
> `<options>Start today|Start tomorrow</options>`

### B. Honour `startsOn` in scheduling

- Add `startsOn?: string` to `CoreHabit`.
- `plannedToHabit` writes `startsOn` (and also uses it as `createdDate` so historic logic stays consistent).
- `isHabitScheduledForDate(h, dateStr)` returns `false` when `dateStr < (h.startsOn ?? h.createdDate)`. This single change stops a "from tomorrow" daily habit from showing up today.

### C. Future day viewing & editing on Routine page

- Let `WeeklyProgress` step forward (`weekOffset > 0`) up to +4 weeks. Future days in the bar chart render as empty bars with a small "upcoming" hint instead of a completion ratio.
- New `FutureDayView` component (mirrors `PastDayView` shape) used when `viewDate > today`:
  - Header: "Viewing {date} — preview"
  - Lists every habit where `isHabitScheduledForDate(habit, viewDate) === true`, computed live from `coreHabits` (no snapshot).
  - No check circles (you can't complete future days). Each row has a subtle "scheduled" pill.
  - Floating "+" stays visible for future days; tapping it opens `AddTaskDialog` pre-set to a one-off on `viewDate` (small prop addition: `defaultOneOffDate`).
- `Routine.tsx`: branch on `viewDate < today` → `PastDayView`, `viewDate > today` → `FutureDayView`, else live `CoreHabitsSection`. The Undo banner only shows when viewing today.

### D. Ubi preview card reflects the new behaviour

`PlanPreviewCard` already shows "today's projected list". When the plan has `startsOn` in the future:
- Header changes to "Your routine starting {date}" 
- Today's list is shown unchanged ("Today stays as-is")
- The new tasks render under the future date

### E. Memory & state plumbing

- `userStore.CoreHabit`: add `startsOn?: string`. No migration needed (undefined = behaves as before).
- `FrequencyPicker.isHabitScheduledForDate`: add the `startsOn`/`createdDate` floor check.
- `routinePlanParser`: extend `PlannedTask` and `RoutinePlan` with optional `startsOn`; parser defaults top-level `startsOn` onto each task that doesn't override it.
- `useRoutinePlanner.applyPlan`: pass `startsOn` through; for `add` + `ongoing` + `startsOn` in the future, do NOT snapshot today for undo using `clear` semantics — keep behaviour as a pure additive change.

---

## Technical notes (for reference)

Files touched:
- `supabase/functions/ubi-chat/index.ts` — prompt update only
- `src/lib/routinePlanParser.ts` — schema + parser
- `src/stores/userStore.ts` — `startsOn` on `CoreHabit`
- `src/components/routine/FrequencyPicker.tsx` — start-date floor in `isHabitScheduledForDate`
- `src/hooks/useRoutinePlanner.ts` — propagate `startsOn` in `plannedToHabit`
- `src/components/ubi/PlanPreviewCard.tsx` — future-start labelling
- `src/components/routine/WeeklyProgress.tsx` — allow forward navigation, render future bars
- `src/components/routine/FutureDayView.tsx` — new
- `src/components/routine/AddTaskDialog.tsx` — optional `defaultOneOffDate` prop
- `src/pages/Routine.tsx` — three-way view branch, FAB on future days

No database migration. No edge-function deploy needed beyond the prompt change.

---

## Open question before I build

When you're previewing a future day (say next Tuesday) and tap the "+" to add a task, should that task default to:
- **A one-off just for that specific day** (most common: "add yoga next Tuesday"), or
- **Open the normal Add Task dialog** so you can also pick daily/weekly recurrence starting that day?

My recommendation is the first — keep "+" on a future day scoped to a one-off for that day, and reserve recurring routine building for Ubi or today's "+". Happy to do the second instead.