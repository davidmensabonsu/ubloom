import { motion, AnimatePresence } from 'framer-motion';
import { getLocalDateStr } from '@/lib/dateUtils';
import { useState } from 'react';
import { useUserStore, CoreHabit } from '@/stores/userStore';
import { Check, Sparkles, Pencil, Trash2, Settings2 } from 'lucide-react';
import { getTaskIcon, renderTaskIcon } from '@/lib/taskIcons';
import EditHabitDialog from '@/components/routine/EditHabitDialog';
import { isHabitScheduledForDate, getFrequencyLabel } from '@/components/routine/FrequencyPicker';
import { track } from '@/hooks/useAnalytics';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function HabitIcon({ iconId }: { iconId?: string }) {
  const opt = iconId ? getTaskIcon(iconId) : undefined;
  if (opt?.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain w-11 h-11 flex-shrink-0 clay-icon" />;
  }
  return (
    <div className="icon-3d-sm">
      {opt ? renderTaskIcon(opt, 20) : <Sparkles size={20} strokeWidth={2.5} />}
    </div>
  );
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

interface SortableRowProps {
  habit: CoreHabit;
  editMode: boolean;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({ habit, editMode, isCompleted, onToggle, onEdit, onDelete }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 10 : 'auto' as const,
  };

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`check-item w-full cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-elevated' : ''}`}
        {...attributes}
        {...listeners}
      >
        <span className="text-sm font-medium flex items-center gap-2 flex-1">
          <HabitIcon iconId={habit.icon} />
          {habit.title}
        </span>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-full hover:bg-primary/10 text-primary transition-colors"
          >
            <Settings2 size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`check-item w-full cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-elevated' : ''}`}
      whileTap={{ scale: 0.98 }}
      {...attributes}
      {...listeners}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className={`check-circle ${isCompleted ? 'checked' : ''}`}>
          {isCompleted && <Check size={14} strokeWidth={2.5} />}
        </div>
        <span
          className={`text-sm font-medium flex items-center gap-2 ${
            isCompleted ? 'line-through text-muted-foreground' : ''
          }`}
        >
          <HabitIcon iconId={habit.icon} />
          {habit.title}
          {habit.scheduledTime && (
            <span className="text-xs text-muted-foreground/60 font-normal">{formatTime(habit.scheduledTime)}</span>
          )}
        </span>
        {getFrequencyLabel(habit) && !habit.scheduledTime && (
          <span className="ml-auto text-xs text-muted-foreground/50">{getFrequencyLabel(habit)}</span>
        )}
      </button>
    </motion.div>
  );
}

export default function CoreHabitsSection() {
  const {
    profile,
    toggleHabitCompletion,
    isHabitCompletedToday,
    removeHabit,
    updateHabit,
    setCoreHabits,
  } = useUserStore();

  const { coreHabits } = profile;

  const [editMode, setEditMode] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<{ id: string; title: string } | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<CoreHabit | null>(null);

  const today = getLocalDateStr();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Visible list = all today-scheduled habits in their stored order.
  // In edit mode we show every habit so users can reorder and tweak any of them.
  const visibleHabits = editMode
    ? coreHabits
    : coreHabits.filter((h) => isHabitScheduledForDate(h, today));

  const totalItems = visibleHabits.length;
  const totalCompleted = visibleHabits.filter((h) => isHabitCompletedToday(h.id)).length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = coreHabits.map((h) => h.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    if (oldIdx === -1 || newIdx === -1) return;
    setCoreHabits(arrayMove(coreHabits, oldIdx, newIdx));
  };

  if (coreHabits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">To-do list</h2>
          <p className="text-xs text-muted-foreground font-medium">
            {totalCompleted} of {totalItems} completed today
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className={`p-2 rounded-full transition-colors ${editMode ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
        >
          <Pencil size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>

      {/* Unified flat list with drag and drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleHabits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence>
              {visibleHabits.map((habit) => (
                <SortableRow
                  key={habit.id}
                  habit={habit}
                  editMode={editMode}
                  isCompleted={isHabitCompletedToday(habit.id)}
                  onToggle={() => {
                    toggleHabitCompletion(habit.id);
                    track('habit_completed', { habitId: habit.id, timeOfDay: habit.timeOfDay, source: 'routine_core_habits' });
                  }}
                  onEdit={() => setHabitToEdit(habit)}
                  onDelete={() => setHabitToDelete({ id: habit.id, title: habit.title })}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {editMode && (
        <p className="text-center text-xs text-muted-foreground pt-1">
          Use the + button to add new to-dos
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove to-do?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold">"{habitToDelete?.title}"</span> from your list. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (habitToDelete) {
                  removeHabit(habitToDelete.id);
                }
                setHabitToDelete(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Habit Dialog */}
      <EditHabitDialog
        habit={habitToEdit}
        open={!!habitToEdit}
        onOpenChange={(open) => !open && setHabitToEdit(null)}
        onSave={updateHabit}
      />
    </div>
  );
}
