import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Search, Pen, Mic, Video, X } from 'lucide-react';
import { useUserStore, type JournalEntry } from '@/stores/userStore';
import JournalAudioPlayer from './JournalAudioPlayer';

interface JournalHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Filter = 'all' | 'write' | 'voice' | 'video';

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function isVoiceEntry(entry: JournalEntry) {
  return entry.content.startsWith('🎙️') || !!entry.audioPath;
}

function isVideoEntry(entry: JournalEntry) {
  return entry.content.startsWith('🎬') || !!entry.videoPath;
}

function entryPreview(entry: JournalEntry) {
  if (isVoiceEntry(entry)) {
    const stripped = entry.content
      .replace(/^🎙️[^\n]*\n?/, '')
      .replace(/^Prompt:[^\n]*\n?/, '')
      .trim();
    return stripped || 'Voice memo';
  }
  if (isVideoEntry(entry)) {
    const stripped = entry.content
      .replace(/^🎬[^\n]*\n?/, '')
      .replace(/^Prompt:[^\n]*\n?/, '')
      .trim();
    return stripped || 'Video journal';
  }
  return entry.content;
}

export default function JournalHistorySheet({ open, onOpenChange }: JournalHistorySheetProps) {
  const entries = useUserStore((s) => s.profile.journalEntries) || [];
  const removeEntry = useUserStore((s) => s.removeJournalEntry);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      const isVoice = isVoiceEntry(e);
      const isVideo = isVideoEntry(e);
      if (filter === 'write' && isVoice) return false;
      if (filter === 'write' && isVideo) return false;
      if (filter === 'voice' && !isVoice) return false;
      if (filter === 'video' && !isVideo) return false;
      if (!q) return true;
      return entryPreview(e).toLowerCase().includes(q);
    });
  }, [entries, query, filter]);

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `All · ${entries.length}` },
    { value: 'write', label: 'Written' },
    { value: 'voice', label: 'Voice' },
    { value: 'video', label: 'Video' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t-0 max-h-[90vh] flex flex-col p-0">
        <SheetHeader className="px-5 pt-6 pb-3 text-left shrink-0">
          <SheetTitle className="font-serif text-2xl">Your journal</SheetTitle>
        </SheetHeader>

        {/* Search + filters */}
        <div className="px-5 pb-3 space-y-3 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your entries..."
              className="pl-9 pr-9 rounded-full bg-muted/60 border-transparent focus-visible:ring-1"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {filters.map(({ value, label }) => {
              const active = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              {query ? 'No entries match your search.' : 'No entries yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((entry) => {
                const isVoice = isVoiceEntry(entry);
                const isVideo = isVideoEntry(entry);
                const Icon = isVideo ? Video : isVoice ? Mic : Pen;
                const preview = entryPreview(entry);
                return (
                  <div
                    key={entry.id}
                    className="bg-card border border-border rounded-2xl p-3 flex items-start gap-3"
                  >
                    <Icon size={14} className="text-primary mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-primary">{formatDate(entry.date)}</p>
                        <button
                          onClick={() => {
                            if (confirm('Delete this entry?')) removeEntry(entry.id);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-sm text-foreground/85 leading-snug mt-1 whitespace-pre-wrap">
                        {preview}
                      </p>
                      {isVoice && entry.audioPath && (
                        <JournalAudioPlayer path={entry.audioPath} durationSec={entry.audioDurationSec} />
                      )}
                      {isVideo && entry.videoPath && (
                        <JournalVideoPlayer path={entry.videoPath} durationSec={entry.videoDurationSec} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
