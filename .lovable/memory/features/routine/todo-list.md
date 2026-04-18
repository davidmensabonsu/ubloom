---
name: To-do list (formerly Daily Habits)
description: Core habits and custom tasks have been merged into a single unified to-do list concept across store, UI, and copy
type: feature
---
There is now ONE concept for daily items: "to-do list" (user-facing) backed by `coreHabits: CoreHabit[]` in the store (internal name kept).

- `CustomTask` is deprecated — type kept only so the persisted-state `merge()` migration can read legacy localStorage / cloud-sync data and convert old custom tasks into `CoreHabit` rows (recurrence `weekly` → `frequency: 'specific-days'`, `oneoff` → `'one-off'`).
- All custom-task store actions (`addCustomTask`, `removeCustomTask`, `toggleCustomTaskCompletion`, `isCustomTaskCompletedToday`, `getVisibleCustomTasks`, `reorderCustomTasks`) and the `customTasks` field have been removed from the store interface.
- `CustomTasksSection.tsx` was deleted. `CoreHabitsSection.tsx` is the single source of truth for the list (still uses dnd-kit drag-to-reorder).
- User-facing copy: "Daily Habits" → "To-do list", "Add Habit" → "Add to-do", "Habits done" (Profile) → "To-dos done", celebration "All habits completed today!" → "All to-dos done today!", walkthrough Routine subtitle updated, RoutineSetup heading updated.
- Internal naming (`coreHabits`, `CoreHabit`, `toggleHabitCompletion`, `track('habit_completed')`) intentionally preserved for analytics continuity and to avoid breaking the cloud-sync schema.
