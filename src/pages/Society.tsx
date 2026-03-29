import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Users, Sparkles, Star } from 'lucide-react';
import ubloomLogo from '@/assets/ubloom-flower.png';

export default function Society() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-40 right-5 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="relative z-10 px-6 pt-14 pb-20 max-w-lg mx-auto flex flex-col items-center text-center min-h-screen">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="absolute top-6 left-5 w-10 h-10 rounded-full bg-muted/60 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-foreground" />
        </motion.button>

        {/* Logo area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 mb-8"
        >
          <img src={ubloomLogo} alt="uBloom" className="w-20 h-20 object-contain mx-auto mb-4 clay-icon drop-shadow-lg" />
          <h1 className="text-3xl font-display font-semibold text-foreground tracking-tight">
            uBloom Society
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles size={12} />
            Coming Soon
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 mb-12"
        >
          <p className="text-base text-foreground/80 leading-relaxed">
            A private, intention-led community for women who are actively designing the life they want to live — not just dreaming about it.
          </p>

          <div className="glass-card rounded-2xl p-5 text-left space-y-4">
            {[
              { icon: Heart, text: 'Weekly circles for reflection, accountability, and real connection' },
              { icon: Star, text: 'Exclusive workshops on mindset, habits, and personal growth' },
              { icon: Users, text: 'A curated space of like-minded women supporting each other' },
              { icon: Sparkles, text: 'Early access to new uBloom features and content' },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={14} className="text-primary" />
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground italic leading-relaxed">
            Your growth is personal, but it doesn't have to be lonely. The uBloom Society is where your journey meets community.
          </p>
        </motion.div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/home')}
          className="w-full max-w-xs rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-medium transition-all active:scale-[0.98] mb-6"
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}
