

## Generate 15 3D Pastel Clay-Style Habit Icons

### What
Replace the current Lucide vector icons with pre-generated 3D pastel clay-style images for the 15 most common habits. Icons will be generated at build time via the existing `generate-habit-icon` edge function (with an updated prompt matching the clay aesthetic), then saved as static assets.

### Icons to Generate (15)

| ID | Subject | Prompt object |
|---|---|---|
| dumbbell | Exercise | a dumbbell |
| glass-water | Hydration | a glass of water |
| utensils | Meals | a fork and knife |
| book | Reading | a closed book |
| pencil | Writing | a pencil |
| heart | Self-care | a heart |
| bed | Sleep | a bed |
| pill | Vitamins | a pill capsule |
| brain | Mindfulness | a brain |
| coffee | Coffee | a coffee cup |
| sparkles | Beauty | a mirror with sparkles |
| leaf | Nature | a leaf |
| dog | Pets | a dog face |
| music | Music | a music note |
| bike | Cycling | a bicycle |

### Style Prompt Template
Each icon uses the same style suffix:
> "Create a soft pastel 3D clay-style icon. Cute rounded clay style, soft pastel colors (pink, cream, lavender), minimal details, smooth plastic texture, subtle shadows, centered object, white background, iOS app icon aesthetic, consistent lighting. No text. The subject is: {object}"

### Implementation Steps

1. **Update the edge function prompt** in `generate-habit-icon` to use the clay style prompt instead of the current "bold vibrant" prompt. Switch model to `google/gemini-3-pro-image-preview` for higher quality.

2. **Create a new one-time edge function** `generate-all-clay-icons` that loops through the 15 habits, calls the AI gateway for each, uploads the resulting base64 images to the storage bucket, and returns their public URLs.

3. **Save generated images** as static assets in `src/assets/icons/` (e.g., `dumbbell.png`, `book.png`, etc.) -- these will be committed as static files so no runtime generation is needed.

4. **Update `src/lib/taskIcons.ts`**:
   - Add an `imageSrc` optional field to `TaskIconOption`
   - Import the 15 image assets
   - Set `imageSrc` on each of the 15 entries, keep `icon` as fallback

5. **Update icon rendering** in these components to prefer `imageSrc` over Lucide icon:
   - `CoreHabitsSection.tsx` — `HabitIcon` component
   - `RoutineSetup.tsx` — `PresetIcon` component and the icon picker grid
   - `AddTaskDialog.tsx` — icon picker grid
   - `CustomTasksSection.tsx` — task icon display
   - `DayDetailSheet.tsx` — task icon display

   The pattern in each: if `opt.imageSrc` exists, render `<img src={opt.imageSrc} className="w-4 h-4" />`, otherwise render the Lucide `<Icon>` as before.

### Practical Approach
Since we can't run the edge function in a loop during planning, the implementation will:
1. First update the edge function with the clay prompt
2. Create a simple page/button that generates all 15 icons one by one and downloads them
3. Save each as a static asset
4. Wire up the icon system

This ensures consistent style across all icons while keeping the app fast (no runtime AI calls for icons).

