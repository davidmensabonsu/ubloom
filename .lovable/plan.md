## Goal

Replace the photographic thumbnails on each Wander category card with clean, cohesive line-icon illustrations so the explore grid looks unified and intentional rather than a collage of stock photos.

## Categories needing icons

Fitness, Wellness, Calm, Mindset, Food & Recipes, Podcasts, Vitamins, Skincare & Hygiene, Lifestyle (9 cards), plus the "Books to Level Up Your Mindset" featured banner (which currently uses a book photo).

## Visual direction

- Single-style **line illustrations** (1.5–2px stroke, rounded caps, no fills or photos)
- Soft, ubloom-friendly palette: a muted lavender / dusky-pink stroke (`hsl(var(--primary))`) on a tinted pastel background per card so the grid feels cohesive but each card has a gentle hue
- Each card keeps its existing rounded shape and label/subtitle row — only the top imagery changes
- Icons are conceptual, not literal: e.g. Calm = lotus + soft waves, Mindset = head with a sprouting plant, Podcasts = headphones with sound waves, Vitamins = capsule + leaf, Lifestyle = sun over mountains, Books banner = open book with bookmark

## Implementation

1. Generate 9 PNG line-illustration assets (transparent background) into `src/assets/wonder/icons/`:
   `fitness.png, wellness.png, calm.png, mindset.png, nutrition.png, podcasts.png, vitamins.png, hygiene.png, lifestyle.png` — all drawn in the same line-art style for cohesion.
2. Generate 1 wider banner illustration `books-banner-line.png` for the "Books to Level Up Your Mindset" card.
3. Update `src/pages/Wander.tsx`:
   - Swap the photographic imports (`fitnessImg`, `calmImg`, etc.) for the new icon assets.
   - Replace the `<img>` inside each explore card with a tinted pastel container that centers the line illustration. Keep the existing `tall` vs square aspect ratios so the masonry layout stays the same.
   - Assign each card a soft pastel background tint (lavender, blush, sage, peach, sky, cream, mauve, mint, butter) for variety while the strokes remain unified.
   - Replace the books banner image with the new line-illustration banner on the same card.
4. Leave category detail pages, hero gradient, search, curated-for-you, and recently-viewed sections untouched.

## Out of scope

- No changes to navigation, data, or detail pages
- No change to the routine icon picker
- The existing `.jpg` assets are kept on disk (still used inside detail pages / resource cards) — only the Wander explore grid stops referencing them

## Files touched

- `src/pages/Wander.tsx` (edited)
- `src/assets/wonder/icons/*.png` (10 new assets)
