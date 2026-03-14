import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileButton() {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate('/profile')}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
    >
      <User size={18} className="text-primary" />
    </motion.button>
  );
}
