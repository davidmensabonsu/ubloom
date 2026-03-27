import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources, typeLabels, categoryColors, type WonderResource } from '@/lib/wonderResources';
import { resourceThumbnails } from '@/lib/resourceMedia';

interface SavedResourcesProps {
  onSelectResource: (r: WonderResource) => void;
}

export default function SavedResources({ onSelectResource }: SavedResourcesProps) {
  const { savedResources = [] } = useUserStore((s) => s.profile);

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
        {saved.map((resource, i) => {
          const typeInfo = typeLabels[resource.type];
          const color = categoryColors[resource.category];
          const thumbnail = resourceThumbnails[resource.id];

          return (
            <motion.button
              key={resource.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.2) }}
              onClick={() => onSelectResource(resource)}
              className="shrink-0 w-36 text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
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
                  <div className="absolute top-1.5 right-1.5">
                    <Bookmark size={12} className="text-primary fill-primary drop-shadow" />
                  </div>
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
          );
        })}
      </div>
    </motion.div>
  );
}
