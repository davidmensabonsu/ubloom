import { useState, useEffect, useRef, useCallback } from 'react';
import { track } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { Search, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ProfileButton from '@/components/ProfileButton';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, mealRecipes, fitnessWorkouts, typeLabels } from '@/lib/wonderResources';
import type { WonderResource } from '@/lib/wonderResources';

import booksBanner from '@/assets/wonder/book-imperfection.jpg';
import fitnessImg from '@/assets/wonder/fitness.jpg';
import skincareImg from '@/assets/wonder/skincare.jpg';
import podcastImg from '@/assets/wonder/podcast.jpg';
import mindsetImg from '@/assets/wonder/mindset.jpg';
import wellnessImg from '@/assets/wonder/wellness.jpg';
import nutritionImg from '@/assets/wonder/nutrition.jpg';
import calmImg from '@/assets/wonder/calm.jpg';
import vitaminsImg from '@/assets/wonder/vitamins.jpg';
import lifestyleImg from '@/assets/wonder/lifestyle.jpg';

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
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const savedIds = useUserStore((s) => s.profile.savedResources) || [];
  const recentlyViewedIds = useUserStore((s) => s.profile.recentlyViewedResources) || [];
  const { saveResource, unsaveResource } = useUserStore();

  useEffect(() => { track('feature_used', { feature: 'wander' }); }, []);

  // Debounced search tracking
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trackSearch = useCallback((q: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (q.trim()) track('wander_search', { query: q.trim() });
    }, 800);
  }, []);

  // Resolve recently viewed resource objects (max 6 shown)
  const recentResources = recentlyViewedIds
    .map((id) => wonderResources.find((r) => r.id === id))
    .filter(Boolean)
    .slice(0, 6) as WonderResource[];

  const savedSet = new Set(savedIds);

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const action = savedSet.has(id) ? 'unsave' : 'save';
    savedSet.has(id) ? unsaveResource(id) : saveResource(id);
    track('wander_save_toggle', { resourceId: id, action });
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

  const query = search.toLowerCase().trim();
  const filteredCards = query
    ? categoryCards.filter(c => c.label.toLowerCase().includes(query) || c.subtitle.toLowerCase().includes(query))
    : categoryCards;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Search bar */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 rounded-full border border-border/40 bg-card/60 backdrop-blur-sm px-4 py-3">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); trackSearch(e.target.value); }}
              placeholder="Search ideas..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={() => { setTab('for-you'); track('wander_tab_switch', { tab: 'for-you' }); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  tab === 'for-you'
                    ? 'bg-primary/15 text-foreground ring-1 ring-primary/40'
                    : 'text-muted-foreground'
                }`}
              >
                For you
              </button>
              <button
                onClick={() => { setTab('popular'); track('wander_tab_switch', { tab: 'popular' }); }}
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
        {/* Recently Viewed */}
        {recentResources.length > 0 && !query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recently Viewed</h3>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {recentResources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedResource(r); setSheetOpen(true); }}
                  className="shrink-0 w-36 rounded-xl bg-card border border-border/30 p-3 text-left space-y-1 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <img src={typeLabels[r.type].icon} alt="" className="w-4 h-4 object-contain clay-icon" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">{typeLabels[r.type].label}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{r.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Books banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden bg-card border border-border/30 cursor-pointer"
          onClick={() => navigate('/wander/books')}
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
          {filteredCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="break-inside-avoid rounded-2xl overflow-hidden bg-card border border-border/30 relative cursor-pointer"
              onClick={() => { track('wander_category_tap', { category: card.key }); navigate(`/wander/${card.key}`); }}
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

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      <BottomNav />
    </div>
  );
}
