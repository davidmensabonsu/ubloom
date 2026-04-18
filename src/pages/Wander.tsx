import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { track } from '@/hooks/useAnalytics';
import { motion } from 'framer-motion';
import { Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import ProfileButton from '@/components/ProfileButton';
import ResourceDetailSheet from '@/components/wonder/ResourceDetailSheet';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, mealRecipes, fitnessWorkouts } from '@/lib/wonderResources';
import type { WonderResource } from '@/lib/wonderResources';
import { getCurrentCycleDay, getCurrentPhase, type CyclePhase } from '@/lib/cycleUtils';

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

// Category cards include 'books' via the dedicated banner — for ordering we treat banner separately.
// Order arrays use the same keys as categoryCards.
const phaseOrder: Record<CyclePhase | 'default', string[]> = {
  Menstrual: ['calm', 'wellness', 'nutrition', 'vitamins', 'hygiene', 'podcasts', 'mindset', 'lifestyle', 'fitness'],
  Follicular: ['fitness', 'mindset', 'lifestyle', 'podcasts', 'wellness', 'nutrition', 'hygiene', 'vitamins', 'calm'],
  Ovulatory: ['fitness', 'hygiene', 'lifestyle', 'podcasts', 'mindset', 'nutrition', 'wellness', 'vitamins', 'calm'],
  Luteal: ['calm', 'nutrition', 'wellness', 'hygiene', 'vitamins', 'podcasts', 'mindset', 'lifestyle', 'fitness'],
  default: ['mindset', 'wellness', 'fitness', 'nutrition', 'calm', 'podcasts', 'hygiene', 'lifestyle', 'vitamins'],
};

interface CuratedCard {
  category: string; // display label uppercase
  categoryKey: string; // navigation key (fallback)
  title: string;
  resourceId: string; // wonderResources.id to open in detail sheet
}

const curatedByPhase: Record<CyclePhase | 'default', CuratedCard[]> = {
  Menstrual: [
    { category: 'CALM', categoryKey: 'calm', title: 'A gentle yoga flow for your first days', resourceId: 'calm-6' },
    { category: 'WELLNESS', categoryKey: 'wellness', title: "Nourishing rituals for your cycle's reset", resourceId: 'well-1' },
    { category: 'FOOD & RECIPES', categoryKey: 'nutrition', title: 'Iron-rich meals to replenish and restore', resourceId: 'nutr-2' },
  ],
  Follicular: [
    { category: 'FITNESS', categoryKey: 'fitness', title: 'High energy workouts for your rising phase', resourceId: 'fit-6' },
    { category: 'MINDSET', categoryKey: 'mindset', title: 'Bold thinking exercises for your peak clarity', resourceId: 'mind-1' },
    { category: 'LIFESTYLE', categoryKey: 'lifestyle', title: 'New habits to start when your energy is building', resourceId: 'life-1' },
  ],
  Ovulatory: [
    { category: 'FITNESS', categoryKey: 'fitness', title: 'Strength training at your peak performance window', resourceId: 'fit-3' },
    { category: 'SKINCARE', categoryKey: 'hygiene', title: 'Glow-up rituals for your most radiant days', resourceId: 'hyg-1' },
    { category: 'PODCASTS', categoryKey: 'podcasts', title: 'Conversations to fuel your most social phase', resourceId: 'pod-1' },
  ],
  Luteal: [
    { category: 'CALM', categoryKey: 'calm', title: 'Slow practices for your inward turn', resourceId: 'calm-2' },
    { category: 'FOOD & RECIPES', categoryKey: 'nutrition', title: 'Comfort meals that support your luteal phase', resourceId: 'nutr-1' },
    { category: 'WELLNESS', categoryKey: 'wellness', title: 'Self-care rituals for when things feel heavier', resourceId: 'well-2' },
  ],
  default: [
    { category: 'MINDSET', categoryKey: 'mindset', title: 'Start here: building your foundation', resourceId: 'mind-1' },
    { category: 'WELLNESS', categoryKey: 'wellness', title: 'Daily rituals to ground your routine', resourceId: 'well-1' },
    { category: 'CALM', categoryKey: 'calm', title: 'Finding stillness in a busy week', resourceId: 'calm-1' },
  ],
};

