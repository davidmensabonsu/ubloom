

## Fix Weekly Progress Bar Accuracy

### Problem

Two bugs cause past days' progress bars to show incorrectly:

1. **Timezone mismatch**: Habit completions are saved using UTC dates (`toISOString()`), but the weekly chart looks up dates using local time (`date-fns format()`). For anyone west of UTC, an evening completion on Tuesday gets stored as Wednesday, so Tuesday's bar stays empty.

2. **Shifting denominator**: The chart always divides by the *current* number of core habits. If you had 3 habits on Tuesday (all completed) but later added a 4th, Tuesday shows as 75% instead of 100%.

### Solution

**1. Standardize all date handling to local time**

Create a shared helper function `getLocalDateStr()` that formats dates using local timezone consistently. Replace every `new Date().toISOString().split('T')[0]` call in the store with this helper.

| Location | Change |
|----------|--------|
| `src/lib/dateUtils.ts` | New file with `getLocalDateStr(date?: Date)` helper |
| `src/stores/userStore.ts` | Replace all 6 occurrences of `toISOString().split('T')[0]` with `getLocalDateStr()` |

**2. Fix the weekly progress calculation**

For each past day, instead of using `coreHabits.length` as the denominator, count only completions that match current core habit IDs (excluding custom task completions). For the denominator, use the greater of: the current core habit count or the number of distinct core habit completions for that day. This way, if all habits that existed on a past day were completed, the bar shows 100%.

| Location | Change |
|----------|--------|
| `src/components/routine/WeeklyProgress.tsx` | Filter completions to only core habit IDs. For past days, set `totalHabits = max(coreHabits.length, completedCoreHabits)` so a fully-completed past day always shows 100%. Apply the same logic in the streak calculation. |

### Technical Details

**New helper** (`src/lib/dateUtils.ts`):
```
export function getLocalDateStr(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**WeeklyProgress fix** -- key logic change in the `weekData` loop:
- Get set of current core habit IDs
- For each day, count only completions whose `habitId` is in that set
- For past days: `totalHabits = Math.max(coreHabits.length, completedCoreHabits)`
- For today: `totalHabits = coreHabits.length` (standard)

**Store fix** -- straightforward find-and-replace of the date pattern across 6 call sites in `userStore.ts`.

