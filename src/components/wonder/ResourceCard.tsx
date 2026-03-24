import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { typeLabels, categoryColors, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';

interface ResourceCardProps {
  resource: WonderResource;
  onTap: () => void;
  compact?: boolean;
}

export default function ResourceCard({ resource, onTap, compact }: ResourceCardProps) {
  const { profile } = useUserStore();
  const isSaved = profile.savedResources?.includes(resource.id);
  const isUsed = profile.usedResources?.includes(resource.id);
  const typeInfo = typeLabels[resource.type];
  const color = categoryColors[resource.category];

  if (compact) {
    return (
      <motion.button
        onClick={onTap}
        className="w-full text-left p-3.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
        whileTap={{ scale: 0.97 }}
      >
        {/* Subtle top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: `hsl(${color} / 0.5)` }}
        />
        <div className="flex items-start gap-2">
          <span className="text-xl shrink-0 mt-0.5">{typeInfo.emoji}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {resource.title}
            </h4>
            <span
              className="text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `hsl(${color} / 0.12)`,
                color: `hsl(${color})`,
              }}
            >
              {typeInfo.label}
            </span>
          </div>
          {(isSaved || isUsed) && (
            <div className="shrink-0">
              {isSaved && <Bookmark size={12} className="text-primary fill-primary" />}
              {isUsed && <CheckCircle2 size={12} className="text-primary" />}
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left p-4 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-colors space-y-2 relative"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs">{typeInfo.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium">{typeInfo.label}</span>
          </div>
          <h4 className="text-sm font-medium text-foreground leading-snug">
            {resource.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {resource.description}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0">
          {isSaved && <Bookmark size={14} className="text-primary fill-primary" />}
          {isUsed && <CheckCircle2 size={14} className="text-primary" />}
        </div>
      </div>
    </motion.button>
  );
}
