

## Plan: Comprehensive Analytics Tracking + Expanded Admin Dashboard

### Overview

Create an event-based analytics system that logs user actions to a new `analytics_events` table, then expand the existing Admin Dashboard with new tabs for engagement, demographics, progress, and funnel analysis.

### 1. Database: New `analytics_events` table

```text
analytics_events
├── id (uuid, PK)
├── user_id (uuid, not null)
├── event_name (text, not null)      -- e.g. "page_view", "habit_completed", "journal_created"
├── event_data (jsonb, default '{}') -- flexible payload (page, duration, etc.)
├── created_at (timestamptz)
```

RLS: users can INSERT their own events; admins can SELECT all events. No user SELECT needed (write-only from client).

### 2. Client-side analytics hook: `useAnalytics`

A lightweight hook that exposes a `track(eventName, data?)` function. It batches events and writes them to `analytics_events` via the Supabase client. Events to track:

| Event | Where | Payload |
|-------|-------|---------|
| `page_view` | Every page (via a wrapper) | `{ page, referrer }` |
| `session_start` | App mount | `{ timestamp }` |
| `onboarding_step` | Onboarding flow | `{ step, answers }` |
| `onboarding_complete` | Onboarding finish | `{ aesthetic, struggles }` |
| `mood_checkin` | Daily check-in | `{ mood, date }` |
| `journal_created` | Journal save | `{ wordCount }` |
| `habit_completed` | Habit toggle | `{ habitId, timeOfDay }` |
| `resource_viewed` | Wonder resources | `{ resourceId, category }` |
| `ubi_message_sent` | Ubi chat | `{ conversationId }` |
| `feature_used` | Various | `{ feature: "moodboard" \| "health" \| ... }` |

### 3. Page view tracker component

A small `<PageViewTracker />` component placed in `AnimatedRoutes` that calls `track('page_view', { page })` on every route change.

### 4. Instrument key interactions

Sprinkle `track()` calls into existing components at the points listed above (mood check-in submit, journal save, habit completion toggle, resource open, Ubi message send, onboarding step transitions).

### 5. Expand Admin Dashboard with tabs

Add a tab navigation to the existing Admin Dashboard page:

- **Ubi Ratings** (current content, unchanged)
- **Engagement** — DAU/WAU/MAU counts, avg session count, most-used features (bar chart), page view heatmap
- **Demographics** — Aggregate onboarding data: top struggles, aesthetic distribution, dream-self themes (pie/bar charts)
- **Progress** — Avg habit completion rate, journal frequency, mood distribution across all users
- **Funnels** — Onboarding completion rate by step, feature adoption (% of users who used each feature at least once), retention cohorts (7-day, 30-day)

All queries run client-side using the admin's SELECT-all RLS policy on `analytics_events` plus existing tables (`user_data`, `ubi_ratings`).

### Files to create/edit

| File | Change |
|------|--------|
| **Migration** | Create `analytics_events` table + RLS policies |
| `src/hooks/useAnalytics.ts` | New hook with `track()` function |
| `src/components/PageViewTracker.tsx` | New — tracks route changes |
| `src/App.tsx` | Add `<PageViewTracker />` inside router |
| `src/components/DailyMoodCheckin.tsx` | Add mood check-in tracking |
| `src/pages/Onboarding.tsx` | Add step + completion tracking |
| `src/pages/Alignment.tsx` | Track journal creation |
| `src/components/routine/CoreHabitsSection.tsx` | Track habit completion |
| `src/hooks/useUbiChat.ts` | Track message sent |
| `src/components/wonder/ResourceDetailSheet.tsx` | Track resource view |
| `src/pages/AdminDashboard.tsx` | Add tabbed layout with 4 new analytics sections |

### Technical notes

- Events are fire-and-forget (no await blocking UI). Errors silently logged.
- The `event_data` JSONB column keeps the schema flexible without needing new columns for each event type.
- Admin queries will use aggregate SQL via `supabase.rpc()` or client-side grouping for simplicity.
- Demographic data is pulled from the existing `user_data` table's JSONB `data` column (onboarding answers are already stored there).

