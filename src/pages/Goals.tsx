import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Plus, Target, Briefcase, Heart, Plane, Sparkles, X, Check, Pencil, Trash2, CalendarIcon } from 'lucide-react';
import ProfileButton from '@/components/ProfileButton';
import { format, parseISO, isPast, differenceInDays, startOfDay } from 'date-fns';
import BottomNav from '@/components/BottomNav';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { goalCategoryIcons } from '@/lib/moodIcons';

const categoryConfig = {
  lifestyle: {
    icon: Sparkles,
    iconImg: goalCategoryIcons.lifestyle,
    title: 'Lifestyle',
    color: 'text-amber-500',
    vision: 'A soft, beautiful life filled with intention and joy',
  },
  career: {
    icon: Briefcase,
    iconImg: goalCategoryIcons.career,
    title: 'Career & Business',
    color: 'text-emerald-500',
    vision: 'Work that lights me up and creates abundance',
  },
  wellness: {
    icon: Heart,
    iconImg: goalCategoryIcons.wellness,
    title: 'Health & Wellness',
    color: 'text-rose-500',
    vision: 'A body that feels strong, nourished, and at peace',
  },
  travel: {
    icon: Plane,
    iconImg: goalCategoryIcons.travel,
    title: 'Travel & Experiences',
    color: 'text-sky-500',
    vision: 'Adventures that expand my world and fill my soul',
  },
};

