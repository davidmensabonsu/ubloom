import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookOpen, Sparkles } from 'lucide-react';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { useSubscription } from '@/hooks/useSubscription';
import { typeLabels, categoryColors } from '@/lib/wonderResources';
import { supabase } from '@/integrations/supabase/client';
import ResourceDetailSheet from './ResourceDetailSheet';
import UnlockLibraryCard from './UnlockLibraryCard';

const bookTopics = [
  { key: 'all', label: 'All' },
  { key: 'for-you', label: 'For You' },
  { key: 'reading-list', label: 'My List' },
  { key: 'mindset', label: 'Mindset' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'spirituality', label: 'Spirituality' },
  { key: 'self-help', label: 'Self-Help' },
  { key: 'business', label: 'Business' },
] as const;

type TopicKey = (typeof bookTopics)[number]['key'];

const topicTagMap: Record<string, string[]> = {
  mindset: ['confidence', 'empowerment', 'discipline', 'growth', 'consistency', 'mindset', 'motivation'],
  wellness: ['healing', 'body-awareness', 'peace', 'self-worth', 'vulnerability', 'wellness'],
  spirituality: ['peace', 'freedom', 'awareness', 'intention', 'simplicity', 'spirituality', 'intuition', 'purpose'],
  'self-help': ['self-worth', 'empowerment', 'confidence', 'boundaries', 'self-help', 'habits', 'resilience'],
  business: ['business', 'finance', 'leadership', 'career', 'ambition', 'strategy', 'productivity'],
};

const FOR_YOU_CACHE_KEY = 'book-for-you-cache';
const FOR_YOU_CACHE_TTL = 24 * 60 * 60 * 1000;

interface ForYouCache {
  recommendations: { id: string; reason: string }[];
  timestamp: number;
}

