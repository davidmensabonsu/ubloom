import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Star, ChefHat, Heart, Clock, Bookmark, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MealRecipe } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { haptic } from '@/lib/feedback';

interface RecipeDetailSheetProps {
  recipe: MealRecipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

export default function RecipeDetailSheet({ recipe, open, onOpenChange }: RecipeDetailSheetProps) {
  const { profile, saveRecipe, unsaveRecipe } = useUserStore();

  if (!recipe) return null;

  const recipeKey = `meal::${recipe.id}`;
  const isSaved = (profile.savedRecipes || []).includes(recipeKey);

  const handleToggleSave = () => {
    haptic();
    if (isSaved) {
      unsaveRecipe(recipeKey);
    } else {
      saveRecipe(recipeKey);
    }
  };

  const nutritionItems = [
    { label: 'Calories', value: `${recipe.calories}`, unit: 'kcal' },
    { label: 'Protein', value: recipe.protein },
    { label: 'Carbs', value: recipe.carbs },
    { label: 'Fat', value: recipe.fat },
    { label: 'Sugar', value: recipe.sugar },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl p-0">
        <SheetTitle className="sr-only">{recipe.name}</SheetTitle>

        <div className="p-5 space-y-5">
          {/* Title & Save */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">{recipe.name}</h2>
            <Button variant="ghost" size="icon" onClick={handleToggleSave} className="shrink-0">
              <Bookmark size={18} className={isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'} />
            </Button>
          </div>

          {/* Ratings */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <ChefHat size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Difficulty</span>
              <StarRating rating={recipe.difficultyRating} />
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Healthy</span>
              <StarRating rating={recipe.healthRating} />
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{recipe.prepTime}</span>
            </div>
          </div>

          {/* Nutrition Grid */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Nutrition</h3>
            <div className="grid grid-cols-5 gap-2">
              {nutritionItems.map((item) => (
                <div key={item.label} className="bg-muted/40 rounded-xl p-2.5 text-center">
                  <p className="text-sm font-semibold text-foreground">{item.value}{item.unit ? '' : ''}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Health Benefits */}
          {recipe.healthBenefits.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Health Benefits</h3>
              <ul className="space-y-1.5">
                {recipe.healthBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 size={12} className="text-primary shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0 mt-1.5" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Steps</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-xs text-muted-foreground">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
