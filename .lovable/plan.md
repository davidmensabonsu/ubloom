

## Plan: Unify Daily Habits into a Single Icon-Based Task System

### Overview

Merge the two separate sections ("Daily Habits" with AI-generated icons and "My Tasks" with Lucide icons) into **one unified section** that uses the curated Lucide icon set. The setup flow is preserved. Icons get a 3D styled appearance that automatically matches the chosen theme color.

### 3D Icon Styling

Create a CSS-based 3D effect for the Lucide icons: a rounded container with a gradient background derived from `--primary`, layered box-shadows for depth, and a subtle inner highlight. Because the color is built from the CSS custom property `--theme-hue`, switching themes (green → blue) automatically recolors every icon.

```text
┌─────────────────────┐
│  Gradient bg from    │
│  hsl(--primary)      │
│  ┌───────────┐       │
│  │  Lucide   │  ← white icon on themed 3D pill
│  │  icon     │
│  └───────────┘       │
│  Box-shadow for depth│
└─────────────────────┘
```

### Files to Change

**`src/index.css`** — Add a `.icon-3d` utility class:
- Rounded square with primary-color gradient background
- Layered box-shadows for 3D depth
- White icon color for contrast
- Uses CSS variables so it auto-updates with theme changes

**`src/lib/taskIcons.ts`** — Already done; no changes needed.

**`src/components/routine/RoutineSetup.tsx`** — Major update:
- Replace emoji-based `presetHabits` with entries that reference `taskIconOptions` IDs (e.g. `icon: 'glass-water'` instead of `icon: '💧'`)
- Render each preset habit with the 3D-styled Lucide icon instead of emoji text
- When saving, store the icon ID string on `CoreHabit.icon`
- Add icon picker to the custom habit input so users can choose an icon for custom habits too

**`src/components/routine/CoreHabitsSection.tsx`** — Major update:
- Remove the `HabitIcon` component (no more AI-generated images)
- Remove `useHabitIcons` hook usage
- Import `getTaskIcon` from `taskIcons.ts`
- Render each habit's icon as a 3D-styled Lucide component using `getTaskIcon(habit.icon)`
- Fallback to a default icon (Sparkles) for old habits without a valid icon ID

**`src/components/routine/CustomTasksSection.tsx`** — Update icon rendering:
- Apply the same `.icon-3d` styling to custom task icons for visual consistency

**`src/stores/userStore.ts`** — Minor updates:
- Update `skipRoutineSetup` default habits to use icon IDs (`'glass-water'`, `'sparkles'`, etc.) instead of emojis
- Remove `iconImage` references from `CoreHabit` interface (no longer needed)
- Remove `updateHabitIcon` and `clearAllHabitIcons` store methods

**`src/hooks/useHabitIcons.ts`** — Delete this file (AI icon generation no longer used for habits)

**`src/components/routine/AddTaskDialog.tsx`** — Apply `.icon-3d` styling to the icon picker grid for consistency

### Result

- One unified look: all habits and tasks use the same curated Lucide icons with 3D styling
- Theme-reactive: switching from green to blue recolors all icons automatically via CSS variables
- Setup flow preserved with the same preset habits, now showing 3D icons instead of emojis
- No more AI-generated icon calls for habits (simpler, faster, no API dependency)

