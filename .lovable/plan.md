

## Replace Health Page with Cycle Tracker

### Overview
Replace the existing Health page at `/health` with a full Cycle Tracker. First-time visitors see a 3-step setup flow; returning visitors land on the main tracker with cycle wheel, insights, mood, and Ubi recommendations.

### Data Model Changes

**`src/stores/userStore.ts`**:
- Add `CycleData` interface: `{ lastPeriodStart: string, cycleLength: number, periodLength: number, setupComplete: boolean }`
- Add `cycleData?: CycleData` to `UserProfile`
- Keep existing `healthData` / `healthHistory` (no removal needed, just unused by this page)

### New Files

**`src/lib/cycleUtils.ts`** — Pure cycle calculation functions:
- `getCurrentCycleDay(lastPeriodStart, cycleLength)` → number
- `getCurrentPhase(cycleDay, periodLength, cycleLength)` → 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal'
- `getNextPeriodDate(lastPeriodStart, cycleLength)` → Date
- `getPhaseInsight(phase)` → warm, uBloom-toned description of energy/mood/focus/self-care for that phase

**`src/components/cycle/CycleSetup.tsx`** — 3-step full-screen setup:
- Step 1: "When did your last period start?" — date picker (Shadcn Calendar in a centered card)
- Step 2: "How long is your average cycle?" — horizontal tap selector, 21–35 days, 28 default
- Step 3: "How long does your period usually last?" — tap selector, 3–8 days
- Each step on its own screen with framer-motion transitions, soft heading, minimal layout
- On submit: saves `cycleData` with `setupComplete: true` via `updateProfile`

**`src/components/cycle/CycleWheel.tsx`** — Visual cycle display:
- SVG circle divided into 4 colored arcs (Menstrual, Follicular, Ovulatory, Luteal) with soft pastel fills
- Current phase arc highlighted/glowing
- Center text: current cycle day + phase name
- Below circle: predicted next period date

**`src/components/cycle/CycleInsightCard.tsx`** — "Today's Cycle Insight" glass card with phase-appropriate warm text from `getPhaseInsight()`

**`src/components/cycle/CycleMoodCard.tsx`** — "How are you feeling today?" card pulling from `profile.moodHistory` and `profile.dailyCheckinState` to show recent mood trend relevant to cycle

### Modified Files

**`src/pages/Health.tsx`** → Complete rewrite as Cycle Tracker:
- If `!profile.cycleData?.setupComplete` → render `<CycleSetup />`
- Otherwise render main page: header with settings gear icon (opens setup flow in edit mode), `<CycleWheel />`, `<CycleInsightCard />`, `<CycleMoodCard />`, Ubi Insights section
- Settings icon in top-right lets user re-enter setup to update cycle details

**`supabase/functions/health-insights/index.ts`** → Update system prompt:
- Include cycle phase context in the prompt
- Ask Ubi to generate 2–3 (not 4) recommendations that reference the cycle phase naturally
- E.g. "During your menstrual phase, your body is asking for rest — maybe swap that HIIT session for a gentle walk or some stretching"

### Route / Nav
- Route stays at `/health`, no changes to `App.tsx` or `BottomNav.tsx`
- The back button label changes from "Reflect" to match, page title becomes "Cycle Tracker"

### Icons
- Use existing clay PNG icons: `moon.png` (cycle/menstrual), `blossom.png` (follicular), `sun.png` (ovulatory), `leaf.png` (luteal), `crystal-ball.png` (Ubi insights), `sparkles.png` (mood)
- No system emojis

### Design Notes
- All cards use `glass-card rounded-2xl` consistent with rest of app
- Setup flow uses `gradient-background`, centered layout, serif heading via `font-display`
- Cycle wheel uses theme-aware HSL colors from CSS variables
- Animations via framer-motion matching existing page patterns

