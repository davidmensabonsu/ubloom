import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { Heart, ArrowRight, Sparkles, Infinity, Flower2 } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function Welcome() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(profile.onboardingComplete ? '/home' : '/onboarding', { replace: true });
    }
  }, [user, loading, profile.onboardingComplete, navigate]);

  const handleStart = () => {
    if (user) {
      navigate(profile.onboardingComplete ? '/home' : '/onboarding');
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>);

  }

  if (user) return null;

  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-center px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-glow-strong/20 blur-3xl animate-pulse" />

      {/* Logo / Brand */}
      <div className="text-center mb-12">
        <img alt="uBloom logo" className="w-[160px] h-[160px] mx-auto mb-2 drop-shadow-lg object-contain clay-icon" src={logo} />
        <h1 className="text-5xl font-display tracking-tight text-foreground mb-2 font-extrabold">
          uBloom
        </h1>
        <p className="text-muted-foreground text-lg font-light">
          Become who you are meant to be
        </p>
      </div>

      {/* Tagline */}
      <div className="text-center mb-12 max-w-sm">
        <p className="font-display leading-relaxed text-foreground/80 font-extrabold text-2xl">
          A gentle space for reflection, alignment, and becoming your most radiant self
        </p>
      </div>

      {/* Features preview */}
      <div className="flex gap-8 mb-12">
        {[
        { icon: Sparkles, label: 'Reflect' },
        { icon: Infinity, label: 'Align' },
        { icon: Flower2, label: 'Bloom' }].
        map(({ icon: Icon, label }) =>
        <span key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icon size={16} className="text-primary" />
            {label}
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
      <p className="mt-8 text-xs text-muted-foreground">
        Made with love for women who dare to bloom
      </p>
    </div>);

}