

## AI-Generated Habit Icons and Bolder Text for the Routine Page

Two changes: replace emoji icons with cute AI-generated illustrations (like the reference image), and boost text/icon visual weight.

---

### Part 1: AI-Generated Habit Images

Each habit will get a unique, cute 3D-style illustration (similar to the pink dumbbells, bed, shower icons in the reference) instead of plain emoji text.

**How it works:**

- A new backend function `generate-habit-icon` calls the image generation model (`google/gemini-2.5-flash-image`) with a prompt like: *"Cute 3D rendered icon of [habit description], soft pink and pastel color palette, minimal background, app icon style"*
- Icons are generated once when habits are first created (during setup) and cached in the habit data as base64 data URLs
- The `CoreHabit` interface gets a new optional `iconImage` field (string URL) alongside the existing `icon` emoji field
- A new hook `useHabitIcons` manages generation: it checks each habit for a missing `iconImage`, generates one, and updates the store
- In the habit list, if `iconImage` exists, a small round image is shown instead of the emoji; otherwise the emoji remains as fallback
- A subtle shimmer/skeleton shows while an icon is generating

**Image style prompt template:**
> "Cute 3D rendered miniature icon of [habit title], soft pastel pink and white color palette, clean minimal white background, rounded glossy style, no text, app icon aesthetic"

**Storage:** Images are stored as base64 data URLs directly in the zustand persisted store. At ~5-10KB per small icon and a max of ~20 habits, this adds ~100-200KB to localStorage -- well within limits.

---

### Part 2: Text and Icon Weight Refinements

Same changes as the previously approved plan:

- **Section titles** (`section-title` in index.css): `font-medium` to `font-semibold`
- **Page title** (`page-title` in index.css): `font-normal` to `font-medium`
- **Habit/task text** in CoreHabitsSection: add `font-medium`
- **Time-of-day sub-headers**: `font-medium` to `font-semibold`
- **Reminder labels**: `font-semibold` on h3, `font-medium` on time labels
- **Muted text contrast**: darken `--muted-foreground` from `50%` to `40%`
- **Lucide icon stroke**: increase to `strokeWidth={2.5}` on all routine-page icons
- **Icon color**: `text-indigo-400` to `text-indigo-500`

---

### Files to create/modify

| File | Action |
|------|--------|
| `supabase/functions/generate-habit-icon/index.ts` | **Create** -- backend function that generates a single habit icon image via AI |
| `src/hooks/useHabitIcons.ts` | **Create** -- hook that checks habits for missing icons and triggers generation |
| `src/stores/userStore.ts` | **Modify** -- add `iconImage?: string` to `CoreHabit` interface, add `updateHabitIcon` action |
| `src/components/routine/CoreHabitsSection.tsx` | **Modify** -- display AI images instead of emojis, add font weight classes, icon strokeWidth |
| `src/components/routine/RoutineSetup.tsx` | **Modify** -- display AI images in setup view too |
| `src/components/routine/WeeklyProgress.tsx` | **Modify** -- icon strokeWidth |
| `src/components/routine/ReminderSettings.tsx` | **Modify** -- font weight and icon strokeWidth |
| `src/pages/Routine.tsx` | **Modify** -- use `useHabitIcons` hook, icon strokeWidth |
| `src/index.css` | **Modify** -- font weight and contrast tweaks |

