import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Undo2, X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/hooks/use-toast';

const ACTION_LABELS: Record<'add' | 'replace_today' | 'clear_today', string> = {
  add: 'Ubi added tasks to your routine.',
  replace_today: "Ubi replaced today's routine.",
  clear_today: "Ubi cleared today's routine.",
};

/**
 * Lightweight pill that lets the user revert the most recent Ubi-applied
 * routine change (add / replace today / clear today). Auto-hides 60s after
 * the change so it doesn't linger forever.
 */
export default function UndoRoutineBanner() {
  const routineUndo = useUserStore((s) => s.routineUndo);
  const undoRoutineChange = useUserStore((s) => s.undoRoutineChange);
  const clearRoutineUndo = useUserStore((s) => s.clearRoutineUndo);
  const { toast } = useToast();
  const [, force] = useState(0);

  // Re-render every 5s so the relative timestamp / auto-expiry stays fresh.
  useEffect(() => {
    if (!routineUndo) return;
    const id = window.setInterval(() => force((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, [routineUndo]);

  if (!routineUndo) return null;

  // Auto-expire after 5 minutes so a stale undo doesn't bring back
  // tasks the user manually changed later.
  const ageMs = Date.now() - routineUndo.createdAt;
  if (ageMs > 5 * 60 * 1000) {
    clearRoutineUndo();
    return null;
  }

  const handleUndo = () => {
    const ok = undoRoutineChange();
    if (ok) {
      toast({ title: 'Reverted', description: "Your routine is back to how it was before Ubi's last change." });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {ACTION_LABELS[routineUndo.action]}
          </p>
          <p className="text-xs text-muted-foreground">Not what you wanted? Undo it.</p>
        </div>
        <button
          onClick={handleUndo}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 hover:bg-primary/20 transition-colors"
        >
          <Undo2 size={14} strokeWidth={2.5} />
          Undo
        </button>
        <button
          onClick={clearRoutineUndo}
          className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}