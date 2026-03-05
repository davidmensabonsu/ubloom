

## Problem

The "Continue" button on the last slide of DreamLife and "Enter my space" on ChooseAesthetic silently fail because the app's localStorage quota is exceeded. The zustand `persist` middleware tries to save the store to `localStorage` under key `ubloom-user-storage`, but the data (especially `dreamImages` URLs, `habitCompletions`, `moodboardItems`, etc.) has grown too large. When `setItem` throws `QuotaExceededError`, the state update crashes and `navigate()` never runs.

## Plan

### 1. Add error handling to zustand persist storage

In `src/stores/userStore.ts`, provide a custom `storage` option to the `persist` middleware that wraps `setItem` in a try-catch. On quota errors, log a warning instead of crashing the app.

### 2. Prune old habit completions to reduce storage size

Add logic to only keep the last 90 days of `habitCompletions` when persisting, since older data isn't used. This prevents unbounded growth of the stored data.

### 3. Limit moodboard and journal history size

Cap stored `journalEntries` and `moodHistory` to the most recent 200 entries to prevent future quota issues.

These changes ensure the buttons work even when storage is near capacity, and prevent the store from growing unboundedly over time.

