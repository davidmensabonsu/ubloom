

## Custom Tasks Section

Add a new "My Tasks" section below Core Daily Habits on the Routine page, allowing users to create custom tasks with three recurrence types.

### Task Types

1. **Daily** -- repeats every single day
2. **Weekly** -- repeats on selected days of the week (e.g., Mon, Wed, Fri)
3. **One-off** -- scheduled for a specific day (today, tomorrow, or any day of the current week)

### How It Works

- A new "My Tasks" section appears below the existing "Daily Habits" section
- Tapping "Add Task" opens a bottom sheet / dialog with:
  - Task title input
  - Time of day picker (Morning / Midday / Evening)
  - Recurrence type selector (Daily, Weekly, One-off)
  - If Weekly: day-of-week multi-select chips (Mon-Sun)
  - If One-off: day picker showing today through end of current week
- Tasks appear in their respective time-of-day groups, interleaved or in a separate section below core habits
- Tasks can be checked off, edited, and deleted
- One-off tasks auto-hide after their date passes
- The FAB (+) button will open this new Add Task dialog instead of the current inline input

### Technical Details

| Area | Change |
|------|--------|
| **`src/stores/userStore.ts`** | Add a new `CustomTask` interface with fields: `id`, `title`, `timeOfDay`, `icon` (emoji), `recurrence` (`'daily' | 'weekly' | 'oneoff'`), `weeklyDays` (optional `number[]` for 0=Sun..6=Sat), `scheduledDate` (optional `string` for one-off), `createdAt`. Add `customTasks: CustomTask[]` to `UserProfile`. Add store actions: `addCustomTask`, `removeCustomTask`, `toggleCustomTaskCompletion`, `isCustomTaskCompletedToday`. Reuse the existing `habitCompletions` array (with task IDs prefixed `custom-`) to track daily completion state. |
| **`src/components/routine/AddTaskDialog.tsx`** | New component. A Drawer (vaul) containing the task creation form: title input, time-of-day radio group, recurrence type selector, conditional day pickers. Uses existing UI primitives (Input, RadioGroup, Button, Drawer). |
| **`src/components/routine/CustomTasksSection.tsx`** | New component. Renders custom tasks grouped by time of day, filtered to only show tasks relevant to today (daily tasks always show, weekly tasks on matching days, one-off tasks on their scheduled date). Includes check-off, edit mode with delete, similar styling to CoreHabitsSection. |
| **`src/pages/Routine.tsx`** | Import and render `CustomTasksSection` below `CoreHabitsSection`. Update FAB to open the new `AddTaskDialog` instead of dispatching `open-add-task`. |
| **`src/components/routine/CoreHabitsSection.tsx`** | Remove the inline "add task" input and the old `open-add-task` event listener since the FAB now opens the new dialog. Keep the existing one-off `routineTasks` rendering for backward compatibility. |

### Visibility Logic

A custom task shows on a given day if:
- **Daily**: always visible
- **Weekly**: `new Date().getDay()` is in `weeklyDays`
- **One-off**: `scheduledDate === today` (formatted as `yyyy-MM-dd`)

Completion tracking reuses the existing `habitCompletions` array with a `custom-` prefix on IDs to distinguish from core habits.
