

## Plan: Book Cover Artwork + "For You" Sub-tab with Ubi Insights

### What We're Building

1. **Real book cover images** fetched dynamically via Google Books API (free, no key required), similar to how podcasts use Apple Podcasts artwork
2. **"For You" tab inside the Books section** — AI-personalized book recommendations with Ubi insights explaining why each book suits the user
3. Remove the existing top-level "For You" tab from the main Wander page (moved into each category instead)

### Technical Steps

**1. Create `useBookArtwork` hook** (`src/hooks/useBookArtwork.ts`)
- Mirror the `usePodcastArtwork` pattern
- Create an edge function `supabase/functions/book-artwork/index.ts` that calls the Google Books API (`https://www.googleapis.com/books/v1/volumes?q=...`) to fetch cover thumbnails
- Cache results in localStorage with a 7-day TTL, same as podcasts

**2. Create `UbiBookInsight` component** (`src/components/wonder/UbiBookInsight.tsx`)
- Similar to `UbiPodcastInsight` but tailored for books
- Shows "Why this book is for you" based on user profile (struggles, goals, mood)
- Uses the existing `wonder-recommendations` edge function (which already handles books) or a new lightweight `book-recommendation` edge function
- Cached in localStorage with 24h TTL

**3. Update `BooksSection.tsx`**
- Add a "For You" tab as the first filter option (after "All")
- When "For You" is active, fetch AI recommendations filtered to books only, and display each with its Ubi insight reason
- Use `useBookArtwork` to display real cover images on all book cards (replacing the current generic thumbnails)

**4. Update `ResourceDetailSheet.tsx`**
- When viewing a book from the "For You" tab, show the Ubi insight (why this book was recommended) in the detail sheet, similar to podcast insights

### Architecture

```text
BooksSection
  ├── Filter tabs: All | For You | My List | Mindset | ...
  ├── useBookArtwork(titles) → real covers
  ├── [For You tab active]:
  │     └── wonder-recommendations edge fn (filtered to books)
  │         → 6 books with "reason" strings
  │         → Each card shows cover + reason quote
  └── BookCard (updated to show real cover art)

ResourceDetailSheet
  └── [type === 'book' from For You] → UbiBookInsight
```

### Files to Create/Edit

| File | Action |
|------|--------|
| `supabase/functions/book-artwork/index.ts` | Create — Google Books API proxy |
| `src/hooks/useBookArtwork.ts` | Create — fetch + cache book covers |
| `src/components/wonder/UbiBookInsight.tsx` | Create — personalized book insight |
| `src/components/wonder/BooksSection.tsx` | Edit — add "For You" tab, integrate covers + insights |
| `src/components/wonder/ResourceDetailSheet.tsx` | Edit — show UbiBookInsight for books |

