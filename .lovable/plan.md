

## Add "What are your interests?" to Onboarding

### What changes

1. **UserProfile type** (`src/stores/userStore.ts`): Add `interests: string[]` field to the `UserProfile` interface and initialize it as `[]` in `initialProfile`.

2. **Onboarding flow** (`src/pages/Onboarding.tsx`): Insert a new `multi` step (id: `interests`) after the `struggles` step with the question "What are your interests?" and these options: Pilates, Gym, Beauty, Skincare, Business, Reading, Travel, Journaling, Wellness. On completion, save `answers.interests` to `updateProfile({ interests: ... })`.

3. **Wonder recommendations edge function** (`supabase/functions/wonder-recommendations/index.ts`): Accept `interests` in the request body, and include it in the `userContext` string sent to the AI (e.g. `Interests: pilates, gym, beauty`).

4. **Recommendation caller**: Find wherever the client calls the `wonder-recommendations` function and pass `profile.interests` alongside the existing profile fields.

### Technical details

- The interests step uses `type: 'multi'` with no `max` limit, matching the existing `struggles` and `dreamFeels` steps.
- The step is inserted as the 3rd question (index 2) in the `onboardingSteps` array.
- Data flows: onboarding → userStore → cloud sync (automatic via existing `useCloudSync`) → edge function context → AI recommendations.
- No database schema changes needed — interests are stored in the existing `user_data.data` JSON blob via cloud sync.

