import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import RecipeDetailSheet from '@/components/wonder/RecipeDetailSheet';
import FitnessDetailSheet from '@/components/wonder/FitnessDetailSheet';
import FeaturedBanner from '@/components/wonder/FeaturedBanner';
import PinterestCard from '@/components/wonder/PinterestCard';
import WonderStreak from '@/components/wonder/WonderStreak';
import { useUserStore } from '@/stores/userStore';
import {
  wonderResources,
  wonderCategories,
  mealRecipes,
  fitnessWorkouts,
  categoryColors,
  typeLabels,
  type WonderResource,
  type WonderCategory,
  type MealRecipe,
  type FitnessWorkout,
} from '@/lib/wonderResources';
import { resourceThumbnails, fitnessThumbnails } from '@/lib/resourceMedia';

type ViewMode = 'for-you' | 'popular';

// Unified item for the masonry grid
interface GridItem {
  id: string;
  type: 'resource' | 'meal' | 'fitness' | 'collection';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  badge?: string;
  tall?: boolean;
  category?: string;
  data?: WonderResource | MealRecipe | FitnessWorkout;
  collection?: { images: string[]; labels: string[] };
}

export default function Wonder() {
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<MealRecipe | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<FitnessWorkout | null>(null);
  const [resourceSheetOpen, setResourceSheetOpen] = useState(false);
  const [recipeSheetOpen, setRecipeSheetOpen] = useState(false);
  const [fitnessSheetOpen, setFitnessSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCategory, setFeaturedCategory] = useState<WonderCategory | null>(null);
  const savedIds = useUserStore((s) => s.profile.savedResources) || [];

  // Build featured banner data
  const featuredBanner = useMemo(() => {
    const booksCategory = wonderCategories.find((c) => c.key === 'books');
    const firstBook = wonderResources.find((r) => r.category === 'books');
    const thumb = firstBook ? resourceThumbnails[firstBook.id] : undefined;
    return {
      title: 'Books to Level Up Your Mindset',
      thumbnail: thumb || '',
      category: 'books' as WonderCategory,
    };
  }, []);

  // Build category collections (circular thumbnail groups)
  const categoryCollections = useMemo(() => {
    const collections: GridItem[] = [];

    // Create 2-3 collection cards from different category groupings
    const group1Cats: WonderCategory[] = ['wellness', 'books', 'hygiene'];
    const group2Cats: WonderCategory[] = ['fitness', 'nutrition', 'mindset'];

    const makeCollection = (cats: WonderCategory[], id: string): GridItem => {
      const images: string[] = [];
      const labels: string[] = [];
      for (const cat of cats) {
        const catInfo = wonderCategories.find((c) => c.key === cat);
        const firstRes = wonderResources.find((r) => r.category === cat);
        const mealThumb = cat === 'nutrition' ? resourceThumbnails[mealRecipes[0]?.id] : undefined;
        const fitThumb = cat === 'fitness' ? fitnessThumbnails[fitnessWorkouts[0]?.id] : undefined;
        const thumb = firstRes ? resourceThumbnails[firstRes.id] : (mealThumb || fitThumb || '');
        images.push(thumb || '');
        labels.push(catInfo?.label.split(' ')[0] || cat);
      }
      return {
        id,
        type: 'collection',
        title: '',
        collection: { images, labels },
      };
    };

    collections.push(makeCollection(group1Cats, 'col-1'));
    collections.push(makeCollection(group2Cats, 'col-2'));
    return collections;
  }, []);

  // Build all grid items
  const allItems = useMemo(() => {
    const items: GridItem[] = [];

    // Add wonder resources
    for (const r of wonderResources) {
      items.push({
        id: r.id,
        type: 'resource',
        title: r.title,
        subtitle: typeLabels[r.type]?.label,
        thumbnail: resourceThumbnails[r.id],
        category: r.category,
        data: r,
        tall: Math.random() > 0.6, // Some cards taller for variety
      });
    }

    // Add meal recipes
    for (const m of mealRecipes) {
      items.push({
        id: m.id,
        type: 'meal',
        title: m.name,
        subtitle: `${m.calories} kcal · ${m.prepTime}`,
        thumbnail: resourceThumbnails[m.id],
        category: 'nutrition',
        data: m,
      });
    }

    // Add fitness workouts
    for (const w of fitnessWorkouts) {
      items.push({
        id: w.id,
        type: 'fitness',
        title: w.name,
        subtitle: `${w.duration} · ${w.calories} cal`,
        thumbnail: fitnessThumbnails[w.id],
        badge: 'Follow Along',
        category: 'fitness',
        data: w,
        tall: Math.random() > 0.5,
      });
    }

    return items;
  }, []);

  // Filter and sort items
  const gridItems = useMemo(() => {
    let items = [...allItems];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    // Category filter from featured banner
    if (featuredCategory) {
      items = items.filter((item) => item.category === featuredCategory);
    }

    // View mode sorting
    if (viewMode === 'for-you') {
      // Shuffle for personalized feel
      items.sort(() => 0.5 - Math.random());
    } else {
      // Popular: prioritize items with thumbnails, then saved items
      items.sort((a, b) => {
        const aSaved = savedIds.includes(a.id) ? 1 : 0;
        const bSaved = savedIds.includes(b.id) ? 1 : 0;
        const aThumb = a.thumbnail ? 1 : 0;
        const bThumb = b.thumbnail ? 1 : 0;
        return (bThumb + bSaved) - (aThumb + aSaved);
      });
    }

    // Limit to a reasonable amount
    items = items.slice(0, 30);

    // Intersperse collection cards
    if (!searchQuery && !featuredCategory) {
      const withCollections: GridItem[] = [];
      let colIdx = 0;
      for (let i = 0; i < items.length; i++) {
        withCollections.push(items[i]);
        if ((i + 1) % 8 === 0 && colIdx < categoryCollections.length) {
          withCollections.push(categoryCollections[colIdx]);
          colIdx++;
        }
      }
      return withCollections;
    }

    return items;
  }, [allItems, searchQuery, viewMode, featuredCategory, savedIds, categoryCollections]);

  const handleItemTap = useCallback((item: GridItem) => {
    if (item.type === 'resource') {
      setSelectedResource(item.data as WonderResource);
      setResourceSheetOpen(true);
    } else if (item.type === 'meal') {
      setSelectedRecipe(item.data as MealRecipe);
      setRecipeSheetOpen(true);
    } else if (item.type === 'fitness') {
      setSelectedWorkout(item.data as FitnessWorkout);
      setFitnessSheetOpen(true);
    }
  }, []);

  const handleFeaturedTap = () => {
    setFeaturedCategory(featuredCategory === 'books' ? null : 'books');
  };

  // Split items into 2 columns for masonry
  const col1: GridItem[] = [];
  const col2: GridItem[] = [];
  gridItems.forEach((item, i) => {
    if (i % 2 === 0) col1.push(item);
    else col2.push(item);
  });

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <div className="flex items-center justify-between mb-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-semibold tracking-tight text-gradient"
          >
            Wonder
          </motion.h1>
          <ProfileButton />
        </div>

        {/* Search bar with view mode pills */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 rounded-full bg-card/80 border border-border/40 px-4 py-2.5 backdrop-blur-sm"
        >
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFeaturedCategory(null);
            }}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => { setViewMode('for-you'); setFeaturedCategory(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === 'for-you'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              For you
            </button>
            <button
              onClick={() => { setViewMode('popular'); setFeaturedCategory(null); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                viewMode === 'popular'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Popular
            </button>
          </div>
        </motion.div>
      </div>

      <div className="px-4 space-y-4">
        {/* Practice Streak - compact */}
        <WonderStreak />

        {/* Featured Banner */}
        {!searchQuery && !featuredCategory && (
          <FeaturedBanner
            title={featuredBanner.title}
            thumbnail={featuredBanner.thumbnail}
            onTap={handleFeaturedTap}
          />
        )}

        {/* Category filter active indicator */}
        {featuredCategory && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <h2 className="font-display text-lg font-semibold text-foreground capitalize">
              {wonderCategories.find((c) => c.key === featuredCategory)?.label || featuredCategory}
            </h2>
            <button
              onClick={() => setFeaturedCategory(null)}
              className="text-xs text-primary font-medium"
            >
              Clear
            </button>
          </motion.div>
        )}

        {/* Masonry Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${featuredCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3"
          >
            {/* Column 1 */}
            <div className="flex-1 space-y-0">
              {col1.map((item) => (
                <PinterestCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  thumbnail={item.thumbnail}
                  subtitle={item.subtitle}
                  badge={item.badge}
                  tall={item.tall}
                  collection={item.collection}
                  onTap={() => handleItemTap(item)}
                />
              ))}
            </div>
            {/* Column 2 */}
            <div className="flex-1 space-y-0">
              {col2.map((item) => (
                <PinterestCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  thumbnail={item.thumbnail}
                  subtitle={item.subtitle}
                  badge={item.badge}
                  tall={item.tall}
                  collection={item.collection}
                  onTap={() => handleItemTap(item)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {gridItems.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <ResourceDetailSheet
        resource={selectedResource}
        open={resourceSheetOpen}
        onOpenChange={setResourceSheetOpen}
      />
      <RecipeDetailSheet
        recipe={selectedRecipe}
        open={recipeSheetOpen}
        onOpenChange={setRecipeSheetOpen}
      />
      <FitnessDetailSheet
        workout={selectedWorkout}
        open={fitnessSheetOpen}
        onOpenChange={setFitnessSheetOpen}
      />

      <BottomNav />
    </div>
  );
}
