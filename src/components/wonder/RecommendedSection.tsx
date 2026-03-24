import { useState, useEffect } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, categoryColors, categoryIcons, typeLabels, type WonderResource } from '@/lib/wonderResources';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import sparklesIcon from '@/assets/icons/sparkles.png';

interface Recommendation {
  id: string;
  reason?: string;
}

const VISIBLE_COUNT = 3;

export default function RecommendedSection({ onSelectResource }: { onSelectResource: (r: WonderResource) => void }) {
  const { profile } = useUserStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRecs = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('wonder-recommendations', {
          body: {
            struggles: profile.struggles,
            dreamSelfFeels: profile.dreamSelfFeels,
            wantsMoreOf: profile.wantsMoreOf,
            identityStatement: profile.identityStatement,
            recentMoods: profile.moodHistory.slice(0, 5).map((m) => m.moods).flat(),
            recentJournals: profile.journalEntries.slice(0, 3).map((j) => j.content.slice(0, 100)),
            habitCategories: profile.coreHabits.map((h) => h.title),
            resourceIds: wonderResources.map((r) => ({ id: r.id, title: r.title, tags: r.tags })),
          },
        });

        if (fnError) throw fnError;
        if (!cancelled && data?.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (e) {
        console.error('Failed to fetch recommendations:', e);
        if (!cancelled) {
          const shuffled = [...wonderResources].sort(() => 0.5 - Math.random());
          setRecommendations(shuffled.slice(0, 6).map((r) => ({ id: r.id })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRecs();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const recommendedResources = recommendations
    .map((rec) => ({
      resource: wonderResources.find((r) => r.id === rec.id),
      reason: rec.reason,
    }))
    .filter((r) => r.resource) as { resource: WonderResource; reason?: string }[];

  const visibleRecs = showAll ? recommendedResources : recommendedResources.slice(0, VISIBLE_COUNT);
  const hasMore = recommendedResources.length > VISIBLE_COUNT;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <img src={sparklesIcon} alt="" className="w-5 h-5 object-contain clay-icon" />
        <h2 className="font-display text-xl font-medium text-foreground">For You</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground ml-2">Finding what resonates…</span>
        </div>
      ) : visibleRecs.length > 0 ? (
        <>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
            {visibleRecs.map(({ resource, reason }, i) => {
              const color = categoryColors[resource.category];
              const typeInfo = typeLabels[resource.type];
              const catIcon = categoryIcons[resource.category];
              return (
                <motion.button
                  key={resource.id}
                  onClick={() => onSelectResource(resource)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="snap-start shrink-0 w-[280px] text-left glass-card rounded-2xl overflow-hidden shadow-soft relative group"
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Category accent strip */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />

                  {/* Watermark icon */}
                  <img
                    src={catIcon}
                    alt=""
                    className="absolute right-3 top-3 w-10 h-10 object-contain opacity-[0.08] pointer-events-none select-none"
                  />

                  <div className="p-4 pl-5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <img src={typeInfo.icon} alt="" className="w-3.5 h-3.5 object-contain clay-icon" />
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `hsl(${color} / 0.15)`,
                          color: `hsl(${color})`,
                        }}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-medium text-foreground leading-snug mt-1.5">
                      {resource.title}
                    </h3>
                    {reason && (
                      <p className="text-xs italic text-primary/80 leading-relaxed">
                        "{reason}"
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-primary font-medium flex items-center gap-0.5 mx-auto hover:underline"
            >
              See more <ChevronRight size={12} />
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Explore below to discover resources for you.
        </p>
      )}
    </div>
  );
}
