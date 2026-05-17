## Ubi Routine Planning Integration — Build Plan

A premium-only conversational flow inside the Ubi chat that lets Ubi build a structured routine and write it straight to the Routine page. Everything lives within the existing Ubi page — no new routes, no new pages, no changes to the Routine page itself.

### High-level approach

Instead of hard-coding 5 question steps in the client (which fights the natural conversational tone of Ubi), the planning flow is driven by **the LLM itself**, with the client only doing three things:

1. **Detecting** when a planning conversation is active (intent or chip).
2. **Rendering tap-options** when Ubi emits a structured marker.
3. **Parsing the final `<routine_plan>` JSON** block and turning it into real to-dos in the store.

This keeps the chat warm and personal (per memory: grounded "self-talk" tone) instead of feeling like a form.

### File-by-file changes

**1. `supabase/functions/ubi-chat/index.ts`** — extend the system prompt only.
- Add a "Routine Planning Mode" section. Triggers: user taps the "Plan my routine" chip (we send a sentinel `[SYSTEM: ROUTINE_PLANNING_FLOW]` prefix the same way the existing welcome opener does) **or** any of the natural-language phrases listed in the brief.
- Inside the mode, Ubi must:
  - Ask the 5 scripted questions one at a time, in Ubi's voice, referencing `primaryFocusArea` / `lifeStage` naturally.
  - For Step 1, emit a marker `<options>Daily routine|Weekly plan|Monthly reset|All three</options>` at the end of the message. Free-tier responses skip the JSON-emitting final step.
  - After Step 5, generate the plan and append a `<routine_plan>[…JSON…]</routine_plan>` block, then close warmly.
  - If `isPremium` is false in `userContext`, never emit `<routine_plan>` — instead deliver the scripted free-tier message.
- Pass the full icon name list (from `taskIconOptions`) into the system prompt so Ubi picks valid icons.
- `userContext` now carries `isPremium` (added on the client).
- Deploy via the existing autodeploy.

**2. `src/lib/routinePlanParser.ts`** *(new)*
- `parseOptions(content)` → `string[] | null` from `<options>…</options>`
- `parseRoutinePlan(content)` → `RoutinePlanTask[] | null` from `<routine_plan>…</routine_plan>`
- `stripMarkers(content)` so the markers never render in the bubble

**3. `src/hooks/useRoutinePlanner.ts`** *(new)*
- Local UI state: `mode: 'idle' | 'planning' | 'awaiting_approval' | 'awaiting_duplicate' | 'done'`, `pendingPlan`, `duplicates`
- `addTasksToRoutine(tasks, duplicateMode)` — calls `addCoreHabit` for each task (mapping `recurrence`+`days` → `frequency`/`specificDays`, `time` → `reminderTime`, `icon` → existing taskIcon id with fallback)
- `findDuplicates(tasks, existingHabits)` — case-insensitive title similarity (Levenshtein ≥ 0.8 or shared keyword)
- Fires `track('ubi_routine_plan_created', …)` analytics event

**4. `src/pages/Ubi.tsx`** — UI integration
- Add a 4th preset chip "Plan my routine ◆" with rose border (`border-rose-300 bg-rose-50/40`), sent message: `"I'd like help planning my routine"` (prefixed with the `[SYSTEM: ROUTINE_PLANNING_FLOW]` marker so the edge function locks into the mode).
- After each assistant message: render parsed `<options>` as inline tap chips, and parsed `<routine_plan>` as **two rose buttons** ("Looks good, add to my routine" / "I'd like to change something").
- "Looks good" handler:
  - If free → triggers `UpgradeModal` (already imported via `useSubscription`).
  - If premium → runs duplicate check; either shows the 3 duplicate-resolution buttons or writes immediately.
- After write: confirmation message + "Go to Routine →" navigation button.
- Hide the original preset chips when in planning mode to avoid clutter.

**5. Free-tier gating**
- Reuse `useSubscription().isActive` (premium or trialing).
- The chip itself is visible to everyone (so they discover the feature). The gate fires only when the user taps "Looks good, add to my routine".
- Free-tier branch also triggers `<UpgradeModal source="ubi_routine_plan">` (existing component, no changes needed).

### Technical details

- Tasks are written via the existing `coreHabits` store (per `mem://features/routine/todo-list` — `customTasks` is deprecated). Mapping:
  - `recurrence: "daily"` → `frequency: "daily"`
  - `recurrence: "weekly" + days:[...]` → `frequency: "specific-days"`, `specificDays: [0–6]`
  - `recurrence: "one-off"` → `frequency: "one-off"`, `oneOffDate: today`
- `icon` from the LLM is matched against `taskIconOptions[].id`; unknown icons fall back to a sensible default (`'star'`).
- Cloud sync is automatic via `useCloudSync` — no extra calls needed.
- Analytics event uses the existing `track()` helper (already validates `page` + `source`).

### Out of scope (per the brief)

- No Routine page changes
- No changes to chat code paths for non-planning messages
- No new Supabase tables (analytics_events already exists)
- No edits to `useSubscription` or the upgrade modal

### Open question

The brief says "small rose border" — I'll use `border-rose-300/80` + a `◆` glyph in primary rose to keep it on-brand with the existing pink/rose accent. If you want a different accent (e.g. gold), say the word and I'll swap it.
