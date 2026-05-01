import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JournalVideoPlayerProps {
  path: string;
  durationSec?: number;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const cache = new Map<string, { url: string; expiresAt: number }>();

export default function JournalVideoPlayer({ path, durationSec }: JournalVideoPlayerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
        .from('video-journals')
        .createSignedUrl(path, 60 * 60);
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

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 size={12} className="animate-spin" /> Loading video…
      </div>
    );
  }

  if (!url) return null;

  return (
    <div className="mt-2 relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={url}
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
      >
        {!playing && (
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground">
            <Play size={18} className="ml-0.5" />
          </div>
        )}
      </button>
      {durationSec != null && (
        <span className="absolute bottom-2 right-2 text-[10px] tabular-nums text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
          {formatDuration(durationSec)}
        </span>
      )}
    </div>
  );
}