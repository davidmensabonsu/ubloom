## Goal

Add a **"Plan tomorrow"** option alongside the existing "Plan today" / "Plan my routine" chips in Ubi, so the user can quickly ask Ubi to build a one‑off plan for tomorrow without typing.

Tomorrow planning already works under the hood — `routinePlanParser` supports `startsOn`, `useRoutinePlanner.plannedToHabit` honours it, `FutureDayView` can preview future days, and `ubi-chat` already detects "from tomorrow" phrasing and emits `startsOn`. We just need a clean entry point and to make sure the resulting plan lands on tomorrow only (not today).

## What changes

### 1. New chip in `src/pages/Ubi.tsx`
- Add `handlePlanTomorrowChip()` next to `handlePlanTodayChip()`. It sends:
  - hidden prompt: `[SYSTEM: ROUTINE_PLANNING_FLOW] I'd like to plan just for tomorrow`
  - `displayContent: "Plan tomorrow"`
- Stores a daily "used" flag in localStorage (`ubi-plan-tomorrow-used-${todayKey}`) so the chip hides for the rest of the day after one use, matching "Plan today".
- Render a third chip card under the "Plan today" block, only when:
  - no `confirmation` open,
  - the conversation has no user messages yet,
  - `ubi-has-made-first-plan === '1'` (same gating as "Plan today"),
  - today's used flag is not set.

### 2. Edge function prompt tweak in `supabase/functions/ubi-chat/index.ts`
Extend the existing today-only fast-path block so it also handles a **tomorrow-only** intent:
- Detect `[SYSTEM: ROUTINE_PLANNING_FLOW] ... plan just for tomorrow` or natural phrases ("plan tomorrow", "plan just for tomorrow", "plan my day for tomorrow").
- Treat it like "Just today" but route every task as `recurrence: "one-off"` with `startsOn` = tomorrow's date (yyyy-MM-dd, computed from `userContext.todayDate` or `new Date()`).
- Skip the 5‑step flow; go straight to a short "what shape should tomorrow take?" question, then emit:
  ```
  <routine_plan>
  { "action": "add", "scope": "today", "startsOn": "<tomorrow>",
    "tasks": [ { …, "recurrence": "one-off", "startsOn": "<tomorrow>" } ] }
  </routine_plan>
  ```
- Add a small clarifying note in the prompt that for tomorrow-only plans, `startsOn` must be set on **both** the top-level plan and each task (parser already supports the per-task fallback, but being explicit avoids the AI defaulting to today).

### 3. `PlanPreviewCard` header copy
`PlanPreviewCard` currently shows `"Starting {startsOn} — today stays the same"` only when `action === 'add'` && `scope === 'ongoing'` (via `isFutureStart`). Loosen this so a one-off `add` plan with `startsOn = tomorrow` also gets a "Tomorrow's plan" header instead of falsely listing today's existing tasks:
- Treat any `add` plan with `startsOn > today` as `isFutureStart`, regardless of scope.
- When `isFutureStart`, header shows `"Tomorrow's plan"` if `startsOn === tomorrow`, else `"Starting {pretty date}"`.
- Suppress the `existingTodayTasks` preview block in that case (already the behaviour when `isFutureStart` is true).

### 4. Routine view sanity
No code change needed — `isHabitScheduledForDate` already honours `startsOn`, so one-offs created with `startsOn = tomorrow` show up on the Future Day view and not today. Verified via the existing `FutureDayView` flow.

## Files touched

- `src/pages/Ubi.tsx` — new handler + chip render block
- `supabase/functions/ubi-chat/index.ts` — prompt addition for tomorrow-only fast path
- `src/components/ubi/PlanPreviewCard.tsx` — header copy & `isFutureStart` widened

No DB migration, no store/schema changes.

## Open question

When the user taps **"Plan tomorrow"** and Ubi asks the shaping question, should Ubi:
- **A)** Generate a one-off plan for tomorrow only (recommended — mirrors "Plan today"), or
- **B)** Offer to make tomorrow's plan repeatable ("want me to keep this for the rest of the week too?") after the first draft?

I'll go with **A** unless you'd prefer B.
