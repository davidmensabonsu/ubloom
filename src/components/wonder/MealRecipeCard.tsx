import { motion } from 'framer-motion';
import { Clock, Heart, ChefHat, Star } from 'lucide-react';
import type { MealRecipe } from '@/lib/wonderResources';
import { resourceThumbnails } from '@/lib/resourceMedia';

interface MealRecipeCardProps {
  recipe: MealRecipe;
  onTap: () => void;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={10}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

export default function MealRecipeCard({ recipe, onTap }: MealRecipeCardProps) {
  // Try to get a thumbnail from resourceMedia, fallback to none
  const thumbnail = resourceThumbnails[recipe.id];

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
      whileTap={{ scale: 0.97 }}
    >
      {/* Thumbnail */}
      {thumbnail && (
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img src={thumbnail} alt={recipe.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-3 space-y-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {recipe.name}
        </h4>

        {/* Calories badge */}
        <span className="text-[10px] font-medium inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {recipe.calories} kcal
        </span>

        {/* Ratings row */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <ChefHat size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground w-12">Difficulty</span>
            <StarRating rating={recipe.difficultyRating} />
          </div>
          <div className="flex items-center gap-1.5">
            <Heart size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground w-12">Healthy</span>
            <StarRating rating={recipe.healthRating} />
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground">{recipe.prepTime}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
