

## Ubi Chat History — Multiple Conversations with Cross-Chat Memory

### Overview
Replace the single-conversation model with a multi-conversation system. Users can start new chats, browse past conversations, and Ubi can reference previous chats when asked.

### Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Ubi Page   │────▶│  Chat List View   │────▶│  Active Chat    │
│  (router)   │     │  (sidebar/sheet)  │     │  (current view) │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │
                    ┌──────┴──────┐
                    │ ubi_conversations │  (DB table)
                    │ ubi_messages      │  (DB table)
                    └─────────────┘
```

### Database Changes

**Table: `ubi_conversations`**
- `id` (uuid, PK)
- `user_id` (uuid, not null)
- `title` (text, default 'New chat') — auto-generated from first user message
- `created_at`, `updated_at` (timestamptz)

**Table: `ubi_messages`**
- `id` (uuid, PK)
- `conversation_id` (uuid, FK → ubi_conversations)
- `user_id` (uuid, not null)
- `role` (text: 'user' | 'assistant')
- `content` (text)
- `rating` (text, nullable)
- `created_at` (timestamptz)

RLS: Users can only CRUD their own rows. Admins can SELECT all.

### Edge Function Update — `ubi-chat/index.ts`

Add an optional `conversationId` param. When the user says something like "remember when we talked about X" or "in our last chat", the function:
1. Receives a `chatHistory` summary (generated client-side or via a second lightweight query) of recent conversation titles + snippets
2. Includes this in the system prompt so Ubi can reference past chats naturally

The system prompt gets an additional section:
```
## Past Conversations
The user has had previous chats with you. Here are recent conversation summaries:
[titles + first/last message snippets]
If the user references a past conversation, use this context naturally.
```

### UI Changes — `src/pages/Ubi.tsx`

1. **Header**: Add a chat history icon button (left of trash). Tapping opens a bottom sheet listing past conversations with title, date, and preview snippet.
2. **New Chat button**: In the sheet header — starts a fresh conversation (current chat gets saved automatically).
3. **Chat list items**: Tap to load that conversation's messages. Swipe-to-delete or long-press delete.
4. **Current "Clear Chat" → "New Chat"**: Instead of deleting, it saves the current conversation and starts fresh.
5. **Auto-title**: After the first assistant response, generate a short title from the first user message (truncate to ~40 chars).

### Hook Refactor — `src/hooks/useUbiChat.ts`

- Replace JSONB persistence (`ubiMessages` in user_data) with direct database reads/writes to `ubi_conversations` + `ubi_messages`
- New state: `currentConversationId`, `conversations` (list for sidebar)
- `loadConversation(id)` — fetch messages for a conversation
- `startNewChat()` — create new conversation row, clear current messages
- `loadConversations()` — fetch list with title + last message preview
- On `sendMessage`: insert user message row, then stream assistant response, insert assistant message row
- On first message of a new chat: auto-set conversation title
- Build `chatHistory` summary from recent conversations to pass to edge function

### Migration from existing data
- On first load, if `profile.ubiMessages` exists and no conversations in DB, migrate those messages into a new conversation row.

### Files Changed

| File | Change |
|------|--------|
| Migration SQL | Create `ubi_conversations` + `ubi_messages` tables with RLS |
| `src/hooks/useUbiChat.ts` | Full refactor to DB-backed multi-conversation model |
| `src/pages/Ubi.tsx` | Add chat history sheet, new chat button, update header |
| `supabase/functions/ubi-chat/index.ts` | Accept `chatHistory` param, add past-conversations context to system prompt |

