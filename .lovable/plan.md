

## Fix Overlapping Thumbnails Across Categories

### Problem
Several thumbnail images are shared between different category sections, causing visual repetition when browsing:
- `thumbJournal` appears in both Mindset (`mind-5`, `mind-7`) and Calm (`calm-7`)
- `thumbBreathing` appears in both Wellness (`well-2`) and Calm (`calm-1`)
- `thumbBodyScan` is used twice in Calm (`calm-2`, `calm-6`)

### Changes

**1. Generate 4 new unique thumbnails** (`src/assets/wonder/`)
Create distinct images in the same warm sunlit style for the duplicated slots:
- `thumb-cold-splash.jpg` — for `well-2` (Cold Water Face Splash) — woman splashing cold water on face in a bright bathroom
- `thumb-journaling-calm.jpg` — for `calm-7` (Gratitude Before Sleep) — cozy nighttime journaling scene with warm lamp light
- `thumb-progressive-relaxation.jpg` — for `calm-6` (Progressive Muscle Relaxation) — woman lying down doing relaxation exercise
- `thumb-reframing.jpg` — for `mind-7` (Reframing Negative Thoughts) — soft contemplative scene, person looking out a sunlit window

**2. Update thumbnail mapping** (`src/lib/resourceMedia.ts`)
- Import the 4 new images
- Replace the duplicated references:
  - `well-2`: `thumbBreathing` → `thumbColdSplash`
  - `mind-7`: `thumbJournal` → `thumbReframing`
  - `calm-6`: `thumbBodyScan` → `thumbProgressiveRelaxation`
  - `calm-7`: `thumbJournal` → `thumbJournalingCalm`

### Files to modify/create
- 4 new image assets in `src/assets/wonder/`
- `src/lib/resourceMedia.ts` — import new images, update mappings

