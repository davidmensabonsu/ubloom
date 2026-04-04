

## Remove Journaling from Wander

### Overview
Remove all journal-related resources and interactive components from the Wander section, since journaling already lives on the Reflect page.

### Changes

**`src/lib/wonderResources.ts`**:
- Remove resource `mind-7` ("Future Self Journaling")
- Remove resource `calm-7` ("Journaling for Release")
- Remove any other resources whose title/description is primarily about journaling (will do a final check — `life-5` "Gratitude Before Bed" uses a journal prompt but is really a gratitude exercise, so it may stay as a gratitude exercise or be removed too)
- Clean up incidental mentions of "journal" in content text of other resources (e.g. "journal, or simply sit" in lifestyle tips) — these are minor passing references, not journal features, so they can stay

**`src/components/wonder/ResourceDetailSheet.tsx`**:
- Remove the `case 'mind-7'` and corresponding `JournalPrompt` block
- Remove the `case 'mind-5'` block (belief rewriting journal prompt)
- Remove the `case 'life-5'` block (gratitude journal prompt)
- Remove the `JournalPrompt` import if no cases remain

**`src/components/wonder/JournalPrompt.tsx`**:
- Delete this component file entirely (no longer used anywhere in Wander)

### What stays
- The Reflect page's journaling is untouched
- Resources that merely mention "journal" in passing within their content text (lifestyle tips, podcast descriptions) remain — they're not journal features

