import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface PinterestCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  subtitle?: string;
  badge?: string;
  onTap: () => void;
  /** If true, card shows a taller image aspect */
  tall?: boolean;
  /** Show circular thumbnail collection instead of a single image */
  collection?: { images: string[]; labels: string[] };
}

export default function PinterestCard({
  id,
  title,
  thumbnail,
  subtitle,
  badge,
  onTap,
  tall,
  collection,
}: PinterestCardProps) {
  const { profile, saveResource, unsaveResource } = useUserStore();
  const savedIds = profile.savedResources || [];
  const isSaved = savedIds.includes(id);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    isSaved ? unsaveResource(id) : saveResource(id);
  };

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left rounded-2xl bg-card/80 border border-border/40 overflow-hidden transition-colors hover:bg-card break-inside-avoid mb-3"
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image */}
      {thumbnail && !collection && (
        <div className={`w-full overflow-hidden relative ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {badge && (
            <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-card/85 backdrop-blur-sm text-foreground">
              {badge}
            </span>
          )}
          {/* Heart button */}
          <button
            onClick={handleToggleSave}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-card/70 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-card/90"
          >
            <Heart
              size={15}
              className={isSaved ? 'text-primary fill-primary' : 'text-muted-foreground/70'}
            />
          </button>
        </div>
      )}

      {/* Collection grid (circular thumbnails) */}
      {collection && (
        <div className="p-3 pb-1">
          <div className="grid grid-cols-3 gap-2">
            {collection.images.map((img, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border/30">
                  <img src={img} alt={collection.labels[i]} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight line-clamp-1">
                  {collection.labels[i]}
                </span>
              </div>
            ))}
          </div>
          {/* Heart */}
          <div className="flex justify-end mt-1">
            <button onClick={handleToggleSave} className="p-1">
              <Heart
                size={14}
                className={isSaved ? 'text-primary fill-primary' : 'text-muted-foreground/50'}
              />
            </button>
          </div>
        </div>
      )}

      {/* Text content */}
      {(title || subtitle) && !collection && (
        <div className="px-3 py-2.5">
          {title && (
            <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
      )}
    </motion.button>
  );
}
