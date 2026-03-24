import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import ResourceCard from './ResourceCard';
import { supabase } from '@/integrations/supabase/client';

interface Recommendation {
  id: string;
  reason?: string;
}

export default function RecommendedSection({ onSelectResource }: { onSelectResource: (r: WonderResource) => void }) {
  const { profile } = useUserStore();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        if (!cancelled) setError(true);
        // Fallback: show random selection
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        <h2 className="section-title text-lg">Recommended for You</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground ml-2">Finding what resonates with you...</span>
        </div>
      ) : recommendedResources.length > 0 ? (
        <div className="space-y-2">
          {recommendedResources.map(({ resource, reason }) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onTap={() => onSelectResource(resource)}
              context={reason}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          Explore the library below to discover resources for you.
        </p>
      )}
    </div>
  );
}
