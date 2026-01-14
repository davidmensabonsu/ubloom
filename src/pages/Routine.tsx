import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Plus, Check, Sparkles, Flower2, Dumbbell, Calendar, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const defaultTasks = {
  glow: [
    { title: 'Morning skincare routine', icon: '🌸' },
    { title: 'Drink water', icon: '💧' },
    { title: '10 minutes of movement', icon: '🧘‍♀️' },
    { title: 'Evening wind-down', icon: '🌙' },
  ],
  wellness: [
    { title: 'Take vitamins', icon: '💊' },
    { title: 'Healthy meal prep', icon: '🥗' },
    { title: '8 hours of sleep', icon: '😴' },
  ],
  plans: [
    { title: 'Review today\'s priorities', icon: '📋' },
    { title: 'One thing that brings joy', icon: '✨' },
  ],
};

export default function Routine() {
  const { profile, addRoutineTask, toggleTask } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'glow' | 'wellness' | 'plans'>('glow');

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = profile.routineTasks.filter(
    (task) => task.date.split('T')[0] === today
  );

  const glowTasks = todayTasks.filter((t) => t.category === 'glow');
  const wellnessTasks = todayTasks.filter((t) => t.category === 'wellness');
  const planTasks = todayTasks.filter((t) => t.category === 'plans');

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addRoutineTask({
        title: newTaskTitle,
        category: newTaskCategory,
        completed: false,
        date: new Date().toISOString(),
      });
      setNewTaskTitle('');
      setShowAddModal(false);
    }
  };

  const currentMood = profile.moodHistory[0]?.moods[0] || 'peaceful';

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground mb-1"
        >
          {todayFormatted}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Your Routine
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mt-2"
        >
          <span className="text-sm text-muted-foreground">Feeling</span>
          <span className="mood-pill selected text-xs">{currentMood}</span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-5 space-y-6">
        {/* Daily Glow */}
        <TaskSection
          title="Daily Glow"
          subtitle="Core self-care rituals"
          icon={<Flower2 size={18} className="text-primary" />}
          tasks={glowTasks.length > 0 ? glowTasks : []}
          defaultTasks={defaultTasks.glow}
          onToggle={toggleTask}
          onAddDefault={(task) => {
            addRoutineTask({
              title: task.title,
              category: 'glow',
              completed: false,
              date: new Date().toISOString(),
              icon: task.icon,
            });
          }}
        />

        {/* Wellness Goals */}
        <TaskSection
          title="Wellness Goals"
          subtitle="Health and body care"
          icon={<Dumbbell size={18} className="text-primary" />}
          tasks={wellnessTasks.length > 0 ? wellnessTasks : []}
          defaultTasks={defaultTasks.wellness}
          onToggle={toggleTask}
          onAddDefault={(task) => {
            addRoutineTask({
              title: task.title,
              category: 'wellness',
              completed: false,
              date: new Date().toISOString(),
              icon: task.icon,
            });
          }}
        />

        {/* Today's Plans */}
        <TaskSection
          title="Today's Plans"
          subtitle="Work, social and life"
          icon={<Calendar size={18} className="text-primary" />}
          tasks={planTasks.length > 0 ? planTasks : []}
          defaultTasks={defaultTasks.plans}
          onToggle={toggleTask}
          onAddDefault={(task) => {
            addRoutineTask({
              title: task.title,
              category: 'plans',
              completed: false,
              date: new Date().toISOString(),
              icon: task.icon,
            });
          }}
        />
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

      {/* Add Task Modal */}
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
              className="w-full bg-background rounded-t-3xl p-6 shadow-elevated"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Add New Task</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What would you like to do?"
                className="w-full p-4 rounded-2xl bg-muted border-0 mb-4 focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />

              <div className="flex gap-2 mb-6">
                {(['glow', 'wellness', 'plans'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewTaskCategory(cat)}
                    className={`mood-pill ${newTaskCategory === cat ? 'selected' : ''}`}
                  >
                    {cat === 'glow' && '🌸'}
                    {cat === 'wellness' && '💪'}
                    {cat === 'plans' && '📋'}
                    <span className="capitalize">{cat}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className={`soft-button w-full flex items-center justify-center gap-2 ${
                  !newTaskTitle.trim() ? 'opacity-50' : ''
                }`}
              >
                <Plus size={18} />
                <span>Add Task</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function TaskSection({
  title,
  subtitle,
  icon,
  tasks,
  defaultTasks,
  onToggle,
  onAddDefault,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tasks: any[];
  defaultTasks: { title: string; icon: string }[];
  onToggle: (id: string) => void;
  onAddDefault: (task: { title: string; icon: string }) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(tasks.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="section-title text-base">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {tasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {tasks.filter((t) => t.completed).length}/{tasks.length}
          </span>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <motion.button
              key={task.id}
              onClick={() => onToggle(task.id)}
              className="check-item w-full"
              whileTap={{ scale: 0.98 }}
            >
              <div className={`check-circle ${task.completed ? 'checked' : ''}`}>
                {task.completed && <Check size={14} />}
              </div>
              <span
                className={`text-sm ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.icon} {task.title}
              </span>
            </motion.button>
          ))}
        </div>
      ) : showSuggestions ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            Tap to add to your routine:
          </p>
          {defaultTasks.map((task, index) => (
            <motion.button
              key={task.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onAddDefault(task)}
              className="check-item w-full opacity-60 hover:opacity-100"
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} className="text-primary" />
              <span className="text-sm">
                {task.icon} {task.title}
              </span>
            </motion.button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setShowSuggestions(true)}
          className="text-sm text-primary flex items-center gap-1"
        >
          <Plus size={14} />
          Add suggestions
        </button>
      )}
    </motion.div>
  );
}
