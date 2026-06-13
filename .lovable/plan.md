## Remove notification toggle, keep time pickers

### Goal
Remove the "Enable notifications" toggle from the ReminderSettings UI while keeping the morning/midday/evening time pickers visible unconditionally.

### Changes
1. **src/components/routine/ReminderSettings.tsx**
   - Remove the `Switch` toggle and the header row that contains it (bell icon, title, subtitle).
   - Remove the conditional rendering (`reminderSettings.enabled && ...`) around the time pickers so they are always visible.
   - Optionally simplify: remove unused `handleToggle`, `permissionStatus`, and `isSupported` imports/variables from this component — the underlying `useReminders` hook remains untouched.

### What stays
- The `useReminders` hook and all reminder-scheduling logic (no backend changes).
- The time picker inputs and their `handleTimeChange` behavior.
- `updateReminderSettings` store updates when users change times.