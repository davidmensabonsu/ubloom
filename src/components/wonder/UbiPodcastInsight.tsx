import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import type { WonderResource } from '@/lib/wonderResources';

interface UbiPodcastInsightProps {
  resource: WonderResource;
}

export default function UbiPodcastInsight({ resource }: UbiPodcastInsightProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { profile } = useUserStore();

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(false);
    setRecommendation(null);

    try {
      const userContext = {
        currentFeeling: profile.currentFeeling,
        struggles: profile.struggles,
        wantsMoreOf: profile.wantsMoreOf,
        dreamSelfFeels: profile.dreamSelfFeels,
        identityStatement: profile.identityStatement,
        recentMood: profile.moodHistory?.slice(-3).map((m) => m.moods),
        dailyState: profile.dailyCheckinState,
      };

      const { data, error: fnError } = await supabase.functions.invoke('podcast-recommendation', {
        body: {
          podcastTitle: resource.title,
          podcastDescription: resource.description,
          podcastTags: resource.tags,
          userContext,
        },
      });

      if (fnError) throw fnError;
      if (data?.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('Podcast recommendation error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [resource.id]);

  if (error && !recommendation) return null;

  return (
    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ubi's pick for you
          </h4>
        </div>
        {recommendation && (
          <button
            onClick={fetchRecommendation}
            disabled={loading}
            className="p-1 rounded-full hover:bg-primary/10 transition-colors"
          >
            <RefreshCw size={12} className={`text-primary/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-primary/10 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-primary/10 rounded-full w-4/5 animate-pulse" />
          <div className="h-3 bg-primary/10 rounded-full w-3/5 animate-pulse" />
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
      )}
    </div>
  );
}
