import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookOpen } from 'lucide-react';
import { wonderResources, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { resourceThumbnails } from '@/lib/resourceMedia';
import { typeLabels, categoryColors } from '@/lib/wonderResources';
import ResourceDetailSheet from './ResourceDetailSheet';

const bookTopics = [
  { key: 'all', label: 'All' },
  { key: 'reading-list', label: '📚 My List' },
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

function BookCard({
  resource,
  onTap,
  isSaved,
  onToggleSave,
}: {
  resource: WonderResource;
  onTap: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  const typeInfo = typeLabels[resource.type];
  const color = categoryColors[resource.category];
  const thumbnail = resourceThumbnails[resource.id];

  return (
    <motion.div
      className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
      whileTap={{ scale: 0.97 }}
    >
      <button onClick={onTap} className="w-full text-left">
        {thumbnail && (
          <div className="w-full aspect-[4/3] overflow-hidden relative">
            <img
              src={thumbnail}
              alt={resource.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
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
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>
      </button>

      {/* Bookmark button */}
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

export default function BooksSection() {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const [selectedResource, setSelectedResource] = useState<WonderResource | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const allBooks = wonderResources.filter((r) => r.category === 'books');
  const savedIds = profile.savedResources || [];

  const filtered = activeTopic === 'reading-list'
    ? allBooks.filter((r) => savedIds.includes(r.id))
    : activeTopic === 'all'
      ? allBooks
      : allBooks.filter((r) =>
          r.tags.some((t) => topicTagMap[activeTopic]?.includes(t))
        );

  const handleSelect = (r: WonderResource) => {
    setSelectedResource(r);
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
        {activeTopic === 'reading-list' && filtered.length === 0 ? (
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
            {filtered.map((resource, i) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
              >
                <BookCard
                  resource={resource}
                  onTap={() => handleSelect(resource)}
                  isSaved={savedIds.includes(resource.id)}
                  onToggleSave={(e) => handleToggleSave(e, resource.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {activeTopic !== 'reading-list' && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No books in this category yet.</p>
      )}

      <ResourceDetailSheet
        resource={selectedResource}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
