import { useState } from 'react';
import { Plus, X, Clock, MapPin } from 'lucide-react';
import { useUserStore, type TripItineraryItem } from '@/stores/userStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TripItineraryProps {
  goalId: string;
  items: TripItineraryItem[];
  totalDays: number;
}

export default function TripItinerary({ goalId, items, totalDays }: TripItineraryProps) {
  const { addItineraryItem, removeItineraryItem } = useUserStore();
  const [addingForDay, setAddingForDay] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleAdd = (day: number) => {
    if (newTitle.trim()) {
      addItineraryItem(goalId, { day, title: newTitle.trim(), time: newTime || undefined });
      setNewTitle('');
      setNewTime('');
      setAddingForDay(null);
    }
  };

  const days = totalDays > 0 ? Array.from({ length: totalDays }, (_, i) => i + 1) : [1];

  return (
    <div className="space-y-4">
      {days.map((day) => {
        const dayItems = items.filter((i) => i.day === day);
        return (
          <div key={day} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Day {day}
            </h4>
            <AnimatePresence>
              {dayItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 pl-3 border-l-2 border-primary/30 group"
                >
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center gap-2">
                      {item.time && (
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock size={10} />
                          {item.time}
                        </span>
                      )}
                      <span className="text-sm text-foreground">{item.title}</span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItineraryItem(goalId, item.id)}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {addingForDay === day ? (
              <div className="pl-3 border-l-2 border-primary/30 space-y-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd(day);
                    if (e.key === 'Escape') { setAddingForDay(null); setNewTitle(''); setNewTime(''); }
                  }}
                  placeholder="What's the plan?"
                  className="w-full text-sm bg-background rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="Time (e.g. 10am)"
                    className="flex-1 text-sm bg-background rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  />
                  <button onClick={() => handleAdd(day)} className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
                    Add
                  </button>
                  <button onClick={() => { setAddingForDay(null); setNewTitle(''); setNewTime(''); }} className="p-2 rounded-xl bg-muted text-muted-foreground">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingForDay(day)}
                className="ml-3 text-xs text-primary flex items-center gap-1 hover:underline"
              >
                <Plus size={12} />
                Add activity
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
