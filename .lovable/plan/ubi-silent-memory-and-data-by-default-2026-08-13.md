# Ubi: silent memory and data by default

Ubi keeps storing everything (memory, past chats, cycle, mood, habits, journals) but stops surfacing any of it unless the user's message genuinely calls for that insight.

## What changes for the user

- Normal chat: Ubi never mentions past conversations, cycle phase, sleep, mood, habits, or journal entries — not in the opener, not woven in mid-reply.
- Insight questions ("why do I feel unmotivated so often?", "what's holding me back?", "am I making progress?"): Ubi may draw on the stored data and past chats to answer, because that's what the question needs.
- Direct asks about the data ("what's my cycle day?", "what did we talk about last time?") are always answered.
- No storage or sync changes — everything continues to be saved exactly as today.

## Technical detail

Single file: `supabase/functions/ubi-chat/index.ts` (system prompt only, then redeploy).

- Rewrite the "How you use data" and "Memory" sections into one section stating the default is silence: context and past-chat summaries are for Ubi's private understanding only, not for reference in replies.
- Define the narrow exception: reference stored data or history only when the user asks a question whose answer depends on it (patterns, causes, progress, decisions about their goals) or asks about it directly.
- Reframe the `chatHistorySection` wrapper text the same way: summaries are background, do not allude to them unprompted.
- Add explicit rules: no unprompted callbacks ("last time you said…"), no unprompted data weaving, no "I noticed you…" openers.
- Streaming, follow-up prompt generation, CORS, and error handling stay untouched. Other edge functions (health-insights, weekly summary, etc.) are unchanged, since those features are explicitly about the data.
