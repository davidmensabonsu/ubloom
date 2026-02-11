import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: number; // 1 = forward, -1 = back
}

export default function PageTransition({ children, direction = 1 }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -30 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
