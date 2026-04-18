import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Cache signed URLs for the page lifetime to avoid re-signing on every render.
const cache = new Map<string, { url: string; expiresAt: number }>();

export function useSignedAudioUrl(path?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!path) { setUrl(null); return; }
    const cached = cache.get(path);
    const now = Date.now();
    if (cached && cached.expiresAt > now + 30_000) {
      setUrl(cached.url);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase.storage
        .from('voice-journals')
        .createSignedUrl(path, 60 * 60); // 1 hour
      if (cancelled) return;
      if (!error && data?.signedUrl) {
        cache.set(path, { url: data.signedUrl, expiresAt: now + 60 * 60 * 1000 });
        setUrl(data.signedUrl);
      } else {
        setUrl(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [path]);

  return { url, loading };
}
