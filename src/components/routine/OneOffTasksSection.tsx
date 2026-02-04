import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Check, Plus, X, ListTodo } from 'lucide-react';

export default function OneOffTasksSection() {
  const { profile, addRoutineTask, toggleTask } = useUserStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'glow' | 'wellness' | 'plans'>('plans');

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = profile.routineTasks.filter(
    (task) => task.date.split('T')[0] === today
  );

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

  const completedCount = todayTasks.filter((t) => t.completed).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListTodo size={18} className="text-primary" />
            <div>
              <h3 className="font-medium text-sm">Today's Tasks</h3>
              <p className="text-xs text-muted-foreground">One-time tasks for today</p>
            </div>
          </div>
          {todayTasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{todayTasks.length}
            </span>
          )}
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <motion.button
                key={task.id}
                onClick={() => toggleTask(task.id)}
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
                  {task.icon && `${task.icon} `}{task.title}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            No tasks for today. Tap + to add one.
          </p>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm">Add Task</span>
        </button>
      </motion.div>

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
                <h2 className="section-title">Add Task for Today</h2>
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
                placeholder="What would you like to do today?"
                className="w-full p-4 rounded-2xl bg-muted border-0 mb-4 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                autoFocus
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
    </>
  );
}