

## Make the Wonder Page Bolder and More Impactful

### Changes

**1. Page header** (`Wonder.tsx`)
- Page title: bump from `page-title` (text-3xl) to `text-4xl font-semibold` with a gradient text effect
- Subtitle: increase from `text-sm` to `text-base` with slightly darker color

**2. "For You" section header** (`RecommendedSection.tsx`)
- Increase from `text-xl` to `text-2xl font-semibold`
- Make the Sparkles icon larger (16 → 20)
- Recommended cards: title from `text-base` to `text-lg font-semibold`, type badge from `text-[10px]` to `text-xs`, card width from 280px to 300px, padding increased
- Accent strip from `w-1` to `w-1.5`
- Watermark emoji from `text-4xl` to `text-5xl` with slightly more opacity

**3. "Explore" section header** (`Wonder.tsx`)
- Increase from `text-lg` to `text-xl font-semibold`
- Category pills: from `text-xs` to `text-sm`, increase padding

**4. Compact resource cards** (`ResourceCard.tsx`)
- Emoji: from `text-lg` to `text-xl`
- Title: from `text-xs` to `text-sm font-semibold`
- Type badge: from `text-[10px]` to `text-xs`
- Card padding: from `p-3` to `p-3.5`
- Top accent bar: from `h-0.5` to `h-1`

**5. Grid gap** (`Wonder.tsx`)
- Increase grid gap from `gap-2` to `gap-3`

### Files to modify
- `src/pages/Wonder.tsx`
- `src/components/wonder/RecommendedSection.tsx`
- `src/components/wonder/ResourceCard.tsx`

