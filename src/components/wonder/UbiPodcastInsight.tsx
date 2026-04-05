import { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import type { WonderResource } from '@/lib/wonderResources';

const CACHE_KEY = 'ubi-podcast-recs';
const LISTENED_KEY = 'ubi-podcast-listened';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  recommendation: string;
  timestamp: number;
}

function getCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function getCached(cacheKey: string): string | null {
  const cache = getCache();
  const entry = cache[cacheKey];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.recommendation;
  }
  return null;
}

function setCache(cacheKey: string, recommendation: string) {
  const cache = getCache();
  cache[cacheKey] = { recommendation, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function getListened(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(LISTENED_KEY) || '{}');
  } catch {
    return {};
  }
}

function getListenedForPodcast(resourceId: string): string[] {
  return getListened()[resourceId] || [];
}

function addListened(resourceId: string, recommendation: string) {
  const all = getListened();
  const list = all[resourceId] || [];
  if (!list.includes(recommendation)) {
    list.push(recommendation);
  }
  all[resourceId] = list;
  localStorage.setItem(LISTENED_KEY, JSON.stringify(all));
}

interface UbiPodcastInsightProps {
  resource: WonderResource;
}

export default function UbiPodcastInsight({ resource }: UbiPodcastInsightProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { profile } = useUserStore();

  // Cache key includes listened count so a new rec after "listened" gets its own cache slot
  const listened = getListenedForPodcast(resource.id);
  const cacheSlot = `${resource.id}::${listened.length}`;

  const fetchRecommendation = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = getCached(cacheSlot);
      if (cached) {
        setRecommendation(cached);
        return;
      }
    }

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
          listenedEpisodes: listened,
        },
      });

      if (fnError) throw fnError;
      if (data?.recommendation) {
        setRecommendation(data.recommendation);
        setCache(cacheSlot, data.recommendation);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('Podcast recommendation error:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [resource.id, cacheSlot, listened, profile]);

  useEffect(() => {
    fetchRecommendation();
  }, [resource.id]);

  const handleListened = () => {
    if (!recommendation) return;
    addListened(resource.id, recommendation);
    // Fetch a new recommendation (skip cache since listened count changed)
    fetchRecommendation(true);
  };

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
            onClick={() => fetchRecommendation(true)}
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
        <>
          <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
          {recommendation && (
            <button
              onClick={handleListened}
              disabled={loading}
              className="flex items-center gap-2 mt-1 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Circle size={14} />
              <span>Listened — show me another</span>
            </button>
          )}
        </>
      )}

      {listened.length > 0 && (
        <div className="flex items-center gap-1.5 pt-1">
          <CheckCircle2 size={12} className="text-primary/50" />
          <span className="text-[10px] text-muted-foreground">
            {listened.length} episode{listened.length !== 1 ? 's' : ''} listened
          </span>
        </div>
      )}
    </div>
  );
}
