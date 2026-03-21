import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useUserStore, type TripChecklistItem } from '@/stores/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TripChecklistProps {
  goalId: string;
  items: TripChecklistItem[];
}

export default function TripChecklist({ goalId, items }: TripChecklistProps) {
  const { addChecklistItem, toggleChecklistItem, removeChecklistItem } = useUserStore();
  const [newItem, setNewItem] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newItem.trim()) {
      addChecklistItem(goalId, newItem.trim());
      setNewItem('');
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 group"
          >
            <button
              onClick={() => toggleChecklistItem(goalId, item.id)}
              className={`check-circle shrink-0 ${item.completed ? 'checked' : ''}`}
            >
              {item.completed && <Check size={14} />}
            </button>
            <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {item.title}
            </span>
            <button
              onClick={() => removeChecklistItem(goalId, item.id)}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setIsAdding(false); setNewItem(''); }
            }}
            placeholder="e.g. Book flights, Pack sunscreen..."
            className="flex-1 text-sm bg-background rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <button onClick={handleAdd} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Check size={16} />
          </button>
          <button onClick={() => { setIsAdding(false); setNewItem(''); }} className="p-2 rounded-xl bg-muted text-muted-foreground">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full p-2.5 rounded-xl border border-dashed border-primary/30 text-primary text-sm flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors"
        >
          <Plus size={14} />
          Add item
        </button>
      )}
    </div>
  );
}
