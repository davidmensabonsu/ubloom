import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LockedOverlayProps {
  children: React.ReactNode;
  locked: boolean;
  message?: string;
}

export default function LockedOverlay({ children, locked, message }: LockedOverlayProps) {
  const navigate = useNavigate();

  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.6 }}>
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/40 backdrop-blur-[2px] rounded-2xl"
      >
        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
          <Lock size={20} className="text-primary" />
        </div>
        <p className="text-sm text-foreground/80 text-center px-4 max-w-[220px]">
          {message || 'Unlock with uBloom Premium'}
        </p>
        <button
          onClick={() => navigate('/upgrade')}
          className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-md hover:opacity-90 transition-opacity"
        >
          Upgrade
        </button>
      </motion.div>
    </div>
  );
}
