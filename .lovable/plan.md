

## Improve Visual Weight and Readability on the Routine Page

A typography and icon weight refinement -- no layout, spacing, color, or structural changes.

### What will change

**1. Section titles** (`section-title` class in `src/index.css`)
- Change from `font-medium` (400-weight display font) to `font-semibold` so headings like "Daily Habits" and "Settings" read as clearly bold.

**2. Page title** (`page-title` class in `src/index.css`)
- Change from `font-normal` to `font-medium` for a slightly bolder page header ("Your Routine").

**3. Task / habit text** (in `CoreHabitsSection.tsx`)
- Change habit and task labels from `text-sm` to `text-sm font-medium` so they read as medium-bold.

**4. Time-of-day sub-headers** (e.g., "Morning", "Midday", "Evening" in `CoreHabitsSection.tsx`)
- Change from `font-medium text-sm` to `font-semibold text-sm` for stronger subsection labels.

**5. Reminder setting labels** (in `ReminderSettings.tsx`)
- "Daily Reminders" h3: change from `font-medium text-sm` to `font-semibold text-sm`.
- Time-of-day labels (Morning/Midday/Evening): add `font-medium` to their `text-sm`.

**6. Text contrast boost**
- Change `--muted-foreground` from `30 10% 50%` to `30 10% 40%` in `src/index.css` -- a subtle darkening of secondary text (dates, counters, helper text) for improved readability without harshness.

**7. Icon visual weight**
- Increase Lucide icon `strokeWidth` from the default 2 to 2.5 on all routine-page icons (Sun, Clock, Moon, Settings2, Plus, Check, Flame, TrendingUp, Bell, BellOff, X) to make them appear more solid and defined.
- Time-of-day icon colors: strengthen from pastel to slightly deeper tones (`text-amber-500` stays, `text-sky-500` stays, `text-indigo-400` becomes `text-indigo-500`).

### Files to modify

| File | Changes |
|------|---------|
| `src/index.css` | Bump `section-title` to `font-semibold`, `page-title` to `font-medium`, darken `--muted-foreground` |
| `src/components/routine/CoreHabitsSection.tsx` | Add `font-medium` to habit/task text, `font-semibold` to sub-headers, `strokeWidth={2.5}` on all icons |
| `src/components/routine/WeeklyProgress.tsx` | `strokeWidth={2.5}` on Flame and TrendingUp icons |
| `src/components/routine/ReminderSettings.tsx` | `font-semibold` on h3, `font-medium` on labels, `strokeWidth={2.5}` on Bell/BellOff/Clock icons |
| `src/pages/Routine.tsx` | `strokeWidth={2.5}` on Plus icon |

