The empty state is happening because the opening Ubi reply is generated in the browser session, but the assistant reply is not being reliably saved to the database before you leave/reopen. On top of that, the follow-up prompt strip is only kept in temporary page state, so it disappears on reload.

Plan:

1. **Persist Ubi’s opening assistant message correctly**
   - Keep the existing security rule that users can only create their own user messages.
   - Move assistant-message persistence into the Ubi backend function, so Ubi replies can be saved safely without weakening database permissions.
   - Make the frontend pass the active conversation ID and auth token when requesting a Ubi response.

2. **Restore the exact “left page” state for unfinished chats**
   - When the Ubi page opens, load the latest conversation if it is still inside the 12-hour window or if the user has not sent a message yet.
   - If that conversation has an opening assistant message, show it instead of creating a new blank chat.
   - If a conversation exists but somehow has no saved messages, trigger one fresh opener rather than leaving the screen empty.

3. **Reload the horizontal prompts after returning**
   - Preserve the AI-generated suggested prompts with the saved assistant message instead of only storing them in React state.
   - When loading a conversation, extract those prompts back into `suggestedPrompts` so the horizontal prompt strip returns with the opening message.

4. **Keep the restart rules exactly as requested**
   - New opening message only when the plus button starts a new chat.
   - New opening message only when 12 hours have passed since the last Ubi/user interaction.
   - Otherwise, reopening Ubi restores the conversation exactly as it was when the user left.