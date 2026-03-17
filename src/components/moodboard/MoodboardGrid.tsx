import { Reorder, useDragControls } from 'framer-motion';
import { X, Quote, GripVertical } from 'lucide-react';
import type { MoodboardItem } from '@/stores/userStore';

interface MoodboardGridProps {
  items: MoodboardItem[];
  onRemove: (item: MoodboardItem) => void;
  onReorder: (items: MoodboardItem[]) => void;
}

function MoodboardCard({
  item,
  onRemove,
}: {
  item: MoodboardItem;
  onRemove: (item: MoodboardItem) => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 50 }}
      className="relative group"
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
        <div className="rounded-2xl bg-muted/50 border border-primary/10 p-4 pb-8 flex flex-col gap-2">
          <Quote size={14} className="text-primary/40" />
          <p className="text-sm italic text-foreground/80 leading-relaxed">
            {item.content}
          </p>
        </div>
      )}

      {/* Drag handle */}
      <div
        onPointerDown={(e) => controls.start(e)}
        className="absolute top-2 left-2 w-7 h-7 md:w-6 md:h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={14} className="text-foreground md:[size:12px]" />
      </div>

      <button
        onClick={() => onRemove(item)}
        className="absolute top-2 right-2 w-7 h-7 md:w-6 md:h-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <X size={12} className="text-foreground" />
      </button>

      <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-background/60 backdrop-blur text-muted-foreground">
        {item.board}
      </span>
    </Reorder.Item>
  );
}

export default function MoodboardGrid({ items, onRemove, onReorder }: MoodboardGridProps) {
  if (items.length === 0) return null;

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className="columns-2 gap-2 [column-fill:_balance]"
    >
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid mb-2">
          <MoodboardCard item={item} onRemove={onRemove} />
        </div>
      ))}
    </Reorder.Group>
  );
}
