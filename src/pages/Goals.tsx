import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Plus, Target, Briefcase, Heart, Plane, Sparkles, X, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const categoryConfig = {
  lifestyle: {
    icon: Sparkles,
    emoji: '✨',
    title: 'Lifestyle',
    color: 'text-amber-500',
    vision: 'A soft, beautiful life filled with intention and joy',
  },
  career: {
    icon: Briefcase,
    emoji: '💼',
    title: 'Career & Business',
    color: 'text-emerald-500',
    vision: 'Work that lights me up and creates abundance',
  },
  wellness: {
    icon: Heart,
    emoji: '🌿',
    title: 'Health & Wellness',
    color: 'text-rose-500',
    vision: 'A body that feels strong, nourished, and at peace',
  },
  travel: {
    icon: Plane,
    emoji: '✈️',
    title: 'Travel & Experiences',
    color: 'text-sky-500',
    vision: 'Adventures that expand my world and fill my soul',
  },
};

export default function Goals() {
  const { profile, addGoal } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<keyof typeof categoryConfig>('lifestyle');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      addGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        completed: false,
        vision: categoryConfig[newGoalCategory].vision,
      });
      setNewGoalTitle('');
      setShowAddModal(false);
    }
  };

  const groupedGoals = profile.goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = [];
    }
    acc[goal.category].push(goal);
    return acc;
  }, {} as Record<string, typeof profile.goals>);

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Your Vision
        </motion.h1>
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
            const Icon = config.icon;
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
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category)
                  }
                  className="w-full p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-glow flex items-center justify-center">
                    <span className="text-2xl">{config.emoji}</span>
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
                        {/* Vision statement */}
                        <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                          "{config.vision}"
                        </p>

                        {/* Goals list */}
                        {goals.length > 0 ? (
                          goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                            >
                              <div
                                className={`check-circle ${
                                  goal.completed ? 'checked' : ''
                                }`}
                              >
                                {goal.completed && <Check size={14} />}
                              </div>
                              <span
                                className={`text-sm ${
                                  goal.completed
                                    ? 'line-through text-muted-foreground'
                                    : ''
                                }`}
                              >
                                {goal.title}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No goals yet. Tap + to add one.
                          </p>
                        )}

                        {/* Add goal button */}
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
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background rounded-t-3xl shadow-elevated max-h-[80vh] flex flex-col"
            >
              <div className="p-6 pb-0 flex items-center justify-between mb-4">
                <h2 className="section-title">Add New Goal</h2>
                <button
                  onClick={() => setShowAddModal(false)}
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
                        {categoryConfig[cat].emoji}
                        <span>{categoryConfig[cat].title}</span>
                      </button>
                    )
                  )}
                </div>

                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="What are you working towards?"
                  className="w-full p-4 rounded-2xl bg-muted border-0 mb-4 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              <div className="p-6 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <button
                  onClick={handleAddGoal}
                  disabled={!newGoalTitle.trim()}
                  className={`soft-button w-full flex items-center justify-center gap-2 ${
                    !newGoalTitle.trim() ? 'opacity-50' : ''
                  }`}
                >
                  <Target size={18} />
                  <span>Add Goal</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
