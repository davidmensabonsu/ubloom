import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, categoryColors, typeLabels, type WonderResource } from '@/lib/wonderResources';
import { resourceThumbnails } from '@/lib/resourceMedia';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  reason?: string;
}

const VISIBLE_COUNT = 6;

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
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground ml-2">Finding what resonates…</span>
        </div>
      ) : visibleRecs.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            {visibleRecs.map(({ resource, reason }, i) => {
              const color = categoryColors[resource.category];
              const typeInfo = typeLabels[resource.type];
              const thumbnail = resourceThumbnails[resource.id];
              return (
                <motion.button
                  key={resource.id}
                  onClick={() => onSelectResource(resource)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
                  whileTap={{ scale: 0.97 }}
                >
                  {thumbnail && (
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-3 space-y-1.5">
                    <span
                      className="text-[10px] font-medium inline-block px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `hsl(${color} / 0.12)`,
                        color: `hsl(${color})`,
                      }}
                    >
                      {typeInfo.label}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {resource.title}
                    </h3>
                    {reason && (
                      <p className="text-xs italic text-primary/80 leading-relaxed line-clamp-2">
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
