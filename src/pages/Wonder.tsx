import { useState } from 'react';
import { motion } from 'framer-motion';
import ProfileButton from '@/components/ProfileButton';
import BottomNav from '@/components/BottomNav';
import RecommendedSection from '@/components/wonder/RecommendedSection';
import FitnessSection from '@/components/wonder/FitnessSection';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import PodcastsSection from '@/components/wonder/PodcastsSection';
import HygieneSection from '@/components/wonder/HygieneSection';
import BooksSection from '@/components/wonder/BooksSection';
import WonderStreak from '@/components/wonder/WonderStreak';
import RecentlyPracticed from '@/components/wonder/RecentlyPracticed';
import FoodRecipesSection from '@/components/wonder/FoodRecipesSection';
import CategoryGridSection from '@/components/wonder/CategoryGridSection';
import { wonderResources, wonderCategories, type WonderResource, type WonderCategory } from '@/lib/wonderResources';

export default function Wonder() {
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<WonderCategory | 'all' | 'for-you'>('for-you');

  const handleSelectResource = (resource: WonderResource) => {
    setSelectedResource(resource);
    setSheetOpen(true);
  };

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

        {/* Explore Library */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="space-y-3"
        >
          <h2 className="font-display text-xl font-semibold text-foreground">Explore</h2>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('for-you')}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'for-you'
                  ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              ✨ For You
            </button>
            <button
              onClick={() => setActiveCategory('all')}
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
                onClick={() => setActiveCategory(cat.key)}
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

          {/* Content */}
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
            <CategoryGridSection
              category={activeCategory}
              onSelectResource={handleSelectResource}
            />
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
