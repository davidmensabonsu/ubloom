

## Plan: Color the Section Icons with the App's Primary Color

### What changes
The Sun, Clock, and Moon icons in both `CoreHabitsSection.tsx` and `CustomTasksSection.tsx` currently use static Tailwind color classes (`text-amber-500`, `text-sky-500`, `text-indigo-500`). We will update them to use the app's primary color instead.

### Files to change

**`src/components/routine/CoreHabitsSection.tsx`**
- Update `timeOfDayConfig` to remove the per-section color classes and use `text-primary` for all three icons.

**`src/components/routine/CustomTasksSection.tsx`**
- Same change: replace the individual color classes in `timeOfDayConfig` with `text-primary`.

**`src/components/routine/RoutineSetup.tsx`**
- Same change for consistency across the setup screen.

### Result
All section icons (Sun, Clock, Moon) will render in the app's primary theme color instead of amber/sky/indigo.

