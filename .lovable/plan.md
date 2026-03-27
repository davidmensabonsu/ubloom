

## Replace Dream Life Page with Ubi — Personal AI Mentor Chat

### Overview
Remove the DreamLife page from the main navigation and replace it with **Ubi**, a streaming AI chat experience that acts as a personalised digital mentor. Ubi uses all stored user data (mood, habits, journal, onboarding answers, dream self) to deliver contextual, actionable guidance. The DreamLife page remains accessible only during onboarding.

### User Experience
- Bottom nav "Dream" tab becomes **"Ubi"** with a chat bubble icon
- Full-screen chat interface with streaming responses (ChatGPT-style)
- Preset prompt chips at the top for guided reflection (e.g., "How am I really doing?", "Help me find clarity", "What patterns do you see?")
- Free-text input always available at the bottom
- Each Ubi response contains: an **insight** (pattern/observation), a **direct observation** (referencing user data), and a **clear action** (specific instruction)
- Conversation history persists in the user store (pruned to last 50 messages)
- Markdown rendering for rich responses

### Technical Approach

**1. New edge function: `supabase/functions/ubi-chat/index.ts`**
- Accepts `{ messages, userContext }` where `userContext` is a summary of the user's stored data
- Streams responses via SSE using the Lovable AI Gateway (`google/gemini-3-flash-preview`)
- System prompt instructs Ubi to be a trusted mentor who references the user's mood history, habit completion rates, journal themes, onboarding answers, and dream self vision
- Handles 429/402 errors gracefully

**2. New page: `src/pages/Ubi.tsx`**
- Streaming chat UI with message list and input bar
- On mount, builds `userContext` from the Zustand store (recent moods, habit completion %, journal themes, struggles, dream self, identity statement)
- Preset prompt chips rendered above the message list when conversation is empty
- Messages rendered with `react-markdown` for rich formatting
- Auto-scroll to latest message

**3. New hook: `src/hooks/useUbiChat.ts`**
- Manages message state, streaming logic, and conversation history
- Builds user context payload from `useUserStore`
- Handles SSE parsing with token-by-token streaming
- Persists conversation in store (capped at 50 messages)

**4. Update store: `src/stores/userStore.ts`**
- Add `ubiMessages: UbiMessage[]` to `UserProfile`
- Add `setUbiMessages` and `addUbiMessage` actions

**5. Update routing: `src/App.tsx`**
- Replace `/dream-life` route with `/ubi` (keep `/dream-life` for onboarding flow only)
- Add Ubi as a protected route

**6. Update navigation: `src/components/BottomNav.tsx`**
- Replace the Moodboard "Dream" tab with **"Ubi"** pointing to `/ubi` with a `MessageCircle` icon
- Move Moodboard access elsewhere (e.g., Profile page or keep as a standalone route accessible from Home)

**7. Preset prompts**
- "How am I really doing?"
- "Help me find clarity right now"
- "What patterns do you see in my mood?"
- "I'm feeling stuck — what should I do?"
- "Am I aligned with my dream self?"
- "Give me something to focus on today"

### Files to create
- `supabase/functions/ubi-chat/index.ts`
- `src/pages/Ubi.tsx`
- `src/hooks/useUbiChat.ts`

### Files to modify
- `src/stores/userStore.ts` — add `ubiMessages` field and actions
- `src/components/BottomNav.tsx` — replace Dream tab with Ubi
- `src/App.tsx` — add `/ubi` route, keep `/dream-life` for onboarding only

