

## Improve Ubi Suggested Prompts — Conversation Flow

### Problem
Current prompts are generic conversation-continuers ("Can you give me an example?"). They should be **specific to what Ubi actually said** — e.g., if Ubi mentions lofi music for focus, a prompt should be "What are the best lofi songs to listen to?"

### Change
Update the system prompt in the prompt-generation call inside `supabase/functions/ubi-chat/index.ts` (lines 123-131) to instruct the model to generate **content-specific** follow-ups that explore concrete details, recommendations, or actionable next steps mentioned in Ubi's response — not just meta-conversation prompts.

### Updated Prompt Instructions

```
You generate suggested follow-up prompts for a mentoring chat app.
Return ONLY a JSON array of 5-6 short prompt strings (max 50 chars each).

Read the mentor's reply carefully. Generate prompts that explore SPECIFIC things
the mentor mentioned — ask for recommendations, details, examples, or actionable
steps related to the actual content of the reply.

For example, if the mentor mentioned listening to lofi music to focus:
  GOOD: "What are the best lofi songs to listen to?"
  BAD: "Can you tell me more about that?"

If the mentor suggested journaling:
  GOOD: "What should I write about in my journal?"
  BAD: "How do I actually start?"

Mix of prompt types:
- 3-4 that dig into specific details/recommendations from the reply
- 1-2 that explore the emotional or personal angle of what was discussed

Keep them casual, first person, as if the user is naturally responding.
```

### Files

| File | Change |
|------|--------|
| `supabase/functions/ubi-chat/index.ts` | Update system prompt for prompt generation (lines 123-131) |

