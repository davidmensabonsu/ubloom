import { useState } from 'react';
import { motion } from 'framer-motion';
import { mealRecipes, type MealRecipe, type MealType } from '@/lib/wonderResources';
import MealRecipeCard from './MealRecipeCard';
import RecipeDetailSheet from './RecipeDetailSheet';

const mealTabs: { key: MealType; label: string; emoji: string }[] = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { key: 'lunch', label: 'Lunch', emoji: '☀️' },
  { key: 'dinner', label: 'Dinner', emoji: '🌙' },
];

export default function FoodRecipesSection() {
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecipe | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = mealRecipes.filter((r) => r.mealType === activeMeal);

  const handleSelect = (recipe: MealRecipe) => {
    setSelectedRecipe(recipe);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Meal sub-tabs */}
      <div className="flex gap-2">
        {mealTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveMeal(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              activeMeal === tab.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <MealRecipeCard recipe={recipe} onTap={() => handleSelect(recipe)} />
          </motion.div>
        ))}
      </div>

      <RecipeDetailSheet
        recipe={selectedRecipe}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
