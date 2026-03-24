

## Replace Goals with Wonder Page

### Overview

Remove the Goals page and replace it with **Wonder** -- a calming resource hub that combines a curated library (same for all users) with AI-personalized recommendations based on the user's profile, moods, journal entries, and habits.

### Architecture

```text
┌─────────────────────────────────┐
│         Wonder Page             │
├─────────────────────────────────┤
│  "Recommended for You"          │  ← AI-ranked, 5-8 items
│  (personalized cards)           │
│  + optional "Why this is for    │
│    you" soft context line       │
├─────────────────────────────────┤
│  Explore All Resources          │  ← Static library, grouped
│  ┌─────────┐ ┌─────────┐       │     by category tabs/pills
│  │ Mindset  │ │ Wellness│ ...   │
│  └─────────┘ └─────────┘       │
│  Resource cards (book, video,   │
│  technique, nutrition, vitamin) │
│  → tap to open detail modal     │
│  → save for later / mark used   │
└─────────────────────────────────┘
```

### Technical Plan

**1. Static resource data** (`src/lib/wonderResources.ts`)

Create ~40-50 curated resources, each with:
```typescript
interface WonderResource {
  id: string;
  title: string;
  description: string;
  category: 'mindset' | 'wellness' | 'fitness' | 'nutrition' | 'lifestyle' | 'calm';
  type: 'book' | 'video' | 'technique' | 'nutrition-tip' | 'vitamin';
  tags: string[];           // e.g. ['confidence', 'calm', 'grounded']
  emotionalTone: string;    // e.g. 'calm', 'empowering'
  goalAlignment: string[];  // e.g. ['peace', 'discipline']
  thumbnail?: string;       // optional image URL
  content?: string;         // longer description or instructions for techniques
  link?: string;            // external link for books/videos
}
```

All users see the same library. Tags enable AI matching.

**2. User store updates** (`src/stores/userStore.ts`)

- Remove all goal-related interfaces, state, and actions (Goal, TripDetails, TripItinerary, TripChecklist, and associated methods)
- Add new fields:
```typescript
savedResources: string[];    // resource IDs saved for later
usedResources: string[];     // resource IDs marked as used
```
- Add actions: `saveResource(id)`, `unsaveResource(id)`, `markResourceUsed(id)`, `unmarkResourceUsed(id)`

**3. AI personalization edge function** (`supabase/functions/wonder-recommendations/index.ts`)

- Accepts: user profile summary (struggles, desired feelings, dream self, recent moods, recent journal themes, habit categories)
- Uses Lovable AI to rank resource IDs by relevance and generate short "why this is for you" lines
- Returns: ordered list of 5-8 resource IDs with optional context strings
- Uses tool calling for structured output

**4. Wonder page** (`src/pages/Wonder.tsx`)

- **Header**: "Wonder" title + subtitle
- **Recommended section**: Fetches AI recommendations on mount (cached per session), shows horizontal scroll or vertical cards with soft "why" context
- **Explore section**: Category pill filters, grid of resource cards
- **Resource detail**: Modal/sheet with full description, save/used buttons
- Matches existing design system (glass-card, rounded-3xl, soft shadows, theme colors)

**5. Supporting components**
- `src/components/wonder/ResourceCard.tsx` -- card for library grid
- `src/components/wonder/ResourceDetailSheet.tsx` -- bottom sheet for resource details
- `src/components/wonder/RecommendedSection.tsx` -- personalized top section

**6. Routing & navigation updates**

- `App.tsx`: Replace `/goals` route with `/wonder`, update imports
- `BottomNav.tsx`: Change Goals nav item to Wonder (use `Sparkles` icon, label "Wonder")
- `MoodCheckinGate`: Update mainRoutes array

**7. Cleanup**

- Delete `src/pages/Goals.tsx` and goal-related components (`src/components/goals/*`)
- Remove goal-related imports from store and any other files referencing goals

### Files to create
- `src/lib/wonderResources.ts` -- static resource data
- `src/pages/Wonder.tsx` -- main page
- `src/components/wonder/ResourceCard.tsx`
- `src/components/wonder/ResourceDetailSheet.tsx`
- `src/components/wonder/RecommendedSection.tsx`
- `supabase/functions/wonder-recommendations/index.ts`

### Files to modify
- `src/stores/userStore.ts` -- remove goals, add saved/used resources
- `src/App.tsx` -- swap route
- `src/components/BottomNav.tsx` -- swap nav item

### Files to delete
- `src/pages/Goals.tsx`
- `src/components/goals/AddTravelGoalForm.tsx`
- `src/components/goals/TravelGoalCard.tsx`
- `src/components/goals/TripChecklist.tsx`
- `src/components/goals/TripDetailSheet.tsx`
- `src/components/goals/TripItinerary.tsx`

