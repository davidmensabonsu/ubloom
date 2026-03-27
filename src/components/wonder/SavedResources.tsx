import { useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, typeLabels, categoryColors, type WonderResource } from '@/lib/wonderResources';
import { resourceThumbnails } from '@/lib/resourceMedia';
import { toast } from 'sonner';

interface SavedResourcesProps {
  onSelectResource: (r: WonderResource) => void;
}

export default function SavedResources({ onSelectResource }: SavedResourcesProps) {
  const { savedResources = [] } = useUserStore((s) => s.profile);
  const unsaveResource = useUserStore((s) => s.unsaveResource);
  const [removing, setRemoving] = useState<string | null>(null);
  const longPressTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleLongPressStart = useCallback((id: string) => {
    longPressTimers.current[id] = setTimeout(() => {
      setRemoving(id);
    }, 500);
  }, []);

  const handleLongPressEnd = useCallback((id: string) => {
    clearTimeout(longPressTimers.current[id]);
  }, []);

  const handleRemove = useCallback((id: string, title: string) => {
    unsaveResource(id);
    setRemoving(null);
    toast('Removed from saved', { description: title });
  }, [unsaveResource]);

  const saved = useMemo(() => {
    if (!savedResources.length) return [];
    return savedResources
      .map((id) => wonderResources.find((r) => r.id === id))
      .filter(Boolean) as WonderResource[];
  }, [savedResources]);

  if (!saved.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      className="space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark size={16} className="text-primary fill-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Saved for Later</h2>
        </div>
        <span className="text-xs text-muted-foreground">{saved.length} saved</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        <AnimatePresence>
          {saved.map((resource, i) => {
            const typeInfo = typeLabels[resource.type];
            const color = categoryColors[resource.category];
            const thumbnail = resourceThumbnails[resource.id];
            const isRemoving = removing === resource.id;

            return (
              <motion.div
                key={resource.id}
                layout
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ delay: Math.min(i * 0.05, 0.2) }}
                className="shrink-0 w-36 relative"
              >
                <motion.button
                  onClick={() => onSelectResource(resource)}
                  onPointerDown={() => handleLongPressStart(resource.id)}
                  onPointerUp={() => handleLongPressEnd(resource.id)}
                  onPointerLeave={() => handleLongPressEnd(resource.id)}
                  className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
                  whileTap={{ scale: 0.97 }}
                >
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
                  <div className="p-2.5">
                    <span
                      className="text-[9px] font-medium inline-block px-1.5 py-0.5 rounded-full mb-1"
                      style={{
                        backgroundColor: `hsl(${color} / 0.12)`,
                        color: `hsl(${color})`,
                      }}
                    >
                      {typeInfo.label}
                    </span>
                    <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {resource.title}
                    </h4>
                  </div>
                </motion.button>

                {/* Remove button – always visible */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(resource.id, resource.title);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-destructive/20 transition-colors"
                  aria-label={`Remove ${resource.title}`}
                >
                  <X size={12} className="text-muted-foreground" />
                </button>

                {/* Long-press confirmation overlay */}
                <AnimatePresence>
                  {isRemoving && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10"
                    >
                      <p className="text-xs font-medium text-foreground">Remove?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemove(resource.id, resource.title)}
                          className="px-3 py-1 rounded-full bg-destructive/15 text-destructive text-[11px] font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setRemoving(null)}
                          className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
