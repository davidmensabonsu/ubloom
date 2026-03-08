

## Problem

When typing in the goal input on mobile, the on-screen keyboard pushes the "Add Goal" button out of view. The modal is positioned at the bottom (`flex items-end`) with `max-h-[80vh]`, but the keyboard shrinks the visible viewport, hiding the fixed footer button.

## Plan

**File: `src/pages/Goals.tsx`** — Restructure the modal to stay visible above the keyboard:

1. Change the modal overlay from `flex items-end` to `flex items-center justify-center` (or use a fixed/sticky approach) so the modal stays centered in the remaining viewport.
2. Reduce `max-h-[80vh]` to something smaller like `max-h-[70vh]` or use `max-h-[min(80vh,400px)]` to ensure the modal doesn't exceed the keyboard-reduced viewport.
3. Move the "Add Goal" button out of the scrollable area and make it sticky at the bottom using `sticky bottom-0` with a background, ensuring it's always visible regardless of scroll position or keyboard state.
4. Add `autoFocus` to the input so the keyboard opens immediately, and use CSS `dvh` (dynamic viewport height) units instead of `vh` to account for mobile keyboard: `max-h-[70dvh]`.

These changes ensure the save button remains visible when the mobile keyboard is active.

