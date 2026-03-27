

## Persist Used Preset Prompts Per Day & Dynamic Post-Message Prompts

### Problem
1. Preset prompts reappear after page reload even if used today
2. After sending a message, prompts don't update to reflect the current conversation topic — they stay as generic presets until AI-generated suggestions arrive

### Solution

**1. Daily preset persistence** — Store used preset prompt texts in `localStorage` with today's date as key. On load, filter out any presets already used today. Reset automatically on new day.

**2. Prompts always reflect conversation** — After the first message is sent (and AI responds), only show AI-generated `suggestedPrompts`. Never fall back to generic presets once a conversation has started. The presets only show on an empty/new chat.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Ubi.tsx` | Add localStorage tracking of used presets by date; filter presets list; only show presets when `messages.length === 0`, otherwise show only `suggestedPrompts` |
| `src/hooks/useUbiChat.ts` | No changes needed — `markPromptUsed` already handles in-session hiding |

### Detail

- **localStorage key**: `ubi-used-presets-YYYY-MM-DD` storing a JSON array of used prompt strings
- **`handlePreset`**: On use, append prompt text to today's localStorage array
- **Prompt display logic**:
  - If no messages yet → show presets filtered by today's used list
  - If messages exist → show only `suggestedPrompts` (AI-generated, conversation-specific)
  - If messages exist but no suggestedPrompts yet (still streaming) → show nothing

