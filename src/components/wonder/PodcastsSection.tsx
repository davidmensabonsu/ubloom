import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Headphones } from 'lucide-react';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { usePodcastArtwork } from '@/hooks/usePodcastArtwork';
import ResourceCard from './ResourceCard';
import ResourceDetailSheet from './ResourceDetailSheet';

const podcastTopics = [
  { key: 'all', label: 'All' },
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

export default function PodcastsSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const allPodcasts = wonderResources.filter((r) => r.category === 'podcasts');
  const savedIds = profile.savedResources || [];

  // Fetch Apple Podcasts artwork
  const podcastTitles = useMemo(() => allPodcasts.map((p) => p.title), [allPodcasts]);
  const { artworks, loading: artworkLoading } = usePodcastArtwork(podcastTitles);

  const filtered = activeTopic === 'saved'
    ? allPodcasts.filter((r) => savedIds.includes(r.id))
    : activeTopic === 'all'
      ? allPodcasts
      : allPodcasts.filter((p) =>
          p.tags.some((t) => topicTagMap[activeTopic]?.includes(t))
        );

  const handleSelect = (r: WonderResource) => {
    setSelectedResource(r);
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
        {activeTopic === 'saved' && filtered.length === 0 ? (
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
                      onClick={() => handleSelect(resource)}
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
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
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
                      onTap={() => handleSelect(resource)}
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

      {activeTopic !== 'saved' && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No podcasts in this topic yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
