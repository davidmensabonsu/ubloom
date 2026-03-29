

## Full-Screen Daily Check-In Redesign

### Overview
Replace the current modal-based mood check-in (16 feeling pills) with a full-screen page showing 5 alignment states as large cards. After tapping one, show a personalized response, then navigate to Home. Store the selection for Ubi context and mood tracking.

### The 5 States
| State | Icon asset | Response message |
|-------|-----------|-----------------|
| Disconnected | `cloud.png` | "It's okay to feel distant sometimes. Today is a chance to gently reconnect with yourself — one small moment at a time." |
| Off track | `spiral.png` | "You're aware of where you are, and that awareness is powerful. Let today be about one small step back toward you." |
| Grounded | `plant.png` | "You're rooted and steady — what a beautiful place to be. Let's build on this energy today." |
| Aligned | `star.png` | "You're in sync with who you're becoming. Trust this feeling and let it guide your choices today." |
| Elevated | `sparkles.png` | "You're radiating. This energy is magnetic — carry it with you and let it touch everything you do today." |

### Architecture

```text
User opens app → MoodCheckinGate checks lastMoodCheckinDate
  ↓ (not checked in today)
Full-screen DailyMoodCheckin page (replaces current modal)
  ↓ (user taps a state)
Show response message with fade animation
  ↓ (2s auto-advance or tap)
Navigate to /home
  ↓
Store: addMoodEntry([selectedState]), set lastMoodCheckinDate
Also store: dailyCheckinState for Ubi context
```

### Changes

**1. `src/components/DailyMoodCheckin.tsx`** — Complete rewrite
- Full-screen page with `gradient-background` (not a modal overlay)
- uBloom logo at top
- "How are you feeling today?" heading in serif font
- 5 large rounded cards in a vertical list, each with icon + label
- On tap: store selection, show response message with fade-in
- After 2s or tap: call `updateProfile({ lastMoodCheckinDate })` and navigate to `/home`
- Map the 5 states to mood values for `addMoodEntry` so they feed into the mood trends chart

**2. `src/stores/userStore.ts`**
- Add `dailyCheckinState?: string` to `UserProfile` — stores today's selected state (disconnected/off-track/grounded/aligned/elevated)
- This gets picked up by `buildUserContext` in useUbiChat

**3. `src/hooks/useUbiChat.ts`** — `buildUserContext`
- Add `dailyCheckinState` to the context object sent to Ubi, so responses are personalized to the user's current state

**4. `src/App.tsx`** — `MoodCheckinGate`
- Change from rendering as a modal overlay (`AnimatePresence` with fixed positioning) to rendering as a full-screen blocking component that prevents the underlying route from showing
- When check-in is needed, render `DailyMoodCheckin` instead of the route content

**5. `src/lib/moodIcons.ts`**
- Add the 5 new check-in state entries to `feelingIcons` map so the mood trends chart can display them: `disconnected → cloud`, `off-track → spiral`, `grounded → plant`, `aligned → star`, `elevated → sparkles`

**6. `src/components/alignment/MoodTrendsChart.tsx`**
- Add the 5 new states to `feelingCategories` so they appear in trend data

### Detail Notes
- The existing `addMoodEntry` stores moods as string arrays in `moodHistory` — the check-in will call `addMoodEntry([selectedState])` so it integrates with the existing mood trends system
- No skip button — the 5 options are simple enough that users should always pick one
- The response message screen uses `motion` fade-in with a "Tap to continue" hint below

