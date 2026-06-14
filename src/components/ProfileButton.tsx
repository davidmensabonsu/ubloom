import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProfileButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/home';
  return (
    <motion.button
      onClick={() => navigate('/profile')}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center hover:bg-primary/25 transition-all backdrop-blur-sm ring-0 hover:ring-1 focus:ring-1 focus:outline-none ring-primary/70 focus-visible:ring-1"
    >
      <User size={18} className={isHome ? 'text-primary' : 'text-white'} />
    </motion.button>
  );
}
