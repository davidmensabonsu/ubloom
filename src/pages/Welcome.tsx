import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { Heart, ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Welcome() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate(profile.onboardingComplete ? '/home' : '/onboarding');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8"
      style={{ backgroundColor: '#faf5f3' }}
    >
      {/* Flower logo */}
      <motion.img
        src={logo}
        alt="ubloom"
        className="w-32 h-32 object-contain mb-16"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* CTA Button */}
      <motion.button
        onClick={handleStart}
        className="soft-button flex items-center gap-2 text-lg px-8 py-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Heart size={20} className="fill-current" />
        <span>{profile.onboardingComplete ? 'Enter my space' : 'Begin your journey'}</span>
        <ArrowRight size={18} />
      </motion.button>
    </div>
  );
}
