import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: number; // 1 = forward, -1 = back
}

export default function PageTransition({ children, direction = 1 }: PageTransitionProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
