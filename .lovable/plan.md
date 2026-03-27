

## Dynamic Preset Prompts for Ubi Chat

### What Changes

After each Ubi response, the preset prompt buttons will show a mix of **contextual follow-ups** (responding to what Ubi just said) and **new topic starters** (for switching conversation direction). Always 5-6 buttons visible.

### How It Works

**1. Edge function generates suggested prompts** (`supabase/functions/ubi-chat/index.ts`)

After the main streaming response completes, a separate non-streaming AI call generates 5-6 suggested follow-up prompts as a JSON array. These are appended to the streamed response as a special delimiter block (e.g. `\n<!--PROMPTS:["...", "..."]-->`) so the client can parse them out.

The prompt instructs the AI to return:
- 3-4 contextual follow-ups that naturally continue or dig deeper into what Ubi just discussed
- 2 new topic starters drawn from a pool of conversation themes (discipline, mood patterns, purpose, dream self, etc.)

**2. Client parses and displays dynamic prompts** (`src/pages/Ubi.tsx`, `src/hooks/useUbiChat.ts`)

- `useUbiChat` extracts the `<!--PROMPTS:...-->` block from the final assistant message content, strips it from the displayed text, and exposes a `suggestedPrompts` state array.
- The preset prompts section renders `suggestedPrompts` when available (after a conversation has started), falling back to the existing static presets for the initial empty state.
- Each dynamic prompt gets a random icon from the existing icon set for visual variety.

**3. Static presets remain for empty state** (`src/pages/Ubi.tsx`)

The current 8 static presets stay as the initial prompt grid shown before any messages exist. Once the conversation starts, dynamic prompts take over.

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/ubi-chat/index.ts` | After streaming the main response, make a second non-streaming AI call to generate 5-6 suggested prompts as JSON. Append them as a parseable delimiter to the stream. |
| `src/hooks/useUbiChat.ts` | Parse the `<!--PROMPTS:...-->` block from assistant messages, strip it from displayed content, expose `suggestedPrompts` state. |
| `src/pages/Ubi.tsx` | Use `suggestedPrompts` from the hook when available; fall back to static presets on empty state. Assign random icons from existing icon pool. Reduce displayed count to 5-6. |

