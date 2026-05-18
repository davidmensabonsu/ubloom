## Goal

Give Ubi (Premium / trial) the ability to *modify* today's to-do list — not just append to it — and make the in-chat plan preview show what today will **actually** look like after the change.

Three supported actions:

1. **Add** — drop one or two extra tasks on top of today's existing list (current behaviour, kept).
2. **Replace today** — hide every recurring task scheduled for today and use only Ubi's new tasks for today. Recurring tasks (daily / specific-days) come back as normal tomorrow.
3. **Clear today** — wipe today's list. Recurring tasks return tomorrow.

Tasks marked `daily` or `weekly` in Ubi's plan are still saved as proper recurring habits and apply going forward; only the "for today" semantics change.

## How "remove for today only" works

Add a per-habit `skippedDates: string[]` (yyyy-MM-dd) to `CoreHabit`. `isHabitScheduledForDate` returns `false` if `dateStr` is in `skippedDates`. One-off habits whose `oneOffDate` is today get hard-deleted instead.

A new store action `clearHabitsForDate(date)`:
- pushes `date` into `skippedDates` of every habit that is currently scheduled for that date AND is not one-off,
- removes one-off habits whose `oneOffDate === date`.

A new store action `unskipHabitForDate(habitId, date)` for completeness (used when an "add" later wants to bring something back).

No data migration needed — undefined `skippedDates` is treated as empty.

## Ubi planning flow changes

### Intent detection (server prompt)

Extend the existing Routine Planning Mode section in `supabase/functions/ubi-chat/index.ts`:

- Detect three intents from the user's words:
  - **clear** — "clear my tasks", "wipe today", "remove everything for today".
  - **replace** — "plan just for today", "today I want to do X instead", "scrap today and do X", or any "just today" plan that conflicts in number/time with the existing daily routine.
  - **add** — "also add", "on top of my routine", "just add a run today", or a small (1–3) set of one-off additions.
- If ambiguous (user gives a sizeable just-today plan without saying replace vs add), Ubi must **ask one clarifying question** before emitting the plan:
  > "Want me to swap out today's usual routine for this, or add these on top of what's already there?"
  with `<options>Replace today|Add on top</options>`.

### Richer plan block

Augment `<routine_plan>` schema with a top-level wrapper so the action travels with the tasks:

```
<routine_plan>
{
  "action": "add" | "replace_today" | "clear_today",
  "scope": "today" | "ongoing",
  "tasks": [ {title, time, recurrence, days, icon, period}, ... ]
}
</routine_plan>
```

`clear_today` may have `tasks: []`. Backward-compat: if a bare array is received, treat it as `{action: "add", tasks: [...]}`.

Update `src/lib/routinePlanParser.ts` to parse both shapes and return `{ action, scope, tasks }`.

### Preview = the full resulting day

`PlanPreviewCard` is reworked to render **today's projected list** instead of only Ubi's new tasks. It receives:

- `existingTodayTasks` (from `coreHabits` filtered by `isHabitScheduledForDate(today)` minus already-skipped),
- `plannedTasks` (from Ubi),
- `action`.

Render logic:

- `add` → existing tasks (greyed "Already in your day" label) + new tasks (rose accent "Ubi is adding").
- `replace_today` → only new tasks, with a header chip "Replacing today's usual routine" and a small collapsed footer "X recurring tasks will be paused for today (back tomorrow)".
- `clear_today` → empty state "Today will be clear — recurring tasks return tomorrow."

CTA buttons stay: **Looks good, apply** + **I'd like to change something**. For `replace_today` and `clear_today` the apply button copy becomes "Apply to today only".

### Applying the plan

Extend `useRoutinePlanner.writeTasks` (or add `applyPlan`) to take `{ action, tasks }`:

- `add` → existing behaviour (with the existing duplicate prompt).
- `replace_today` → call `clearHabitsForDate(today)`, then add each `task` as a `one-off` habit dated today (regardless of the recurrence Ubi sent for that task's "just today" intent). Skip the duplicate prompt — it's a deliberate swap.
- `clear_today` → call `clearHabitsForDate(today)` only; don't add anything.

`Ubi.tsx#approvePlan` is updated to switch on `action` and feed the right path. Confirmation toast copy is updated per action.

## Files to touch

- `supabase/functions/ubi-chat/index.ts` — extend Routine Planning Mode prompt: intent detection, clarifying-question rule, new `<routine_plan>` JSON shape.
- `src/lib/routinePlanParser.ts` — parse new wrapper, keep legacy array fallback.
- `src/stores/userStore.ts` — add `skippedDates` to `CoreHabit`, update inline `isHabitScheduledForDateLocal`, add `clearHabitsForDate` / `unskipHabitForDate` actions.
- `src/components/routine/FrequencyPicker.tsx` — honour `skippedDates` in `isHabitScheduledForDate`.
- `src/hooks/useRoutinePlanner.ts` — accept `{action, tasks}`, implement replace/clear paths, force `recurrence: 'one-off'` for replace tasks.
- `src/components/ubi/PlanPreviewCard.tsx` — new preview that shows today's projected list with action-aware labelling.
- `src/pages/Ubi.tsx` — pass `existingTodayTasks` + `action` to `PlanPreviewCard`, branch `approvePlan` per action, update confirmation copy.

## Non-goals

- No new database tables; everything lives in the existing `user_data` JSONB blob via `coreHabits`.
- No changes for free-tier users — they still see the human-readable plan with no apply button.
- No retroactive editing of past days.
