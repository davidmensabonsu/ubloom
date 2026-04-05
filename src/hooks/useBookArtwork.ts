import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CACHE_KEY = 'book-artwork-cache';
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

export function useBookArtwork(bookTitles: string[]) {
  const [artworks, setArtworks] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookTitles.length === 0) {
      setLoading(false);
      return;
    }

    const cached = getCache();
    const missingTitles = bookTitles.filter(
      (t) => !cached?.artworks || !(t in cached.artworks)
    );

    if (cached?.artworks && missingTitles.length === 0) {
      setArtworks(cached.artworks);
      setLoading(false);
      return;
    }

    if (cached?.artworks) {
      setArtworks(cached.artworks);
    }

    const titlesToFetch = missingTitles.length > 0 ? missingTitles : bookTitles;

    supabase.functions
      .invoke('book-artwork', {
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
  }, [bookTitles.join(',')]);

  return { artworks, loading };
}
