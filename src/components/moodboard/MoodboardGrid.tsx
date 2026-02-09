import { motion } from 'framer-motion';
import { X, Quote } from 'lucide-react';
import type { MoodboardItem } from '@/stores/userStore';

interface MoodboardGridProps {
  items: MoodboardItem[];
  onRemove: (item: MoodboardItem) => void;
}

export default function MoodboardGrid({ items, onRemove }: MoodboardGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="columns-2 gap-3 space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className="break-inside-avoid relative group"
        >
          {item.type === 'image' ? (
            <div className="rounded-2xl overflow-hidden border border-primary/10">
              <img
                src={item.content}
                alt="Moodboard"
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/50 border border-primary/10 p-4 flex flex-col gap-2">
              <Quote size={14} className="text-primary/40" />
              <p className="text-sm italic text-foreground/80 leading-relaxed">
                {item.content}
              </p>
            </div>
          )}

          <button
            onClick={() => onRemove(item)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} className="text-foreground" />
          </button>

          <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-background/60 backdrop-blur text-muted-foreground">
            {item.board}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
