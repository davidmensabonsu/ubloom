

## Restructure Food & Recipes into Meal-Based Tabs with Nutrition Info

### Overview
Replace the current flat list of nutrition resources with a structured meal-based layout. When the user selects "Food & Recipes", they'll see Breakfast / Lunch / Dinner sub-tabs. Each recipe becomes its own card showing difficulty, healthiness, and prep time at a glance — before tapping to see the full recipe.

### Changes

**1. Expand Recipe data model** (`src/lib/wonderResources.ts`)
- Add fields to `Recipe`: `calories`, `sugar`, `protein`, `carbs`, `fat`, `healthBenefits` (string[]), `difficultyRating` (1-5 stars), `healthRating` (1-5 stars), `mealType` ('breakfast' | 'lunch' | 'dinner' | 'snack')
- Restructure existing recipes with proper meal assignments and add new recipes so each meal category has 3-4 entries (e.g., Overnight Oats for breakfast, Quinoa Power Bowl for lunch, Salmon & Greens for dinner)
- Remove recipes from being nested inside individual nutrition resources; instead create a standalone `mealRecipes` export array

**2. Create MealRecipeCard component** (`src/components/wonder/MealRecipeCard.tsx`)
- Shows thumbnail, recipe name, and prep time
- Below the title: 3 star-based ratings displayed as a compact row:
  - Difficulty (chef hat icon + stars)
  - Healthiness (heart icon + stars)
  - Prep time estimate (clock icon + text like "20 min")
- Tapping opens the full recipe detail

**3. Create FoodRecipesSection component** (`src/components/wonder/FoodRecipesSection.tsx`)
- Renders 3 sub-tabs: Breakfast, Lunch, Dinner (pill-style, smaller than the main category pills)
- Filters `mealRecipes` by selected meal type
- Displays recipes in a 2-column grid using `MealRecipeCard`

**4. Create RecipeDetailSheet component** (`src/components/wonder/RecipeDetailSheet.tsx`)
- Full recipe view with: thumbnail, title, star ratings, nutrition breakdown (calories, sugar, protein, carbs, fat in a clean grid), health benefits list, ingredients, and numbered steps
- Save recipe button (reuses existing savedRecipes store logic)

**5. Update Wonder page** (`src/pages/Wonder.tsx`)
- When `activeCategory === 'nutrition'`, render `<FoodRecipesSection />` instead of the generic resource grid
- Keep the existing generic grid for all other categories

### Files to modify/create
- `src/lib/wonderResources.ts` — expand Recipe interface, add mealRecipes data
- `src/components/wonder/MealRecipeCard.tsx` — new
- `src/components/wonder/FoodRecipesSection.tsx` — new
- `src/components/wonder/RecipeDetailSheet.tsx` — new
- `src/pages/Wonder.tsx` — conditional rendering for nutrition category