export default function Wonder2() {
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const savedIds = useUserStore((s) => s.profile.savedResources) || [];
  const recentlyViewedIds = useUserStore((s) => s.profile.recentlyViewedResources) || [];
  const cycleData = useUserStore((s) => s.profile.cycleData);
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

  // Determine current phase
  const currentPhase: CyclePhase | 'default' = useMemo(() => {
    if (!cycleData?.setupComplete || !cycleData.lastPeriodStart) return 'default';
    const day = getCurrentCycleDay(cycleData.lastPeriodStart, cycleData.cycleLength);
    return getCurrentPhase(day, cycleData.periodLength, cycleData.cycleLength);
  }, [cycleData]);

  const curatedCards = curatedByPhase[currentPhase];
  const phaseLabel = currentPhase === 'default' ? '' : currentPhase.toLowerCase();

  // Resolve recently viewed resource objects (max 3 shown)
  const recentResources = recentlyViewedIds
    .map((id) => wonderResources.find((r) => r.id === id))
    .filter(Boolean)
    .slice(0, 3) as WonderResource[];

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

  // Sort category cards by current phase order
  const orderedCategoryCards = useMemo(() => {
    const order = phaseOrder[currentPhase];
    const indexOf = (key: string) => {
      const i = order.indexOf(key);
      return i === -1 ? 999 : i;
    };
    return [...categoryCards].sort((a, b) => indexOf(a.key) - indexOf(b.key));
  }, [currentPhase]);

  const query = search.toLowerCase().trim();
  const filteredCards = query
    ? orderedCategoryCards.filter(c => c.label.toLowerCase().includes(query) || c.subtitle.toLowerCase().includes(query))
    : orderedCategoryCards;

  const SectionLabel = ({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) => (
    <h3 className={`text-xs font-semibold uppercase tracking-wider ${muted ? 'text-muted-foreground' : 'text-primary'}`}>
      ◆ {children}
    </h3>
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {/* Hero gradient header */}
      <div className="hero-gradient px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-3">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-title text-white">
            Wander
          </motion.h1>
          <ProfileButton />
        </div>
        <p className="text-sm text-white/85 mb-4">Discover what nourishes you</p>
        <div className="flex items-center gap-3 rounded-full bg-white/95 backdrop-blur-sm px-4 py-3 shadow-sm">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); trackSearch(e.target.value); }}
            placeholder="Search ideas, topics, content..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="px-4 space-y-6 pt-5">
        {/* CURATED FOR YOU */}
        {!query && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <SectionLabel>Curated for you</SectionLabel>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {curatedCards.map((card, i) => (
                <motion.button
                  key={`${card.categoryKey}-${i}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  onClick={() => {
                    const resource = wonderResources.find((r) => r.id === card.resourceId);
                    track('wander_curated_tap', { category: card.categoryKey, phase: currentPhase, resourceId: card.resourceId, opened: !!resource });
                    if (resource) {
                      setSelectedResource(resource);
                      setSheetOpen(true);
                    } else {
                      navigate(`/wander/${card.categoryKey}`);
                    }
                  }}
                  className="shrink-0 w-[70vw] max-w-[320px] rounded-2xl bg-white border border-primary/20 shadow-sm p-4 text-left flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{card.category}</p>
                    <p className="font-display text-lg leading-snug text-foreground">{card.title}</p>
                  </div>
                  <div className="flex items-end justify-between gap-2 mt-3">
                    {phaseLabel ? (
                      <p className="text-[10px] text-primary/60">Picked for your {phaseLabel} phase</p>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          track('wander_curated_setup_cycle_tap');
                          navigate('/health');
                        }}
                        className="text-[10px] text-primary/70 hover:text-primary underline underline-offset-2 decoration-primary/30 text-left"
                      >
                        Set up your cycle for personalised picks
                      </button>
                    )}
                    <Heart size={15} className="text-primary/50 shrink-0" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* RECENTLY VIEWED */}
        {recentResources.length > 0 && !query && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <SectionLabel muted>Recently viewed</SectionLabel>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentResources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedResource(r); setSheetOpen(true); }}
                  className="shrink-0 w-[45vw] max-w-[200px] rounded-xl bg-white shadow-sm border border-border/30 p-3 text-left space-y-1.5 hover:shadow-md transition-shadow"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate">{r.category}</p>
                  <p className="text-sm text-foreground leading-tight line-clamp-2">{r.title}</p>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* THIS WEEK'S PICK — featured banner (existing) */}
        {!query && (
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
        )}

        {/* EXPLORE */}
        <section className="space-y-3">
          {!query && <SectionLabel muted>Explore</SectionLabel>}
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
        </section>
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
