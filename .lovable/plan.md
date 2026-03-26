

## Enhance Wonder Page Visuals and Layout

### Problem
- Exercise/stretch thumbnails don't show people doing poses
- Nutrition thumbnails don't show actual meals
- Vitamin thumbnails don't show brand products
- The "For You" recommended cards lack thumbnail images (text-only)
- Books in the grid don't visually stand out like in the reference image

### Changes

**1. Regenerate thumbnail images with better prompts**
Re-generate the following assets to be more realistic and descriptive:
- **Exercise thumbnails** (morning stretch, yoga, pilates, dance, walk, strength): Show a person in the pose/movement, warm natural lighting
- **Nutrition thumbnails** (lemon water, gut foods, anti-inflammatory, hydration): Show the actual meal/drink, styled food photography
- **Vitamin thumbnails** (magnesium, omega-3, vitamin D): Show supplement bottles/brands on a clean surface

**2. Add thumbnail images to "For You" recommended cards** (`RecommendedSection.tsx`)
- Import `resourceThumbnails` from `resourceMedia.ts`
- Add a thumbnail image at the top of each recommended card (similar to the reference image with large hero images)
- Keep the accent strip, type badge, title, and reason text below the image

**3. Update ResourceCard compact layout for books**
- Books already use their cover image as thumbnail — ensure they render prominently with proper aspect ratio

### Files to modify
- `src/components/wonder/RecommendedSection.tsx` — add thumbnail images to recommended cards
- ~18 thumbnail image assets in `src/assets/wonder/` — regenerate with better AI prompts showing people, meals, and vitamin brands

