import { motion } from 'framer-motion';
import { Bookmark, CheckCircle2 } from 'lucide-react';
import { typeLabels, categoryColors, type WonderResource } from '@/lib/wonderResources';
import { resourceThumbnails } from '@/lib/resourceMedia';
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
  const thumbnail = resourceThumbnails[resource.id];

  if (compact) {
    return (
      <motion.button
        onClick={onTap}
        className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors relative overflow-hidden"
        whileTap={{ scale: 0.97 }}
      >
        {/* Thumbnail image */}
        {thumbnail && (
          <div className="w-full aspect-[4/3] overflow-hidden">
            <img
              src={thumbnail}
              alt={resource.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-3">
          {/* Category badge */}
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

          {resource.dosage && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-primary font-medium">
              <span>💊 {resource.dosage.amount}</span>
              <span className="text-muted-foreground">·</span>
              <span className="capitalize">{resource.dosage.timing.split(' ')[0]}</span>
            </div>
          )}

          {(isSaved || isUsed) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {isSaved && <Bookmark size={11} className="text-primary fill-primary" />}
              {isUsed && <CheckCircle2 size={11} className="text-primary" />}
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left rounded-2xl bg-muted/50 hover:bg-muted/70 transition-colors relative overflow-hidden"
      whileTap={{ scale: 0.98 }}
    >
      {thumbnail && (
        <div className="w-full aspect-[16/9] overflow-hidden">
          <img
            src={thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <img src={typeInfo.icon} alt="" className="w-4 h-4 object-contain clay-icon" />
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
      </div>
    </motion.button>
  );
}
