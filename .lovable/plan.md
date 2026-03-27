

## "Ask Ubi about this" — Journal-to-Ubi Bridge

### What it does
After saving a journal entry, a button appears saying **"Talk to Ubi about this"** that navigates the user to the Ubi page with their journal text pre-loaded as the first message, starting a new conversation seamlessly.

### How it works

1. **`src/pages/Alignment.tsx`** — After save confirmation, show an animated "Talk to Ubi about this" button (using a chat/message icon). On click, navigate to `/ubi` with the journal content passed via React Router state: `navigate('/ubi', { state: { journalEntry: savedText } })`. Store the text before clearing `journalText` in `handleSave`.

2. **`src/pages/Ubi.tsx`** — Read `location.state?.journalEntry`. If present, start a new conversation and auto-send a contextual message like: `"I just wrote this in my journal and I'd like to talk about it:\n\n{entry}"`. Clear the location state after consuming it so refresh doesn't re-trigger.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Alignment.tsx` | Add `useNavigate`, store saved text, show "Talk to Ubi about this" button after save, navigate with state |
| `src/pages/Ubi.tsx` | Read `location.state?.journalEntry`, auto-start new conversation with journal context |

