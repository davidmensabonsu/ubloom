import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, UtensilsCrossed } from 'lucide-react';
import { mealRecipes, type MealRecipe, type MealType } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import MealRecipeCard from './MealRecipeCard';
import RecipeDetailSheet from './RecipeDetailSheet';
import heartIcon from '@/assets/icons/heart.png';
import sunriseIcon from '@/assets/icons/sunrise.png';
import sunIcon from '@/assets/icons/sun.png';
import moonIcon from '@/assets/icons/moon.png';
import fruitIcon from '@/assets/icons/fruit.png';

type TabKey = MealType | 'saved';

const mealTabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'saved', label: 'Saved', icon: heartIcon },
  { key: 'breakfast', label: 'Breakfast', icon: sunriseIcon },
  { key: 'lunch', label: 'Lunch', icon: sunIcon },
  { key: 'dinner', label: 'Dinner', icon: moonIcon },
  { key: 'snack', label: 'Snacks', icon: fruitIcon },
];

export default function FoodRecipesSection() {
  const [activeMeal, setActiveMeal] = useState<TabKey>('breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecipe | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const savedIds = profile.savedResources || [];

  const filtered = activeMeal === 'saved'
    ? mealRecipes.filter((r) => savedIds.includes(r.id))
    : mealRecipes.filter((r) => r.mealType === activeMeal);

  const handleSelect = (recipe: MealRecipe) => {
    setSelectedRecipe(recipe);
    setSheetOpen(true);
  };

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedIds.includes(id) ? unsaveResource(id) : saveResource(id);
  };

  const savedCount = mealRecipes.filter((r) => savedIds.includes(r.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {mealTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveMeal(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              activeMeal === tab.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.emoji} {tab.label}
            {tab.key === 'saved' && savedCount > 0 && (
              <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {savedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeMeal === 'saved' && filtered.length === 0 ? (
          <motion.div
            key="empty-saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <UtensilsCrossed size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any recipe to save it
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeMeal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {filtered.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <MealRecipeCard recipe={recipe} onTap={() => handleSelect(recipe)} />
                <button
                  onClick={(e) => handleToggleSave(e, recipe.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors hover:bg-background z-10"
                >
                  <Bookmark
                    size={14}
                    className={savedIds.includes(recipe.id) ? 'text-primary fill-primary' : 'text-muted-foreground'}
                  />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <RecipeDetailSheet
        recipe={selectedRecipe}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
