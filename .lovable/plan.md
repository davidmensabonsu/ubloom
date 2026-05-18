## Goal
Let users create a "just for today" plan on the Ubi page, alongside the existing daily / weekly / monthly plan types, and surface a "Plan today" preset pill every day once they've made their first plan.

## 1. Add "Today" as a plan type in the routine planning flow

**File:** `supabase/functions/ubi-chat/index.ts` (Routine Planning Mode prompt)

- Update Step 1 options marker to include Today:
  `<options>Just today|Daily routine|Weekly plan|Monthly reset|All three</options>`
- Add rule: when the user picks "Just today", every task in the `<routine_plan>` JSON must use `"recurrence": "one-off"` (and an empty `days` array). The existing parser/planner already maps `one-off` to today's date, so no DB or parser changes are needed.
- Mention "today" / "plan my day" as trigger phrases that enter Routine Planning Mode.

## 2. New "Plan today" preset pill on Ubi

**File:** `src/pages/Ubi.tsx`

State / storage keys (localStorage, per user device — consistent with the existing `ubi-plan-routine-used` flag):
- `ubi-has-made-first-plan` — set to `'1'` the first time `writePlan` successfully writes any tasks.
- `ubi-plan-today-used-<YYYY-MM-DD>` — set to `'1'` when the user taps the "Plan today" pill (uses `getLocalDateStr()`).

Visibility rules for the pill (rendered in the same fixed bottom area as the existing "Plan my routine" chip, just above the horizontal preset list):
- Hide if there's a `confirmation` banner showing.
- Hide if the user has not yet made any plan (`ubi-has-made-first-plan !== '1'`).
- Hide if it has already been used today (`ubi-plan-today-used-<today> === '1'`).
- Hide once the user has sent any message in the current conversation (matches the existing "Plan my routine" chip behaviour, so it only appears at the start of a fresh chat).

Behaviour on tap (new handler, mirrors `handlePlanRoutineChip`):
- Guard on `isStreaming` and `canUse('ubi_chat')`.
- Set the today-used flag in localStorage.
- `incrementUbiMessageCount()`.
- `sendMessage("[SYSTEM: ROUTINE_PLANNING_FLOW] I'd like to plan just for today", { displayContent: "Plan today" })` so the edge function jumps into Routine Planning Mode and naturally steers toward the "Just today" option.

## 3. Persist "first plan ever made" flag

**File:** `src/pages/Ubi.tsx` — inside `writePlan`, after the successful `planner.writeTasks(...)` call, set `localStorage.setItem('ubi-has-made-first-plan', '1')`. This is what gates the daily "Plan today" pill from ever appearing until the user has completed at least one plan of any type.

## Out of scope
- No schema changes; `recurrence: 'one-off'` is already supported and stored as today's date.
- No changes to the existing "Plan my routine" chip behaviour.
- No analytics / Pro-gating changes beyond the existing `ubi_chat` guard.