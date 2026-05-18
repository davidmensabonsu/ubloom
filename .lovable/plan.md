# Consistent free-tier resources in Wander

## Goal
For non-Pro users, each Wander category exposes a single, fixed set of resources. That same set is what appears under **All**, under **For You**, and split across the subsection tabs — no extra items unlocked by switching tabs.

## Free-tier sets

- **Books (4 total):** 1 Mindset, 1 Business, 1 Wellness, 1 Spirituality
- **Podcasts (5 total):** 1 Mindset, 1 Finance, 1 Creativity, 1 Spirituality, 1 Wellness
- **Hygiene (11 total):** 2 Body, 2 Skin & Face, 2 Hair, 2 Oral & Lips, 2 Hands & Feet, 1 Fragrance (only one exists)
- **Fitness (12 total):** 2 per fitness type — Upper Body, Lower Body, Core, Full Body, Cardio, Stretches & Yoga
- **Food (8 total, for consistency):** 2 Breakfast, 2 Lunch, 2 Dinner, 2 Snacks

All non-Pro users see exactly these items in **All** and **For You**. Subsection tabs only show the curated items for that subsection. "Saved" still shows whatever they've bookmarked.

## How it works (technical)

In each section component (`BooksSection`, `PodcastsSection`, `HygieneSection`, `FitnessSection`, `FoodRecipesSection`), build a `freeAllowedIds: Set<string>` once per render when `!isActive`:

- Iterate the subsection definitions (using the existing `topicTagMap` / `fitnessType` / `mealType`)
- For each subsection, pick the first N matching resources from the full library (N = the per-subsection quota above)
- Union those IDs

Then change gating from the current "slice first 3 of whatever is filtered" to:

```ts
const filtered = isGated
  ? allFiltered.filter(r => freeAllowedIds.has(r.id))
  : allFiltered;
const hiddenCount = isGated ? allFiltered.length - filtered.length : 0;
```

`isGated` is also extended to cover **For You** (currently exempted in Books and Podcasts) so the curated set applies there too. The "For You" AI recommendation call itself can stay as-is — we just filter the rendered results down to `freeAllowedIds`.

The existing `UnlockLibraryCard` (CTA to upgrade) keeps showing when `hiddenCount > 0`, unchanged.

No data model changes, no Pro user changes — Pro behaviour is identical.

## Files touched
- `src/components/wonder/BooksSection.tsx`
- `src/components/wonder/PodcastsSection.tsx`
- `src/components/wonder/HygieneSection.tsx`
- `src/components/wonder/FitnessSection.tsx`
- `src/components/wonder/FoodRecipesSection.tsx`

## One confirmation
You didn't mention **Food**. I've included it (2 per meal type) to keep the rule consistent across the page. If you'd rather leave Food on its current behaviour, say so and I'll drop it from the plan.
