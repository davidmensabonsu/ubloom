

## Always Open a New Chat on Ubi Page

### Problem
When navigating to the Ubi page, it loads the most recent conversation. The desired behavior is to always start with a fresh, empty chat.

### Changes

**`src/hooks/useUbiChat.ts`** (lines ~122-126):
- After loading conversations list, instead of auto-loading the latest conversation, start with an empty state (no `currentConversationId`, empty `messages`)
- The user can still access previous chats via the History sheet

Specifically, replace:
```ts
// Load latest conversation
const latest = withPreviews[0];
setCurrentConversationId(latest.id);
await loadMessagesForConversation(latest.id);
```
with just setting `isLoading` to false, leaving messages empty and `currentConversationId` as null — effectively a new chat state.

### Result
- Opening Ubi always shows a fresh chat with preset prompts
- Previous conversations remain accessible via the History button
- Single file change, minimal impact

