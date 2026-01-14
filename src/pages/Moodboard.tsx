import { motion } from 'framer-motion';
import { Plus, Image, Quote } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function Moodboard() {
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
        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-glow flex items-center justify-center mx-auto mb-4">
            <Image size={28} className="text-primary" />
          </div>
          <h2 className="section-title mb-2">Start Your Moodboard</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Collect images, quotes, and inspiration that represent the life you're creating
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
          </div>
        </motion.div>

        {/* Board categories preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.3 + index * 0.05 }}
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
