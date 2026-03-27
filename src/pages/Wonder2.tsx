import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ProfileButton from '@/components/ProfileButton';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, mealRecipes, fitnessWorkouts } from '@/lib/wonderResources';

import booksBanner from '@/assets/wonder2/books-banner.jpg';
import fitnessImg from '@/assets/wonder2/fitness.jpg';
import skincareImg from '@/assets/wonder2/skincare.jpg';
import podcastImg from '@/assets/wonder2/podcast.jpg';
import mindsetImg from '@/assets/wonder2/mindset.jpg';
import wellnessImg from '@/assets/wonder2/wellness.jpg';
import nutritionImg from '@/assets/wonder2/nutrition.jpg';
import calmImg from '@/assets/wonder2/calm.jpg';
import vitaminsImg from '@/assets/wonder2/vitamins.jpg';
import lifestyleImg from '@/assets/wonder2/lifestyle.jpg';

interface CategoryCard {
  key: string;
  label: string;
  subtitle: string;
  image: string;
  tall?: boolean;
}

const categoryCards: CategoryCard[] = [
  { key: 'fitness', label: 'Fitness', subtitle: 'Move your body', image: fitnessImg, tall: true },
  { key: 'wellness', label: 'Wellness', subtitle: 'Feel your best', image: wellnessImg },
  { key: 'calm', label: 'Calm', subtitle: 'Find your peace', image: calmImg },
  { key: 'mindset', label: 'Mindset', subtitle: 'Level up your mind', image: mindsetImg, tall: true },
  { key: 'nutrition', label: 'Food & Recipes', subtitle: 'Nourish yourself', image: nutritionImg, tall: true },
  { key: 'podcasts', label: 'Podcasts', subtitle: 'Listen & learn', image: podcastImg },
  { key: 'vitamins', label: 'Vitamins', subtitle: 'Boost from within', image: vitaminsImg },
  { key: 'hygiene', label: 'Skincare & Hygiene', subtitle: 'Glow up tips', image: skincareImg, tall: true },
  { key: 'lifestyle', label: 'Lifestyle', subtitle: 'Design your life', image: lifestyleImg },
];

type Tab = 'for-you' | 'popular';

export default function Wonder2() {
  const [tab, setTab] = useState<Tab>('for-you');
  const navigate = useNavigate();
  const savedIds = useUserStore((s) => s.profile.savedResources) || [];
  const { saveResource, unsaveResource } = useUserStore();

  const savedSet = new Set(savedIds);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedSet.has(id) ? unsaveResource(id) : saveResource(id);
  };

  // Count saved per category
  const savedCounts: Record<string, number> = {};
  for (const r of wonderResources) {
    if (savedSet.has(r.id)) savedCounts[r.category] = (savedCounts[r.category] || 0) + 1;
  }
  for (const r of mealRecipes) {
    if (savedSet.has(r.id)) savedCounts['nutrition'] = (savedCounts['nutrition'] || 0) + 1;
  }
  for (const r of fitnessWorkouts) {
    if (savedSet.has(r.id)) savedCounts['fitness'] = (savedCounts['fitness'] || 0) + 1;
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Search bar */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 rounded-full border border-border/40 bg-card/60 backdrop-blur-sm px-4 py-3">
            <Search size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search ideas...</span>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => setTab('for-you')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === 'for-you'
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'text-muted-foreground'
                }`}
              >
                For you
              </button>
              <button
                onClick={() => setTab('popular')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === 'popular'
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'text-muted-foreground'
                }`}
              >
                Popular
              </button>
            </div>
          </div>
          <ProfileButton />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Books banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-card border border-border/30 cursor-pointer"
          onClick={() => navigate('/wonder2/books')}
        >
          <div className="flex items-center">
            <div className="flex-1 p-5 space-y-3">
              <h2 className="font-display text-xl font-bold text-foreground leading-tight">
                Books to Level Up Your Mindset
              </h2>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/50 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                See all →
              </button>
            </div>
            <div className="w-40 h-32 shrink-0">
              <img src={booksBanner} alt="Books" className="w-full h-full object-cover rounded-r-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Masonry grid */}
        <div className="columns-2 gap-3 space-y-3">
          {categoryCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="break-inside-avoid rounded-2xl overflow-hidden bg-card border border-border/30 relative cursor-pointer"
              onClick={() => navigate(`/wonder2/${card.key}`)}
            >
              <img
                src={card.image}
                alt={card.label}
                className={`w-full object-cover ${card.tall ? 'aspect-[3/4]' : 'aspect-square'}`}
                loading="lazy"
              />
              <div className="p-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">{card.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{card.subtitle}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(savedCounts[card.key] || 0) > 0 && (
                    <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                      {savedCounts[card.key]}
                    </span>
                  )}
                  <Heart size={16} className="text-primary/40" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
