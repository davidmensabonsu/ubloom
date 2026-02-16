

## AI-Powered Personalized Messages from Your Future Self

Instead of rotating through static message pools, we'll use AI to generate truly personalized messages that draw from your journal entries, identity statement, and dream self profile.

### How It Will Work

- **Future Self message (weekly)**: Every Monday (or on first visit of the week), an AI generates a new message inspired by your recent journal entries, mood patterns, and identity statement. It stays the same all week.
- **Today's Mindset (daily)**: Each day, an AI generates a fresh mindset message that gently references themes from your journal -- without quoting entries directly, keeping it feeling like intuitive wisdom rather than a summary.
- Messages are cached locally so the AI is only called once per period (not on every page load).

### Technical Approach

**1. New backend function: `generate-home-messages`**

- Accepts the user's recent journal entries (last 5-10), identity statement, dream self categories, and current mood history
- Calls `google/gemini-2.5-flash` via the Lovable AI gateway
- Returns two messages: a weekly "future self" letter and a daily mindset affirmation
- The prompt instructs the AI to weave in themes from journal entries subtly (e.g., if someone journaled about feeling overwhelmed, the future self might speak to finding calm)

**2. New store fields in `userStore.ts`**

- `cachedFutureSelfMessage`: the generated weekly message + the week key it was generated for (e.g., `2026-W07`)
- `cachedMindsetMessage`: the generated daily message + the date it was generated for (e.g., `2026-02-16`)
- These persist locally so we don't re-generate on every visit

**3. New hook: `useHomeMessages.ts`**

- On mount, checks if the cached messages are still fresh (same week / same day)
- If stale, calls the backend function with relevant profile data
- Returns the messages + a loading state
- Falls back to a static default message while loading or if the user has no journal entries yet

**4. Updated `Home.tsx`**

- Uses the new hook to display AI-generated messages
- Shows a subtle shimmer/skeleton while a new message is being generated
- The "Future Self" and "Today's Mindset" cards use the returned messages instead of hardcoded text

### Fallback Behavior

- If the user has no journal entries, the AI still generates uplifting messages based on identity statement and dream self
- If the user has no profile data at all, a curated set of static messages rotates (date-seeded, same approach as previously planned)
- Network errors gracefully fall back to static messages

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/generate-home-messages/index.ts` | Create -- backend function that calls AI |
| `src/hooks/useHomeMessages.ts` | Create -- manages caching and fetching |
| `src/stores/userStore.ts` | Modify -- add cached message fields |
| `src/pages/Home.tsx` | Modify -- use hook instead of static messages |

### Privacy Consideration

Journal content is sent to the AI only to generate the message -- it is not stored anywhere beyond the user's own device and the transient API call. The generated messages themselves are cached locally in the browser.

