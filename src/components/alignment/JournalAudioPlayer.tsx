import { useRef, useState } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useSignedAudioUrl } from '@/hooks/useSignedAudioUrl';

interface JournalAudioPlayerProps {
  path: string;
  durationSec?: number;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function JournalAudioPlayer({ path, durationSec }: JournalAudioPlayerProps) {
  const { url, loading } = useSignedAudioUrl(path);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl bg-muted/60 px-2.5 py-1.5 w-fit">
      <button
        onClick={toggle}
        disabled={!url || loading}
        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        aria-label={playing ? 'Pause voice journal' : 'Play voice journal'}
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : playing ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
      </button>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {durationSec ? formatDuration(durationSec) : '—:—'}
      </span>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="none"
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
