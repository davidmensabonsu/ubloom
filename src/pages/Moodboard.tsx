import { motion } from 'framer-motion';
import { Plus, Image, Quote, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useUserStore } from '@/stores/userStore';

const dreamCategoryLabels: Record<string, { title: string; icon: string }> = {
  career: { title: 'Career & Money', icon: '💼' },
  selfWorth: { title: 'Self-Worth', icon: '👑' },
  wellness: { title: 'Wellness', icon: '🌿' },
  peace: { title: 'Peace', icon: '🕊️' },
  lifestyle: { title: 'Lifestyle', icon: '✨' },
  love: { title: 'Love', icon: '💕' },
};

export default function Moodboard() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const dreamImages = profile.dreamImages || {};
  
  const hasAnyDreamImages = Object.values(dreamImages).some(img => img);
  const dreamImageEntries = Object.entries(dreamImages).filter(([_, img]) => img);

  return (
    <div className="min-h-screen gradient-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title"
        >
          Your Moodboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="subtle-text mt-1"
        >
          A visual space to manifest your dreams
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-5">
        {/* Dream Life Gallery */}
        {hasAnyDreamImages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-primary" />
              <h3 className="section-title">Your Dream Vision</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {dreamImageEntries.map(([categoryId, imageUrl], index) => {
                const category = dreamCategoryLabels[categoryId];
                return (
                  <motion.div
                    key={categoryId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={`${category?.title || categoryId} vision`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{category?.icon}</span>
                        <span className="text-xs font-medium text-white/90">
                          {category?.title || categoryId}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <button
              onClick={() => navigate('/dream-life')}
              className="w-full mt-3 py-2.5 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-glow transition-colors"
            >
              Edit dream images
            </button>
          </motion.div>
        )}

        {/* Empty state / Add content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasAnyDreamImages ? 0.3 : 0.2 }}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-glow flex items-center justify-center mx-auto mb-4">
            <Image size={28} className="text-primary" />
          </div>
          <h2 className="section-title mb-2">
            {hasAnyDreamImages ? 'Add More Inspiration' : 'Start Your Moodboard'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            {hasAnyDreamImages 
              ? 'Continue collecting images and quotes that fuel your vision'
              : 'Collect images, quotes, and inspiration that represent the life you\'re creating'
            }
          </p>
          
          <div className="flex flex-col gap-3">
            <button className="soft-button flex items-center justify-center gap-2">
              <Image size={18} />
              <span>Add Image</span>
            </button>
            <button className="w-full py-3 px-6 rounded-full border border-primary/30 text-primary font-medium flex items-center justify-center gap-2 transition-colors hover:bg-glow">
              <Quote size={18} />
              <span>Add Quote</span>
            </button>
            {!hasAnyDreamImages && (
              <button 
                onClick={() => navigate('/dream-life')}
                className="w-full py-3 px-6 rounded-full bg-muted text-foreground font-medium flex items-center justify-center gap-2 transition-colors hover:bg-muted/80"
              >
                <Sparkles size={18} />
                <span>Add Dream Vision Images</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Board categories preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasAnyDreamImages ? 0.4 : 0.3 }}
          className="mt-6"
        >
          <h3 className="section-title mb-4">Create Boards</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Soft Life', 'Travel Dreams', 'Body Goals', 'Love & Romance', 'Career Vision', 'Home Sanctuary'].map(
              (board, index) => (
                <motion.button
                  key={board}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (hasAnyDreamImages ? 0.4 : 0.3) + index * 0.05 }}
                  className="aspect-square rounded-2xl bg-muted/50 border border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 hover:bg-glow transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={20} className="text-primary/50" />
                  <span className="text-sm text-muted-foreground">{board}</span>
                </motion.button>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="floating-action"
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Plus size={24} />
      </motion.button>

      <BottomNav />
    </div>
  );
}
