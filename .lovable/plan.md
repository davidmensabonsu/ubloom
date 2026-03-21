

## Trip Planning for Travel & Experiences Goals

### What users will experience

When a user adds or taps into a travel goal, they'll see a rich, interactive trip planner — not just a title and deadline. Each travel goal becomes a mini trip card that feels real and exciting:

- **Destination & dates** — where and when (departure/return)
- **Trip vibe** — pick the mood (romantic, adventure, cultural, relaxation, girls trip, solo)
- **Itinerary builder** — day-by-day plan with activities, times, and notes
- **Checklist** — packing list, bookings to make, things to research
- **Budget tracker** — simple estimated budget field
- **Notes** — free-text for flight details, hotel links, outfit ideas, etc.

Tapping a travel goal opens a dedicated **Trip Detail sheet** (bottom drawer) where all this lives. The travel section of the Goals page will show trip cards with destination, dates, and a progress indicator (how many checklist items done).

### Technical approach

**1. Extend the Goal interface in `userStore.ts`**

Add optional `tripDetails` field to the `Goal` type:
```
tripDetails?: {
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  vibe?: string;
  budget?: string;
  notes?: string;
  itinerary: Array<{ id: string; day: number; title: string; time?: string; notes?: string }>
  checklist: Array<{ id: string; title: string; completed: boolean }>
}
```

Add store actions: `updateTripDetails`, `addItineraryItem`, `removeItineraryItem`, `addChecklistItem`, `toggleChecklistItem`, `removeChecklistItem`.

**2. Enhanced "Add Travel Goal" modal**

When category is `travel`, the add modal expands to show:
- Destination input
- Departure & return date pickers
- Vibe selector (pill buttons with icons)
- Budget input (optional)
- The title becomes the trip name

**3. New `TripDetailSheet` component**

A slide-up sheet (`src/components/goals/TripDetailSheet.tsx`) opened by tapping a travel goal. Contains tabs/sections:
- **Overview** — destination, dates, vibe, budget, notes
- **Itinerary** — day-by-day timeline, add activities per day
- **Checklist** — toggleable items (bookings, packing, research)

**4. Travel goal cards in the Goals page**

Instead of the simple goal row, travel goals render as richer cards showing destination, date range, checklist progress (e.g. "3/7 done"), and the vibe tag.

**5. Route: no new route needed**

Everything lives within the existing `/goals` page using the sheet/drawer pattern.

### Files to create
- `src/components/goals/TripDetailSheet.tsx` — the main trip detail drawer
- `src/components/goals/TripItinerary.tsx` — itinerary day-by-day builder
- `src/components/goals/TripChecklist.tsx` — checklist section
- `src/components/goals/TravelGoalCard.tsx` — rich card for travel goals in the list
- `src/components/goals/AddTravelGoalForm.tsx` — enhanced form for travel category

### Files to modify
- `src/stores/userStore.ts` — extend `Goal` interface + add trip-related actions
- `src/pages/Goals.tsx` — render travel goals differently + open trip detail sheet + use enhanced add form for travel category

### Design notes
- Matches existing app aesthetic: glass cards, rounded corners, soft animations, theme-aware colors
- Vibe options: 🌹 Romantic, 🏔️ Adventure, 🏛️ Cultural, 🌊 Relaxation, 👯 Girls Trip, 🧘 Solo
- Itinerary uses a clean timeline layout with "+" to add activities
- Checklist items have the same check-circle style used elsewhere in the app

