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
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-glow-strong/20 blur-3xl animate-pulse" />

      {/* Logo / Brand */}
      <div className="text-center mb-12">
        <img alt="ubloom logo" className="w-[264px] h-[264px] object-contain mx-auto mb-6 drop-shadow-lg saturate-150 brightness-105" src="/lovable-uploads/2c6d36d2-be89-4057-b082-e50ce488d2bd.png" />
        <h1 className="text-5xl font-display font-light tracking-tight text-foreground mb-2">
          ubloom
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          Become who you are meant to be
        </p>
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 max-w-sm">
        <p className="font-display text-xl leading-relaxed text-foreground/80">
          A gentle space for reflection, alignment, and becoming your most radiant self
        </p>
      </div>

      {/* Features preview */}
      <div className="flex gap-6 mb-12">
        {['✨ Reflect', '🌸 Align', '💫 Bloom'].map((feature) =>
        <span key={feature} className="text-sm text-muted-foreground">
            {feature}
          </span>
        )}
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={handleStart}
        className="soft-button flex items-center gap-2 text-lg px-8 py-4"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}>
        
        <Heart size={20} className="fill-current" />
        <span>{profile.onboardingComplete ? 'Enter my space' : 'Begin your journey'}</span>
        <ArrowRight size={18} />
      </motion.button>

      {/* Footer note */}
      <p className="absolute bottom-8 text-xs text-muted-foreground">
        Made with love for women who dare to bloom
      </p>
    </div>);

}