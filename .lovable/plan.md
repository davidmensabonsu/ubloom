

## Plan: Add Timeframe to Goals

### Changes

**1. `src/stores/userStore.ts`** — Add `deadline` field to the `Goal` interface:
- Add optional `deadline?: string` (yyyy-MM-dd format) to the `Goal` type.

**2. `src/pages/Goals.tsx`** — Add date picker to the Add Goal modal and display deadlines:

- **Add Goal Modal**: Add a date picker button below the title input using a Popover + Calendar component. The user taps a button showing "Set a timeframe" or the selected date, and a calendar appears to pick a deadline. Pass the deadline when calling `addGoal`.
- **Goal list items**: Below each goal title, show the deadline as a subtle label (e.g., "By Mar 30, 2026") when set. Use `format` from `date-fns` for display.
- **Edit mode**: When editing a goal, allow changing the deadline via `updateGoal`.

### Technical Details

- Import `Calendar` from `@/components/ui/calendar`, `Popover`/`PopoverContent`/`PopoverTrigger` from `@/components/ui/popover`, `format` from `date-fns`, and `CalendarIcon` from `lucide-react`.
- Add `pointer-events-auto` class to the Calendar as required by the shadcn datepicker pattern.
- New state: `newGoalDeadline` (Date | undefined) for the add modal.
- The deadline is optional — users can add goals without one.

