

## Routine Page Flow Adjustments

### What changes

**1. Default habits when skipping setup**
When a user taps "Set Up Later" on the habit selection screen, instead of landing on an empty routine page, they'll get a small set of starter habits pre-populated across the three time periods:
- Morning: "Drink a glass of water", "Morning skincare"
- Midday: "Take a walk", "Drink water"
- Evening: "Journal or reflect", "Unplug from screens"

These give the user something to work with immediately while they decide on their own habits.

**2. More prominent one-off task adding**
The existing `+` button in each time section already supports adding one-off tasks for the day. To make this more discoverable, each empty section will show a subtle "Tap + to add a task for today" hint, and the floating action button at the bottom will scroll to and open the add-task input in the first available section.

### Technical details

| File | Change |
|------|--------|
| `src/stores/userStore.ts` | Update `skipRoutineSetup` to also call `setCoreHabits` with a default set of starter habits |
| `src/components/routine/CoreHabitsSection.tsx` | Add empty-state hint text in sections with no habits/tasks ("Tap + to add a task") |
| `src/pages/Routine.tsx` | Wire the floating `+` button to open the inline task input in the first section instead of scrolling to a non-existent element |