export default function Goals() {
  const { profile, addGoal, updateGoal, removeGoal, toggleGoalComplete } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<keyof typeof categoryConfig>('lifestyle');
  const [newGoalDeadline, setNewGoalDeadline] = useState<Date | undefined>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Edit state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDeadline, setEditingDeadline] = useState<Date | undefined>();

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      addGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        completed: false,
        vision: categoryConfig[newGoalCategory].vision,
        deadline: newGoalDeadline ? format(newGoalDeadline, 'yyyy-MM-dd') : undefined,
      });
      setNewGoalTitle('');
      setNewGoalDeadline(undefined);
      setShowAddModal(false);
    }
  };

  const handleStartEdit = (goal: { id: string; title: string; deadline?: string }) => {
    setEditingGoalId(goal.id);
    setEditingTitle(goal.title);
    setEditingDeadline(goal.deadline ? parseISO(goal.deadline) : undefined);
  };

  const handleSaveEdit = () => {
    if (editingGoalId && editingTitle.trim()) {
      updateGoal(editingGoalId, {
        title: editingTitle.trim(),
        deadline: editingDeadline ? format(editingDeadline, 'yyyy-MM-dd') : undefined,
      });
    }
    setEditingGoalId(null);
    setEditingTitle('');
    setEditingDeadline(undefined);
  };

  const handleCancelEdit = () => {
    setEditingGoalId(null);
    setEditingTitle('');
    setEditingDeadline(undefined);
  };

  const groupedGoals = profile.goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, typeof profile.goals>);

  // Sort each category: incomplete first (by deadline asc, no-deadline last), then completed
  Object.keys(groupedGoals).forEach((cat) => {
    groupedGoals[cat].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  });

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-title"
          >
            Your Vision
          </motion.h1>
          <ProfileButton />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1"
        >
          Aspirations that guide your becoming
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-5 space-y-4">
        {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(
          (category, index) => {
            const config = categoryConfig[category];
            const goals = groupedGoals[category] || [];
            const isExpanded = expandedCategory === category;

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-3xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img src={config.iconImg} alt="" className="w-10 h-10 object-contain" style={{ filter: 'saturate(1.5) contrast(1.15) drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-display text-lg font-medium text-foreground">
                      {config.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {goals.length} goal{goals.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus size={20} className="text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3">
                        <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                          "{config.vision}"
                        </p>

                        {goals.length > 0 ? (
                          (() => {
                            const incomplete = goals.filter((g) => !g.completed);
                            const completed = goals.filter((g) => g.completed);

                            const renderGoal = (goal: typeof goals[0]) => (
                              <div key={goal.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 group">
                                <button
                                  onClick={() => toggleGoalComplete(goal.id)}
                                  className={`check-circle shrink-0 mt-0.5 ${goal.completed ? 'checked' : ''}`}
                                >
                                  {goal.completed && <Check size={14} />}
                                </button>

                                {editingGoalId === goal.id ? (
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input
                                        autoFocus
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveEdit();
                                          if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        className="flex-1 text-sm bg-background rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                                      />
                                      <button onClick={handleSaveEdit} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                        <Check size={14} />
                                      </button>
                                      <button onClick={handleCancelEdit} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <button className={cn("flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border border-border hover:bg-muted transition-colors", !editingDeadline && "text-muted-foreground")}>
                                          <CalendarIcon size={12} />
                                          {editingDeadline ? format(editingDeadline, 'MMM d, yyyy') : 'Set timeframe'}
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={editingDeadline} onSelect={setEditingDeadline} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm block ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {goal.title}
                                      </span>
                                      {goal.deadline && (() => {
                                        const deadlineDate = startOfDay(parseISO(goal.deadline));
                                        const today = startOfDay(new Date());
                                        const daysLeft = differenceInDays(deadlineDate, today);
                                        const isOverdue = !goal.completed && isPast(deadlineDate) && daysLeft < 0;
                                        const isApproaching = !goal.completed && !isOverdue && daysLeft <= 7;
                                        return (
                                          <span className={cn("text-xs flex items-center gap-1 mt-0.5", isOverdue ? "text-destructive font-medium" : isApproaching ? "text-amber-500 font-medium" : "text-muted-foreground")}>
                                            <CalendarIcon size={10} />
                                            {isOverdue ? `Overdue · ${format(deadlineDate, 'MMM d, yyyy')}` : isApproaching ? `${daysLeft === 0 ? 'Due today' : `${daysLeft}d left`} · ${format(deadlineDate, 'MMM d, yyyy')}` : `By ${format(deadlineDate, 'MMM d, yyyy')}`}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                                      <button onClick={() => handleStartEdit(goal)} className="p-1.5 rounded-lg hover:bg-background/80 text-muted-foreground hover:text-foreground transition-colors">
                                        <Pencil size={14} />
                                      </button>
                                      <button onClick={() => removeGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );

                            return (
                              <>
                                {incomplete.map(renderGoal)}
                                {incomplete.length > 0 && completed.length > 0 && (
                                  <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">Completed</span>
                                    <div className="flex-1 h-px bg-border" />
                                  </div>
                                )}
                                {completed.map(renderGoal)}
                              </>
                            );
                          })()
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No goals yet. Tap + to add one.
                          </p>
                        )}

                        <button
                          onClick={() => {
                            setNewGoalCategory(category);
                            setShowAddModal(true);
                          }}
                          className="w-full p-3 rounded-xl border border-dashed border-primary/30 text-primary text-sm flex items-center justify-center gap-2 hover:bg-glow transition-colors"
                        >
                          <Plus size={16} />
                          Add a goal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setShowAddModal(true)}
        className="floating-action"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus size={24} />
      </motion.button>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setNewGoalDeadline(undefined);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-3xl shadow-elevated max-h-[70dvh] flex flex-col"
            >
              <div className="p-6 pb-0 flex items-center justify-between mb-4">
                <h2 className="section-title">Add New Goal</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewGoalDeadline(undefined);
                  }}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 overflow-y-auto flex-1">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewGoalCategory(cat)}
                        className={`mood-pill whitespace-nowrap ${
                          newGoalCategory === cat ? 'selected' : ''
                        }`}
                      >
                        <img src={categoryConfig[cat].iconImg} alt="" className="w-5 h-5 object-contain" style={{ filter: 'none' }} />
                        <span>{categoryConfig[cat].title}</span>
                      </button>
                    )
                  )}
                </div>

                <input
                  type="text"
                  autoFocus
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="What are you working towards?"
                  className="w-full p-4 rounded-2xl bg-muted border-0 mb-4 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />

                {/* Deadline picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-full p-3 rounded-2xl border border-border flex items-center gap-2 text-sm mb-4 hover:bg-muted transition-colors",
                        !newGoalDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon size={16} />
                      {newGoalDeadline ? format(newGoalDeadline, 'MMMM d, yyyy') : 'Set a timeframe (optional)'}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newGoalDeadline}
                      onSelect={setNewGoalDeadline}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="p-6 pt-2">
                <motion.button
                  onClick={handleAddGoal}
                  disabled={!newGoalTitle.trim()}
                  className={`soft-button w-full ${!newGoalTitle.trim() ? 'opacity-50' : ''}`}
                  whileTap={{ scale: 0.98 }}
                >
                  Add to my vision
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
