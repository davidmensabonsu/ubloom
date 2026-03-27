

## Store Ubi Message Ratings in the Database

### Overview
Create a new `ubi_ratings` table to persist thumbs up/down ratings, and update the rating logic to write to the database in addition to local state.

### Database Migration

New table `ubi_ratings`:
```sql
CREATE TABLE public.ubi_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_content text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up', 'down')),
  conversation_context text, -- the user message that preceded this response
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ubi_ratings ENABLE ROW LEVEL SECURITY;

-- Users can insert their own ratings
CREATE POLICY "Users can insert ratings" ON public.ubi_ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can view their own ratings
CREATE POLICY "Users can view own ratings" ON public.ubi_ratings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can update their own ratings (for toggling)
CREATE POLICY "Users can update own ratings" ON public.ubi_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Users can delete their own ratings (for un-rating)
CREATE POLICY "Users can delete own ratings" ON public.ubi_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Code Changes

**`src/hooks/useUbiChat.ts`** — Update `rateMessage` to:
1. Continue toggling rating in local state as it does now
2. Additionally upsert/delete from `ubi_ratings` table using the Supabase client
3. Include the preceding user message as `conversation_context` for analysis context
4. Use the authenticated user's ID from the auth hook

**`src/pages/Ubi.tsx`** — No changes needed; it already calls `rateMessage` from the hook.

### Technical Details

- Ratings are stored per-message-content rather than by index, so they survive chat clears
- When a user un-rates (toggles off), the row is deleted from the database
- When a user changes rating direction, the existing row is updated
- The `conversation_context` field stores the user message that prompted the rated response, giving analysts the full Q&A pair
- Auth user ID comes from `supabase.auth.getUser()` or the existing `useAuth` hook

