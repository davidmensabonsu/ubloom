import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Headphones, Sparkles } from 'lucide-react';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { usePodcastArtwork } from '@/hooks/usePodcastArtwork';
import { supabase } from '@/integrations/supabase/client';
import ResourceCard from './ResourceCard';
import ResourceDetailSheet from './ResourceDetailSheet';

const podcastTopics = [
  { key: 'all', label: 'All' },
  { key: 'for-you', label: 'For You' },
  { key: 'saved', label: 'Saved' },
  { key: 'mindset', label: 'Mindset' },
  { key: 'finance', label: 'Finance' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'spirituality', label: 'Spirituality' },
  { key: 'wellness', label: 'Wellness' },
] as const;

type TopicKey = (typeof podcastTopics)[number]['key'];

const topicTagMap: Record<string, string[]> = {
  mindset: ['mindset', 'growth', 'motivation', 'habits', 'confidence', 'greatness', 'success'],
  finance: ['finance', 'budgeting', 'independence', 'investing', 'wealth', 'ambition'],
  creativity: ['creativity', 'art', 'productivity', 'ideas'],
  spirituality: ['spirituality', 'purpose', 'mindfulness', 'wisdom', 'astrology', 'self-discovery'],
  wellness: ['vulnerability', 'healing', 'identity', 'mental health', 'lifestyle', 'beauty', 'wellness'],
};

const FOR_YOU_CACHE_KEY = 'podcast-for-you-cache';
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

export default function PodcastsSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | undefined>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const allPodcasts = wonderResources.filter((r) => r.category === 'podcasts');
  const savedIds = profile.savedResources || [];

  // Fetch Apple Podcasts artwork
  const podcastTitles = useMemo(() => allPodcasts.map((p) => p.title), [allPodcasts]);
  const { artworks, loading: artworkLoading } = usePodcastArtwork(podcastTitles);

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
      const resourceIds = allPodcasts.map((r) => ({ id: r.id, title: r.title, tags: r.tags }));
      const { data, error } = await supabase.functions.invoke('wonder-recommendations', {
        body: {
          struggles: profile.struggles,
          dreamSelfFeels: profile.dreamSelfFeels,
          wantsMoreOf: profile.wantsMoreOf,
          identityStatement: profile.identityStatement,
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
      console.error('Podcast For You recommendations error:', e);
    } finally {
      setForYouLoading(false);
    }
  }, [allPodcasts, profile]);

  useEffect(() => {
    if (activeTopic === 'for-you' && forYouRecs.length === 0 && !forYouLoading) {
      fetchForYou();
    }
  }, [activeTopic]);

  const reasonMap = useMemo(() => {
    const map: Record<string, string> = {};
    forYouRecs.forEach((r) => { map[r.id] = r.reason; });
    return map;
  }, [forYouRecs]);

  const filtered = activeTopic === 'saved'
    ? allPodcasts.filter((r) => savedIds.includes(r.id))
    : activeTopic === 'for-you'
      ? allPodcasts.filter((r) => forYouRecs.some((rec) => rec.id === r.id))
      : activeTopic === 'all'
        ? allPodcasts
        : allPodcasts.filter((p) =>
            p.tags.some((t) => topicTagMap[activeTopic]?.includes(t))
          );

  const handleSelect = (r: WonderResource, reason?: string) => {
    setSelectedResource(r);
    setSelectedReason(reason);
    setSheetOpen(true);
  };

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedIds.includes(id) ? unsaveResource(id) : saveResource(id);
  };

  const savedCount = allPodcasts.filter((r) => savedIds.includes(r.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {podcastTopics.map((topic) => (
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
            {topic.key === 'saved' && savedCount > 0 && (
              <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {savedCount}
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
                <div className="w-full aspect-square bg-muted/50" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted/50 rounded-full w-full" />
                  <div className="h-3 bg-muted/50 rounded-full w-4/5" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : activeTopic === 'saved' && filtered.length === 0 ? (
          <motion.div
            key="empty-saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any podcast to save it
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
              const artwork = artworks[resource.title];
              const reason = activeTopic === 'for-you' ? reasonMap[resource.id] : undefined;
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  className="relative"
                >
                  {artwork ? (
                    <motion.button
                      onClick={() => handleSelect(resource, reason)}
                      className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="w-full aspect-square overflow-hidden">
                        <img
                          src={artwork}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {resource.title}
                        </h4>
                        {reason ? (
                          <p className="text-xs text-primary/80 mt-1 line-clamp-2 leading-relaxed italic">
                            {reason}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                            {resource.description}
                          </p>
                        )}
                        {resource.episodeDuration && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                            {resource.episodeDuration} per episode
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ) : (
                    <ResourceCard
                      resource={resource}
                      onTap={() => handleSelect(resource, reason)}
                      compact
                    />
                  )}
                  <button
                    onClick={(e) => handleToggleSave(e, resource.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm transition-colors hover:bg-background z-10"
                  >
                    <Bookmark
                      size={14}
                      className={savedIds.includes(resource.id) ? 'text-primary fill-primary' : 'text-muted-foreground'}
                    />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTopic === 'for-you' && !forYouLoading && filtered.length === 0 && forYouRecs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">Complete your profile to get personalised recommendations.</p>
      )}

      {activeTopic !== 'saved' && activeTopic !== 'for-you' && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No podcasts in this topic yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        podcastInsightReason={selectedReason}
      />
    </div>
  );
}
