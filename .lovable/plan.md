

## Refine Wonder 2 — Pinterest Layout with Category Detail Pages

### Overview
Transform Wonder 2 into a proper Pinterest-style discovery hub where each card represents a real Wonder category. Tapping a card navigates to a dedicated detail page showing that category's resources, with a back button to return.

### Architecture

```text
/wonder2          →  Pinterest masonry grid (main hub)
/wonder2/:category →  Category detail page (resources list)
```

### Changes

**1. New file: `src/pages/Wonder2Category.tsx`**
- A detail page that receives the category from the URL param
- Shows a back arrow + category title header
- Renders the appropriate existing section component based on category (reuses `FitnessSection`, `BooksSection`, `PodcastsSection`, `HygieneSection`, `FoodRecipesSection`, `CategoryGridSection`)
- Includes `BottomNav`

**2. Rewrite `src/pages/Wonder2.tsx`**
- Map each masonry card to a real `wonderCategories` entry (Fitness, Books, Skincare/Hygiene, Podcasts, Mindset, Wellness, Nutrition, Calm, Vitamins, Lifestyle)
- Each card uses its category thumbnail image and clicking navigates to `/wonder2/{category-key}`
- Keep the Pinterest masonry aesthetic: alternating tall (aspect-[3/4]) and square cards, circle-category groups, and the featured banner
- Use `useNavigate` for card taps
- Keep the search bar with For You / Popular tabs, heart save toggle using the existing `useUserStore` saved resources

**3. Generate additional thumbnail images**
- Create ~5 more category thumbnail images (for categories not yet covered like mindset, wellness, nutrition, calm, vitamins) using AI image generation

**4. Update `src/App.tsx`**
- Add route `/wonder2/:category` pointing to `Wonder2Category`

### Technical Details

| File | Change |
|------|--------|
| `src/pages/Wonder2.tsx` | Replace hardcoded cards with category-mapped masonry cards; `useNavigate` on tap |
| `src/pages/Wonder2Category.tsx` | New page — URL param determines which section component to render; back button via `useNavigate(-1)` |
| `src/App.tsx` | Add `/wonder2/:category` route |
| `src/assets/wonder2/` | Generate additional category thumbnails |

