# Horizontal preset pills + varied Ubi opener

## 1. Make the fresh-chat preset prompts horizontal again
In `src/pages/Ubi.tsx`, the initial preset block currently renders full-width stacked buttons (`space-y-1.5`, `w-full`). Change it to match the AI-suggested chip strip already used inline in the chat:
- Wrap in a horizontally scrollable container (`overflow-x-auto scrollbar-hide`) with an inner `flex gap-2 w-max`.
- Convert each button to a compact pill: `rounded-full`, `px-3 py-1.5`, `whitespace-nowrap shrink-0`, small text, same white/primary border styling as the suggested chips so both states look identical.

## 2. Vary Ubi's first message
The auto-opener always produces near-identical greetings ("Good to see you", "I've been thinking about you") because the system opener prompt is a fixed string. Update the `openerPrompt` in `src/pages/Ubi.tsx` to:
- Include a small rotating set of opener *angles* (e.g. warm check-in, curious invitation, calm grounding, forward-looking, light and casual) and pass one chosen at random per fresh conversation.
- Explicitly instruct it to avoid reusing the phrases "Good to see you" and "I've been thinking about you".
- Keep all existing guardrails: 1-2 sentences, one open question, no cycle/mood/sleep/habit/journal/past-chat references, no corporate "How can I help you today?", no acknowledging the system instruction.

## Files
- `src/pages/Ubi.tsx` only. No backend or edge function changes.

## Verification
Open `/ubi`, start a new chat a few times: the opener wording should differ each time, and the preset pills should sit in one horizontal scrollable row.