function getForYouCache(): ForYouCache | null {
  try {
    const raw = localStorage.getItem(FOR_YOU_CACHE_KEY);
    if (!raw) return null;
    const entry: ForYouCache = JSON.parse(raw);
    if (Date.now() - entry.timestamp > FOR_YOU_CACHE_TTL) {
      localStorage.removeItem(FOR_YOU_CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function setForYouCache(recommendations: { id: string; reason: string }[]) {
  try {
    localStorage.setItem(FOR_YOU_CACHE_KEY, JSON.stringify({ recommendations, timestamp: Date.now() }));
  } catch {}
}

function BookCard({
  resource,
  onTap,
  isSaved,
  onToggleSave,
  coverUrl,
  reason,
  isLocked,
}: {
  resource: WonderResource;
  onTap: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  coverUrl?: string | null;
  reason?: string;
  isLocked?: boolean;
}) {
  const typeInfo = typeLabels[resource.type];
  const color = categoryColors[resource.category];

  return (
    <motion.div
      className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
      whileTap={{ scale: 0.97 }}
    >
      <button onClick={onTap} className="w-full text-left">
        <div className="w-full aspect-[3/4] overflow-hidden relative bg-muted">
          {coverUrl && !isLocked ? (
            <img src={coverUrl} alt={resource.title} className="w-full h-full object-cover" loading="lazy" />
          ) : coverUrl && isLocked ? (
            <div className="w-full h-full bg-muted" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <BookOpen size={32} className="text-primary/40 mb-2" />
              <p className="text-[11px] text-muted-foreground/70 text-center font-medium leading-tight line-clamp-3">
                {resource.title}
              </p>
            </div>
          )}
        </div>
        <div className="p-3">
          <span
            className="text-[10px] font-medium inline-block px-2 py-0.5 rounded-full mb-1.5"
            style={{
              backgroundColor: `hsl(${color} / 0.12)`,
              color: `hsl(${color})`,
            }}
          >
            {typeInfo.label}
          </span>
          <div className="flex items-start gap-1.5">
            <img src={typeInfo.icon} alt="" className="w-5 h-5 object-contain clay-icon shrink-0 mt-0.5" />
            <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {resource.title}
            </h4>
          </div>
          {reason ? (
            <p className="text-xs text-primary/80 mt-1 line-clamp-2 leading-relaxed italic">
              {reason}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>
      </button>

      <button
        onClick={onToggleSave}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors hover:bg-background"
      >
        <Bookmark
          size={14}
          className={isSaved ? 'text-primary fill-primary' : 'text-muted-foreground'}
        />
      </button>
    </motion.div>
  );
}

const FREE_RESOURCE_LIMIT = 3;

export default function BooksSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();
  const { isActive } = useSubscription();

  const allBooks = wonderResources.filter((r) => r.category === 'books');
  const savedIds = profile.savedResources || [];

  // Book covers are now hardcoded in wonderResources.ts — no API call needed

  // For You recommendations
  const [forYouRecs, setForYouRecs] = useState<{ id: string; reason: string }[]>([]);
  const [forYouLoading, setForYouLoading] = useState(false);

  const fetchForYou = useCallback(async () => {
    const cached = getForYouCache();
    if (cached) {
      setForYouRecs(cached.recommendations);
      return;
    }

    setForYouLoading(true);
    try {
      const resourceIds = allBooks.map((r) => ({ id: r.id, title: r.title, tags: r.tags }));
      const { data, error } = await supabase.functions.invoke('wonder-recommendations', {
        body: {
          struggles: profile.struggles,
          dreamSelfFeels: profile.dreamSelfFeels,
          wantsMoreOf: profile.wantsMoreOf,
          identityStatement: profile.identityStatement,
          interests: profile.interests,
          recentMoods: profile.moodHistory?.slice(-5).map((m) => m.moods).flat(),
          habitCategories: [],
          resourceIds,
        },
      });

      if (!error && data?.recommendations) {
        setForYouRecs(data.recommendations);
        setForYouCache(data.recommendations);
      }
    } catch (e) {
      console.error('For You recommendations error:', e);
    } finally {
      setForYouLoading(false);
    }
  }, [allBooks, profile]);

  useEffect(() => {
    if (activeTopic === 'for-you' && forYouRecs.length === 0 && !forYouLoading) {
      fetchForYou();
    }
  }, [activeTopic]);

  // Reason map for For You books
  const reasonMap = useMemo(() => {
    const map: Record<string, string> = {};
    forYouRecs.forEach((r) => { map[r.id] = r.reason; });
    return map;
  }, [forYouRecs]);

  const allFiltered = activeTopic === 'reading-list'
    ? allBooks.filter((r) => savedIds.includes(r.id))
    : activeTopic === 'for-you'
      ? allBooks.filter((r) => forYouRecs.some((rec) => rec.id === r.id))
      : activeTopic === 'all'
        ? allBooks
        : allBooks.filter((r) =>
            r.tags.some((t) => topicTagMap[activeTopic]?.includes(t))
          );

  const isGated = !isActive && activeTopic !== 'reading-list' && activeTopic !== 'for-you';
  const filtered = isGated ? allFiltered.slice(0, FREE_RESOURCE_LIMIT) : allFiltered;
  const hiddenCount = isGated ? Math.max(allFiltered.length - FREE_RESOURCE_LIMIT, 0) : 0;

  const handleSelect = (r: WonderResource, reason?: string) => {
    setSelectedResource(r);
    setSelectedReason(reason);
    setSheetOpen(true);
  };

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (savedIds.includes(id)) {
      unsaveResource(id);
    } else {
      saveResource(id);
    }
  };

  const readingListCount = allBooks.filter((r) => savedIds.includes(r.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {bookTopics.map((topic) => (
          <button
            key={topic.key}
            onClick={() => setActiveTopic(topic.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTopic === topic.key
                ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            {topic.key === 'for-you' && <Sparkles size={12} className="text-primary" />}
            {topic.label}
            {topic.key === 'reading-list' && readingListCount > 0 && (
              <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {readingListCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTopic === 'for-you' && forYouLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted/30 overflow-hidden animate-pulse">
                <div className="w-full aspect-[3/4] bg-muted/50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted/50 rounded-full w-16" />
                  <div className="h-4 bg-muted/50 rounded-full w-full" />
                  <div className="h-3 bg-muted/50 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeTopic === 'reading-list' && allFiltered.length === 0 ? (
          <motion.div
            key="empty-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any book to save it to your reading list
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTopic}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {filtered.map((resource, i) => {
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  className="relative"
                >
                  <BookCard
                    resource={resource}
                    onTap={() => handleSelect(resource, reasonMap[resource.id])}
                    isSaved={savedIds.includes(resource.id)}
                    onToggleSave={(e) => handleToggleSave(e, resource.id)}
                    coverUrl={resource.coverUrl}
                    reason={activeTopic === 'for-you' ? reasonMap[resource.id] : undefined}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {isGated && hiddenCount > 0 && (
        <UnlockLibraryCard category="books" hiddenCount={hiddenCount} />
      )}

      {activeTopic === 'for-you' && !forYouLoading && filtered.length === 0 && forYouRecs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">Complete your profile to get personalised recommendations.</p>
      )}

      {activeTopic !== 'reading-list' && activeTopic !== 'for-you' && allFiltered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No books in this category yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        bookInsightReason={selectedReason}
      />
    </div>
  );
}
