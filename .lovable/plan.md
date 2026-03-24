

## Redesign Wonder Page — More Visual Hierarchy and Focus

### Problem
The current Wonder page is a long, flat list of same-sized resource cards. The recommended section and explore section look identical, nothing visually "pops," and it feels overwhelming rather than calming.

### Design Changes

**1. Recommended Section — Make it the hero**
- Show only 3 recommendations (not 6) to keep it focused
- Use a horizontal scroll of larger, more visual cards with:
  - Colored category accent strip on the left edge
  - Larger title text (font-display)
  - The "why this is for you" reason displayed prominently
  - Type emoji as a soft background watermark
- Add a subtle "See more" link if there are additional recommendations

**2. Explore Section — Compact, scannable grid**
- Switch from a vertical list to a 2-column grid of compact cards
- Each card shows: emoji, title, and type badge only (no description — that's in the detail sheet)
- Cards are smaller, making the library feel browsable rather than overwhelming
- Category pills get slightly larger and more tappable

**3. Visual polish**
- Add a soft gradient accent behind the recommended section header
- Recommended cards use `glass-card` with subtle `shadow-soft` to pop against the flat explore grid
- Explore grid cards use a lighter `bg-muted/30` to create contrast with the recommended section
- Limit the explore section to show 8 items initially with a "Show all" button

### Files to modify

- **`src/pages/Wonder.tsx`** — restructure layout: horizontal scroll for recommended, 2-column grid for explore, add "Show all" toggle
- **`src/components/wonder/RecommendedSection.tsx`** — limit to 3 items, use larger horizontal card layout with accent colors
- **`src/components/wonder/ResourceCard.tsx`** — add a `compact` prop for the 2-column grid variant (emoji + title only, no description)
- **`src/lib/wonderResources.ts`** — add a `color` field to each category for accent strips

