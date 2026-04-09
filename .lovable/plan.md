

## "Start Free Trial" Welcome Modal After Walkthrough

### What changes

When the walkthrough finishes (user taps "Let's begin" on the last step, or skips), instead of going straight to Home silently, a celebratory modal appears on the Home page. It will have:

- The ubloom flower logo
- A warm headline like "Welcome to ubloom"
- A short message: "You have 3 days of full access — explore everything, no card needed."
- A primary button: **"Start my free trial"** (dismisses modal, stays on Home)
- A secondary link: **"View plans"** (navigates to /upgrade)

This is informational only — no payment is collected. It simply makes users aware of the trial.

### Technical approach

1. **New component `src/components/TrialWelcomeModal.tsx`** — a motion-animated modal with glass-card styling matching the walkthrough aesthetic. Renders the logo, copy, and two buttons.

2. **State trigger** — Add a `showTrialWelcome` flag to `userStore`. When the walkthrough completes (`handleNext` on last step or `handleSkip`), set `showTrialWelcome: true` alongside `walkthroughComplete: true`.

3. **Render in `MoodCheckinGate`** (in `App.tsx`) — After walkthrough is done and mood check-in is done, if `showTrialWelcome` is true, render the `TrialWelcomeModal`. When dismissed, set `showTrialWelcome: false`.

4. **Files modified**: `src/stores/userStore.ts` (add flag), `src/components/AppWalkthrough.tsx` (set flag on complete/skip), `src/App.tsx` (render modal), plus the new modal component.

