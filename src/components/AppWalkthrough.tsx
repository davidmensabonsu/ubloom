import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Home, Compass, Calendar, Search, Heart, ArrowRight, Check } from 'lucide-react';
import ubloomFlower from '@/assets/ubloom-flower.png';

const walkthroughSteps = [
  {
    route: '/home',
    icon: Home,
    title: 'Home',
    headline: 'Your daily launchpad',
    description:
      "This is where your day begins. You'll find personalised affirmations, your daily focus, and a snapshot of how you're doing. Think of it as your morning mirror — honest, warm, and always rooting for you.",
  },
  {
    route: '/routine',
    icon: Calendar,
    title: 'Routine',
    headline: 'Build the life you want, one habit at a time',
    description:
      "Track your morning, midday, and evening rituals. Set custom habits, see your weekly streaks, and celebrate small wins. Consistency isn't about perfection — it's about showing up.",
  },
  {
    route: '/ubi',
    icon: Heart,
    title: 'Ubi',
    headline: 'Your personal growth companion',
    description:
      "Ubi is your AI companion who truly listens. Share what's on your mind, explore your feelings, or ask for guidance. Every conversation is private, judgment-free, and tailored to your journey.",
  },
  {
    route: '/alignment',
    icon: Compass,
    title: 'Reflect',
    headline: 'Pause. Feel. Grow.',
    description:
      "Journal your thoughts, track your emotional patterns over time, and receive messages from your future self. This space is yours — no rules, no performance, just honest reflection.",
  },
  {
    route: '/wander',
    icon: Search,
    title: 'Wander',
    headline: 'Explore what nourishes you',
    description:
      "Discover curated books, podcasts, fitness routines, recipes, and self-care practices. Everything here is chosen to support your mental, physical, and emotional wellbeing.",
  },
];

export default function AppWalkthrough() {
  const navigate = useNavigate();
  const { updateProfile } = useUserStore();
  const [currentStep, setCurrentStep] = useState(0);

  const step = walkthroughSteps[currentStep];
  const isLast = currentStep === walkthroughSteps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLast) {
      updateProfile({ walkthroughComplete: true });
      navigate('/home');
    } else {
      const nextStep = walkthroughSteps[currentStep + 1];
      navigate(nextStep.route);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    updateProfile({ walkthroughComplete: true });
    navigate('/home');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none"
    >
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }}
          className="relative z-10 w-full max-w-md mx-4 mb-24 pointer-events-auto"
        >
          <div className="glass-card rounded-3xl p-6 shadow-2xl border border-primary/20">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={ubloomFlower} alt="ubloom" className="w-10 h-10 clay-icon" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-5">
              {walkthroughSteps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-primary'
                      : i < currentStep
                      ? 'w-1.5 bg-primary/50'
                      : 'w-1.5 bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>

            {/* Icon + Title */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon size={20} className="text-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{step.title}</p>
                <h2 className="font-display text-lg font-semibold text-foreground">{step.headline}</h2>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-sm text-foreground/75 leading-relaxed mb-5"
            >
              {step.description}
            </motion.p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <motion.button
                onClick={handleNext}
                className="soft-button flex-1 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {isLast ? (
                  <>
                    <span>Let's begin</span>
                    <Check size={16} />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </div>

            {/* Step counter */}
            <p className="text-center text-xs text-muted-foreground/50 mt-3">
              {currentStep + 1} of {walkthroughSteps.length}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
