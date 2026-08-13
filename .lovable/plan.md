# Fix Ubi follow-up prompts to be user-centric

## Problem
After Ubi’s warm auto-opener ("I’ve been thinking about you, what’s on your mind?"), the AI-generated chip prompts ask Ubi about itself — e.g. how Ubi is doing or what Ubi is thinking. Those prompts should be from the user’s perspective: things the user might want to ask/know to help themselves, staying on the topic of the conversation, and guiding users who don’t know where to start.

## What we’ll change

### 1. Rewrite the prompt generator in `supabase/functions/ubi-chat/index.ts`
Update the secondary prompt (the one that generates the 5–6 follow-up chips) so it:
- Generates prompts from the **user’s first-person perspective** (e.g. “I feel…”, “Help me…”, “What should I…”).
- Explicitly **forbids any prompt that asks Ubi about itself** — no “How are you?”, “What are you thinking about?”, “What do you think about…?” directed at Ubi.
- Requires prompts to be **helpful to the user**: ask for clarity, insight, recommendations, or a concrete next step.
- Keeps them **on-topic** to Ubi’s last reply, not generic conversation starters.
- Adds clearer GOOD/BAD examples covering the opener case and the deep-reply case.

### 2. Show the initial user-centric presets after the auto-opener in `src/pages/Ubi.tsx`
Right now the initial `presetPrompts` chips are hidden as soon as `ubiOnboardingComplete && ubiIntroSeen` is true, which is exactly when the auto-opener fires. We’ll change the condition so those presets remain visible **until the user has sent at least one real message**. That gives the user reliable, human-centric starting options immediately after Ubi’s greeting, instead of relying on AI-generated chips that may be off-target.

### 3. Only render AI-generated suggested chips after the user has engaged
Once the user sends a message, the edge-function-generated chips will appear. Because of change #1, they will be user-centric and on-topic. The UI condition will be updated so the AI-generated horizontal strip is not shown when there are no user messages yet (the preset chips handle that state instead).

## Files to edit
- `supabase/functions/ubi-chat/index.ts` — rewrite the prompt generator system prompt.
- `src/pages/Ubi.tsx` — adjust the preset/suggested prompt visibility logic.

## Verification
- Open `/ubi` in the preview.
- After Ubi’s auto-opener, confirm the chip options are user-centric (e.g. “I feel lost — help me find direction”, “What should I focus on today?”).
- Tap one, reply, and confirm the next chips are still about the user’s needs, not about Ubi.
