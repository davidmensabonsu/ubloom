

## Health Page — Design & Implementation Plan

### Overview
A new `/health` page accessible from the Reflect page, showing health data cards and AI-powered Ubi Insights. Consistent with the app's soft, minimal aesthetic using existing clay icons.

### Navigation
- Add a "Health" button/link on the Reflect page (Alignment.tsx) near the top, navigating to `/health`
- Add `/health` route in App.tsx as a protected route

### Health Page Layout

**Header**: Page title "Health" with back arrow to Reflect, plus ProfileButton

**6 Data Cards** in a 2-column grid, each with a clay icon, label, and placeholder value:

| Card | Icon Asset | Placeholder |
|------|-----------|-------------|
| Cycle Phase | `moon.png` | "Not tracked yet" |
| Sleep | `bed.png` | "Not tracked yet" |
| Stress | `brain.png` | "Not tracked yet" |
| Recovery | `leaf.png` | "Not tracked yet" |
| Activity | `running.png` | "Not tracked yet" |
| Mood Patterns | `sparkles.png` | Pulls from existing mood data |

Each card is a soft rounded container with the themed background, icon, label, and data/placeholder text.

**Ubi Insights Section** — Below the cards, a distinct section titled "Ubi Insights" with the crystal ball icon. Calls a new edge function (`health-insights`) that takes the user's health context (mood history, check-in state, journal entries) and returns 3-4 warm, personalized recommendations covering:
- Energy-based guidance
- Cycle-based recommendations
- Behavioral patterns
- Daily adjustments

Insights render as a list of soft cards with brief, supportive text. Shows a loading skeleton while generating.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Health.tsx` | New page component with health cards grid and Ubi Insights section |
| `src/pages/Alignment.tsx` | Add navigation button to `/health` |
| `src/App.tsx` | Add `/health` protected route, import Health page |
| `supabase/functions/health-insights/index.ts` | New edge function calling Lovable AI to generate personalized health insights from user context |

### Edge Function Details
- Uses `google/gemini-3-flash-preview` via Lovable AI gateway
- Non-streaming (invoke pattern) — returns JSON array of insight objects
- System prompt emphasizes warm, supportive tone — not clinical
- Takes mood history, daily check-in state, and journal entries as context

