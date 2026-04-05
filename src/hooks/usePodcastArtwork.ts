import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'podcast-artwork-cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  artworks: Record<string, string | null>;
  timestamp: number;
}

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setCache(artworks: Record<string, string | null>) {
  try {
    const entry: CacheEntry = { artworks, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Storage full, ignore
  }
}

export function usePodcastArtwork(podcastTitles: string[]) {
  const [artworks, setArtworks] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (podcastTitles.length === 0) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = getCache();
    const missingTitles = podcastTitles.filter(
      (t) => !cached?.artworks || !(t in cached.artworks)
    );

    if (cached?.artworks && missingTitles.length === 0) {
      setArtworks(cached.artworks);
      setLoading(false);
      return;
    }

    // If we have some cached, set them immediately
    if (cached?.artworks) {
      setArtworks(cached.artworks);
    }

    const titlesToFetch = missingTitles.length > 0 ? missingTitles : podcastTitles;

    supabase.functions
      .invoke('podcast-artwork', {
        body: { searchTerms: titlesToFetch },
      })
      .then(({ data, error }) => {
        if (error || !data?.artworks) {
          setLoading(false);
          return;
        }

        const merged = { ...(cached?.artworks || {}), ...data.artworks };
        setArtworks(merged);
        setCache(merged);
        setLoading(false);
      });
  }, [podcastTitles.join(',')]);

  return { artworks, loading };
}
