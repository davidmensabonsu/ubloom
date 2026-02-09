
# Implement Moodboard Image Upload and Management

## Overview
The Moodboard page currently displays placeholder UI with non-functional buttons. This plan implements full image upload, quote creation, and board management so users can build visual moodboards.

## What Will Change

### 1. Extend User Store with Moodboard Data
Add new types and state for moodboard items (images and quotes) organized into boards:
- `MoodboardItem` type with fields for `id`, `type` (image/quote), `url` or `text`, `board` category, and `createdAt`
- Store actions: `addMoodboardItem`, `removeMoodboardItem`

### 2. Build the Moodboard Page
Replace the current placeholder with a working moodboard that supports:
- **Add Image**: Opens file picker, uploads to the `vision-images` storage bucket under the user's folder, and displays it on the board
- **Add Quote**: Opens a dialog/input to type an inspirational quote
- **Board Categories**: Tapping a board category (e.g., "Soft Life", "Travel Dreams") filters or groups items
- **Delete Items**: Long-press or tap an X button to remove an item (also deletes from storage)
- **Masonry/Grid Layout**: Display uploaded images and quotes in a visually appealing grid

### 3. Image Upload Flow
Reuses the same pattern already working in `DreamLife.tsx`:
- Upload to `vision-images` bucket at path `{user.id}/moodboard/{timestamp}.{ext}`
- Store the public URL in the Zustand store (synced to cloud via existing `useCloudSync`)
- Show upload progress indicator

### 4. Cloud Persistence
No database changes needed -- moodboard items will be stored in the existing `user_data` JSONB column via the Zustand store and cloud sync, same as all other profile data. Images themselves are stored in the existing `vision-images` bucket.

## Technical Details

### New Types (in `userStore.ts`)
```typescript
interface MoodboardItem {
  id: string;
  type: 'image' | 'quote';
  content: string; // URL for images, text for quotes
  board: string;   // category name
  createdAt: string;
}
```

### Files Modified
- **`src/stores/userStore.ts`** -- Add `moodboardItems: MoodboardItem[]` to `UserProfile`, plus `addMoodboardItem` and `removeMoodboardItem` actions
- **`src/pages/Moodboard.tsx`** -- Full rewrite with upload logic, quote dialog, board filtering, and item grid display

### Files Created
- **`src/components/moodboard/AddQuoteDialog.tsx`** -- Dialog component for adding text quotes
- **`src/components/moodboard/MoodboardGrid.tsx`** -- Grid/masonry layout for displaying items

### Storage
Uses the existing `vision-images` bucket with existing RLS policies (user can only write to their own folder).
