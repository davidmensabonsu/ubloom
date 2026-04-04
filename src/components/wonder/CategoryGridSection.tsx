import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { wonderResources, type WonderResource, type WonderCategory } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import ResourceCard from './ResourceCard';

const INITIAL_SHOW = 8;

interface CategoryGridSectionProps {
  category: WonderCategory | 'all';
  onSelectResource: (r: WonderResource) => void;
}

export default function CategoryGridSection({ category, onSelectResource }: CategoryGridSectionProps) {
  const [showSaved, setShowSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { profile, saveResource, unsaveResource } = useUserStore();

  const savedIds = profile.savedResources || [];

  const allResources = category === 'all'
    ? wonderResources
    : wonderResources.filter((r) => r.category === category);

  const savedCount = allResources.filter((r) => savedIds.includes(r.id)).length;

  const filtered = showSaved
    ? allResources.filter((r) => savedIds.includes(r.id))
    : allResources;

  const visibleResources = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hasMore = filtered.length > INITIAL_SHOW;

  const handleToggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    savedIds.includes(id) ? unsaveResource(id) : saveResource(id);
  };

  return (
    <div className="space-y-3">
      {/* Saved toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setShowSaved(false); setShowAll(false); }}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
            !showSaved
              ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setShowSaved(true); setShowAll(false); }}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
            showSaved
              ? 'bg-primary/15 text-foreground ring-1 ring-primary/50'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          Saved
          {savedCount > 0 && (
            <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-semibold">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showSaved && filtered.length === 0 ? (
          <motion.div
            key="empty-saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart size={24} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-[220px]">
              Tap the <Bookmark size={12} className="inline text-primary" /> on any resource to save it
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={showSaved ? 'saved' : 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {visibleResources.map((resource, i) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  className="relative"
                >
                  <ResourceCard
                    resource={resource}
                    onTap={() => onSelectResource(resource)}
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
            </div>

            {!showSaved && hasMore && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 mx-auto text-xs text-primary font-medium hover:underline py-2 mt-2"
              >
                {showAll ? (
                  <>Show less <ChevronUp size={14} /></>
                ) : (
                  <>Show all ({filtered.length}) <ChevronDown size={14} /></>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
