

## Plan: Replace Emoji Picker with Curated Icon Set for Custom Tasks

### What changes

Replace the current 12-emoji grid in the Add Task dialog with a set of ~15 curated, visually consistent icons that represent common daily tasks. These will be Lucide icons (already installed) rendered as styled components, not emojis.

### Icon Set (~15 icons)

A curated set stored as a constant array, each with an `id`, `label`, Lucide icon component, and a color. Examples:
- **Dumbbell** — gym/exercise
- **GlassWater** — hydration
- **UtensilsCrossed** — meals/cooking
- **BookOpen** — reading
- **Pencil** — journaling/writing
- **Heart** — self-care
- **Bed** — sleep/rest
- **Shirt** — outfit/laundry
- **ShoppingCart** — groceries/errands
- **Phone** — calls/screen time
- **Music** — music/podcast
- **Dog** — pets/walk
- **Pill** — medication/vitamins
- **Sparkles** — skincare/beauty
- **Brain** — meditation/mindfulness

### Files to change

**`src/components/routine/AddTaskDialog.tsx`**
- Replace `emojiOptions` array with a `taskIconOptions` array of `{ id: string, label: string, icon: LucideIcon }`.
- Replace the emoji grid UI with a grid of Lucide icon buttons (same layout, but rendering `<Icon size={20} />` instead of emoji text).
- Store the selected icon `id` string (e.g. `"dumbbell"`) instead of an emoji character.

**`src/stores/userStore.ts`**
- No schema change needed — the `icon` field on `CustomTask` is already a `string`. It will now store an icon ID like `"glass-water"` instead of `"💧"`.

**`src/components/routine/CustomTasksSection.tsx`**
- Where `task.icon` is currently rendered as text (`<span>{task.icon}</span>`), look up the icon ID in the shared `taskIconOptions` map and render the corresponding Lucide component instead.
- Fall back to showing the raw string (emoji) for any old tasks that still have emoji icons.

**New shared file: `src/lib/taskIcons.ts`**
- Export the `taskIconOptions` array and a `getTaskIcon(id: string)` lookup helper, so both AddTaskDialog and CustomTasksSection can reference the same set.

### Behavior
1. User taps FAB → Add Task drawer opens.
2. "Icon" section shows a grid of ~15 styled Lucide icons instead of emojis.
3. User picks one (e.g. dumbbell for "Go to the gym").
4. In the task list, the selected Lucide icon renders next to the task name.
5. Old tasks with emoji icons still display correctly via fallback.

