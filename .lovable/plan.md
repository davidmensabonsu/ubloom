

## Plan: Add Accessible "Choose Habits" Option to Routine Page

### Problem
The habit selection setup screen only appears on first visit. Once dismissed (via skip or completion), there's no visible way to re-open it to choose or change core habits.

### Changes

**`src/components/routine/CoreHabitsSection.tsx`**
- Add a "Customize Habits" button that appears when edit mode is active (alongside the existing reorder/delete controls).
- This button dispatches the existing `open-habit-setup` custom event, which the Routine page already listens for to re-open the full RoutineSetup screen.
- Place it at the bottom of the Daily Habits section as a dashed-border button (matching the existing "Add Custom Habit" pattern from RoutineSetup).

**`src/components/routine/RoutineSetup.tsx`**
- Pre-select the user's existing `coreHabits` when re-opening setup, so they see their current selections and can modify them rather than starting from scratch.

### Behavior
1. User taps the pencil (edit) icon in "Daily Habits" header.
2. A "Customize Habits" button appears at the bottom of the habits list.
3. Tapping it opens the full habit selection screen with current habits pre-selected.
4. Saving updates their habits; canceling returns to the routine.

