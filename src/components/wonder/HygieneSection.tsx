import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Sparkles } from 'lucide-react';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import ResourceCard from './ResourceCard';
import ResourceDetailSheet from './ResourceDetailSheet';

const hygieneTopics = [
  { key: 'all', label: 'All' },
  { key: 'saved', label: 'Saved' },
  { key: 'body', label: 'Body' },
  { key: 'skin', label: 'Skin & Face' },
  { key: 'hair', label: 'Hair' },
  { key: 'oral', label: 'Oral & Lips' },
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'hands-feet', label: 'Hands & Feet' },
] as const;

type TopicKey = (typeof hygieneTopics)[number]['key'];

const topicTagMap: Record<string, string[]> = {
  body: ['morning', 'shower', 'freshness', 'confidence', 'daily', 'intimate care', 'body', 'exfoliation', 'shaving', 'bedtime'],
  skin: ['skincare', 'glow', 'facial'],
  hair: ['hair', 'beauty'],
  oral: ['dental', 'smile', 'health', 'lips'],
  fragrance: ['fragrance'],
  'hands-feet': ['nails', 'hands', 'grooming', 'feet', 'self-care'],
};

export default function HygieneSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const allHygiene = wonderResources.filter((r) => r.category === 'hygiene');
  const savedIds = profile.savedResources || [];

  const filtered = activeTopic === 'saved'
    ? allHygiene.filter((r) => savedIds.includes(r.id))
    : activeTopic === 'all'
      ? allHygiene
      : allHygiene.filter((r) =>
          r.tags.some((t) => topicTagMap[activeTopic]?.includes(t))
        );

  const handleSelect = (r: WonderResource) => {
    setSelectedResource(r);
    setSheetOpen(true);
  };

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedIds.includes(id) ? unsaveResource(id) : saveResource(id);
  };

  const savedCount = allHygiene.filter((r) => savedIds.includes(r.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {hygieneTopics.map((topic) => (
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
              <Sparkles size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any tip to save it
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
            {filtered.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="relative"
              >
                <ResourceCard
                  resource={resource}
                  onTap={() => handleSelect(resource)}
                  compact
                />
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
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTopic !== 'saved' && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No tips in this category yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
