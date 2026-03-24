import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { typeLabels, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';

interface ResourceCardProps {
  resource: WonderResource;
  onTap: () => void;
  context?: string;
}

export default function ResourceCard({ resource, onTap, context }: ResourceCardProps) {
  const { profile } = useUserStore();
  const isSaved = profile.savedResources?.includes(resource.id);
  const isUsed = profile.usedResources?.includes(resource.id);
  const typeInfo = typeLabels[resource.type];

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

      {context && (
        <p className="text-xs italic text-primary/80 mt-1">
          "{context}"
        </p>
      )}
    </motion.button>
  );
}
