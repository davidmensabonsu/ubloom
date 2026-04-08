import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useNavigate } from 'react-router-dom';
import { getLocalDateStr } from '@/lib/dateUtils';
import { track } from '@/hooks/useAnalytics';
import cloudIcon from '@/assets/icons/cloud.png';
import spiralIcon from '@/assets/icons/spiral.png';
import plantIcon from '@/assets/icons/plant.png';
import starIcon from '@/assets/icons/star.png';
import sparklesIcon from '@/assets/icons/sparkles.png';

const checkinStates = [
  {
    value: 'disconnected',
    label: 'Disconnected',
    icon: cloudIcon,
    response: "It's okay to feel distant sometimes. Today is a chance to gently reconnect with yourself — one small moment at a time.",
  },
  {
    value: 'off-track',
    label: 'Off track',
    icon: spiralIcon,
    response: "You're aware of where you are, and that awareness is powerful. Let today be about one small step back toward you.",
  },
  {
    value: 'grounded',
    label: 'Grounded',
    icon: plantIcon,
    response: "You're rooted and steady — what a beautiful place to be. Let's build on this energy today.",
  },
  {
    value: 'aligned',
    label: 'Aligned',
    icon: starIcon,
    response: "You're in sync with who you're becoming. Trust this feeling and let it guide your choices today.",
  },
  {
    value: 'elevated',
    label: 'Elevated',
    icon: sparklesIcon,
    response: "You're radiating. This energy is magnetic — carry it with you and let it touch everything you do today.",
  },
];

export default function DailyMoodCheckin() {
  const { addMoodEntry, updateProfile } = useUserStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof checkinStates[0] | null>(null);

  const handleSelect = (state: typeof checkinStates[0]) => {
    setSelected(state);
    addMoodEntry([state.value]);
    updateProfile({
      lastMoodCheckinDate: getLocalDateStr(),
      dailyCheckinState: state.value,
    });
    track('mood_checkin', { mood: state.value, date: getLocalDateStr() });

    setTimeout(() => {
      navigate('/home', { replace: true });
    }, 2500);
  };

  const handleContinue = () => {
    navigate('/home', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 overflow-y-auto"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--glow) / 0.5) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 100%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 10% 80%, hsl(var(--accent) / 0.12) 0%, transparent 50%),
          hsl(var(--background))
        `,
      }}
    >
      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md flex flex-col items-center py-8"
          >
            {/* Logo */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-semibold tracking-wide text-primary mb-6"
            >
              uBloom
            </motion.p>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-serif text-foreground text-center mb-8"
            >
              How are you feeling today?
            </motion.h1>

            {/* 5 State Cards */}
            <div className="w-full flex flex-col gap-3">
              {checkinStates.map((state, i) => (
                <motion.button
                  key={state.value}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  onClick={() => handleSelect(state)}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.98]"
                  whileTap={{ scale: 0.97 }}
                >
                  <img
                    src={state.icon}
                    alt=""
                    className="w-10 h-10 object-contain clay-icon"
                  />
                  <span className="text-base font-medium text-foreground">
                    {state.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="response"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md flex flex-col items-center text-center px-4"
            onClick={handleContinue}
          >
            <motion.img
              src={selected.icon}
              alt=""
              className="w-16 h-16 object-contain clay-icon mb-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-serif text-foreground leading-relaxed mb-8"
            >
              {selected.response}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="text-xs text-muted-foreground"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
