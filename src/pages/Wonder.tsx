import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import RecommendedSection from '@/components/wonder/RecommendedSection';
import FitnessSection from '@/components/wonder/FitnessSection';
import ResourceCard from '@/components/wonder/ResourceCard';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import PodcastsSection from '@/components/wonder/PodcastsSection';
import HygieneSection from '@/components/wonder/HygieneSection';
import BooksSection from '@/components/wonder/BooksSection';
import WonderStreak from '@/components/wonder/WonderStreak';
import RecentlyPracticed from '@/components/wonder/RecentlyPracticed';
import SavedResources from '@/components/wonder/SavedResources';
import FoodRecipesSection from '@/components/wonder/FoodRecipesSection';
import { wonderResources, wonderCategories, type WonderResource, type WonderCategory } from '@/lib/wonderResources';

const INITIAL_SHOW = 8;

export default function Wonder() {
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<WonderCategory | 'all' | 'for-you'>('for-you');
  const [showAll, setShowAll] = useState(false);

  const handleSelectResource = (resource: WonderResource) => {
    setSelectedResource(resource);
    setSheetOpen(true);
  };

  const filteredResources = activeCategory === 'all' || activeCategory === 'for-you'
    ? wonderResources
    : wonderResources.filter((r) => r.category === activeCategory);

  const visibleResources = showAll ? filteredResources : filteredResources.slice(0, INITIAL_SHOW);
  const hasMore = filteredResources.length > INITIAL_SHOW;

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-semibold tracking-tight text-gradient"
          >
            Wonder
          </motion.h1>
          <ProfileButton />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-base text-muted-foreground mt-0.5"
        >
          Everything you need to become her
        </motion.p>
      </div>

      <div className="px-5 space-y-6">
        {/* Practice Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <WonderStreak />
        </motion.div>

        {/* Recently Practiced */}
        <RecentlyPracticed onSelectResource={handleSelectResource} />

        {/* Saved for Later */}
        <SavedResources onSelectResource={handleSelectResource} />

        {/* Explore Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-3"
        >
          <h2 className="font-display text-xl font-semibold text-foreground">Explore</h2>

          {/* Category Pills — "For You" is the first tab */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => { setActiveCategory('for-you'); setShowAll(false); }}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'for-you'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              ✨ For You
            </button>
            <button
              onClick={() => { setActiveCategory('all'); setShowAll(false); }}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            {wonderCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveCategory(cat.key); setShowAll(false); }}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeCategory === cat.key
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <img src={cat.icon} alt="" className="w-5 h-5 object-contain clay-icon" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Content — either For You recommendations, Food & Recipes, or category grid */}
          {activeCategory === 'for-you' ? (
            <RecommendedSection onSelectResource={handleSelectResource} />
          ) : activeCategory === 'nutrition' ? (
            <FoodRecipesSection />
          ) : activeCategory === 'fitness' ? (
            <FitnessSection />
          ) : activeCategory === 'podcasts' ? (
            <PodcastsSection />
          ) : activeCategory === 'books' ? (
            <BooksSection />
          ) : activeCategory === 'hygiene' ? (
            <HygieneSection />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {visibleResources.map((resource, i) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  >
                    <ResourceCard
                      resource={resource}
                      onTap={() => handleSelectResource(resource)}
                      compact
                    />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1 mx-auto text-xs text-primary font-medium hover:underline py-2"
                >
                  {showAll ? (
                    <>Show less <ChevronUp size={14} /></>
                  ) : (
                    <>Show all ({filteredResources.length}) <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </>
          )}
        </motion.div>
      </div>

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <BottomNav />
    </div>
  );
}
