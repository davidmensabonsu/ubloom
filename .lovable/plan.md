

## Refine Ubi's System Prompt for Better Tone & Brevity

### Problem
Three issues with Ubi's current responses:
1. **Too verbose** — 3-5 paragraphs feels overwhelming, especially as an opening
2. **Mismatched openers** — says things like "I hear you" before the user has shared anything
3. **Premature follow-ups** — asks "how did that task feel?" before the user has done it

All three stem from the system prompt instructions in the edge function.

### Changes

**File: `supabase/functions/ubi-chat/index.ts`** — Rewrite the system prompt:

1. **Condense response length**: Change "3-5 paragraphs" to "2-3 short paragraphs max". Add rule: "Be concise. Say more with less. Avoid walls of text."

2. **Fix contextual awareness**: Add rules:
   - "NEVER use phrases like 'I hear you', 'I see you', or 'I feel that' unless the user has actually shared something in the conversation first."
   - "Match your opener to the conversation state — if it's the first message or a preset prompt, respond directly to the topic without pretending you've been listening."

3. **Fix premature task follow-ups**: Add rule:
   - "When suggesting an action, do NOT immediately ask how it went or how it felt. The user hasn't done it yet. Instead, encourage them to try it and come back to share."

4. **Soften the data reference requirement**: Change "NEVER give generic advice. Always tie it back to THEIR data" to "Personalise using their goals and vision when relevant, but don't force data references into every sentence. Let it feel natural."

5. **Simplify response structure**: Change the rigid 3-element structure (Insight + Direct Observation + Clear Action) to a softer guideline: "Naturally weave in a reflection and a concrete action when appropriate — but keep it conversational, not formulaic."

**File: `src/pages/Ubi.tsx`** — Update the welcome prompt to reinforce brevity: add "Keep it to 2 short paragraphs max."

