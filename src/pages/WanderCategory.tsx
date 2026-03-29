import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import FitnessSection from '@/components/wonder/FitnessSection';
import BooksSection from '@/components/wonder/BooksSection';
import PodcastsSection from '@/components/wonder/PodcastsSection';
import HygieneSection from '@/components/wonder/HygieneSection';
import FoodRecipesSection from '@/components/wonder/FoodRecipesSection';
import CategoryGridSection from '@/components/wonder/CategoryGridSection';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import type { WonderResource, WonderCategory } from '@/lib/wonderResources';

const categoryMeta: Record<string, { title: string; subtitle: string }> = {
  fitness: { title: 'Fitness', subtitle: 'Move your body, feel alive' },
  books: { title: 'Books', subtitle: 'Level up your mindset' },
  podcasts: { title: 'Podcasts', subtitle: 'Listen & learn' },
  hygiene: { title: 'Skincare & Hygiene', subtitle: 'Glow up tips' },
  nutrition: { title: 'Food & Recipes', subtitle: 'Nourish yourself' },
  mindset: { title: 'Mindset', subtitle: 'Train your mind' },
  wellness: { title: 'Wellness', subtitle: 'Feel your best' },
  calm: { title: 'Calm', subtitle: 'Find your peace' },
  vitamins: { title: 'Vitamins', subtitle: 'Boost from within' },
  lifestyle: { title: 'Lifestyle', subtitle: 'Design your life' },
};

export default function Wonder2Category() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const meta = categoryMeta[category || ''] || { title: 'Resources', subtitle: '' };

  const handleSelectResource = (resource: WonderResource) => {
    setSelectedResource(resource);
    setSheetOpen(true);
  };

  const renderContent = () => {
    switch (category) {
      case 'fitness':
        return <FitnessSection />;
      case 'books':
        return <BooksSection />;
      case 'podcasts':
        return <PodcastsSection />;
      case 'hygiene':
        return <HygieneSection />;
      case 'nutrition':
        return <FoodRecipesSection />;
      default:
        return (
          <CategoryGridSection
            category={category as WonderCategory}
            onSelectResource={handleSelectResource}
          />
        );
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => navigate('/wander')}
            className="w-10 h-10 rounded-full bg-card border border-border/30 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{meta.title}</h1>
            <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
        </motion.div>
      </div>

      <div className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {renderContent()}
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
