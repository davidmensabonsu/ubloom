import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Check, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

const aesthetics = [
  {
    id: 'blush',
    name: 'Blush Pink',
    class: '',
    preview: 'bg-gradient-to-br from-rose-100 to-pink-200',
    accent: 'bg-rose-300',
  },
  {
    id: 'beige',
    name: 'Warm Beige',
    class: 'theme-beige',
    preview: 'bg-gradient-to-br from-amber-50 to-orange-100',
    accent: 'bg-amber-300',
  },
  {
    id: 'sage',
    name: 'Sage Green',
    class: 'theme-sage',
    preview: 'bg-gradient-to-br from-green-50 to-emerald-100',
    accent: 'bg-emerald-300',
  },
  {
    id: 'lilac',
    name: 'Lilac',
    class: 'theme-lilac',
    preview: 'bg-gradient-to-br from-purple-50 to-violet-100',
    accent: 'bg-violet-300',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    class: 'theme-sky',
    preview: 'bg-gradient-to-br from-sky-50 to-blue-100',
    accent: 'bg-sky-400',
  },
  {
    id: 'coral',
    name: 'Coral',
    class: 'theme-coral',
    preview: 'bg-gradient-to-br from-orange-50 to-red-100',
    accent: 'bg-orange-400',
  },
  {
    id: 'teal',
    name: 'Teal',
    class: 'theme-teal',
    preview: 'bg-gradient-to-br from-teal-50 to-cyan-100',
    accent: 'bg-teal-400',
  },
  {
    id: 'mocha',
    name: 'Mocha',
    class: 'theme-mocha',
    preview: 'bg-gradient-to-br from-stone-100 to-amber-100',
    accent: 'bg-amber-600',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    class: 'theme-midnight',
    preview: 'bg-gradient-to-br from-indigo-50 to-blue-100',
    accent: 'bg-indigo-400',
  },
  {
    id: 'peach',
    name: 'Peach',
    class: 'theme-peach',
    preview: 'bg-gradient-to-br from-orange-50 to-rose-100',
    accent: 'bg-orange-300',
  },
  {
    id: 'mauve',
    name: 'Mauve',
    class: 'theme-mauve',
    preview: 'bg-gradient-to-br from-pink-50 to-fuchsia-100',
    accent: 'bg-fuchsia-300',
  },
  {
    id: 'grey',
    name: 'Soft Grey',
    class: 'theme-grey',
    preview: 'bg-gradient-to-br from-slate-50 to-gray-100',
    accent: 'bg-slate-400',
  },
];

export default function ChooseAesthetic() {
  const navigate = useNavigate();
  const { profile, setAesthetic, completeOnboarding } = useUserStore();

  // Apply theme class to document
  useEffect(() => {
    const theme = aesthetics.find((a) => a.id === profile.aesthetic);
    if (theme) {
      // Remove all theme classes first
      aesthetics.forEach((a) => {
        if (a.class) {
          document.documentElement.classList.remove(a.class);
        }
      });
      // Add the selected theme class
      if (theme.class) {
        document.documentElement.classList.add(theme.class);
      }
    }
  }, [profile.aesthetic]);

  const handleSelect = (id: string) => {
    setAesthetic(id);
  };

  const handleEnter = () => {
    completeOnboarding();
    navigate('/home');
  };

  return (
    <div className="min-h-screen gradient-background px-5 py-8 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="page-title mb-2">Choose Your Aesthetic</h1>
        <p className="subtle-text">
          This will color your entire ubloom experience
        </p>
      </div>

      {/* Aesthetic grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {aesthetics.map((aesthetic, index) => (
          <motion.button
            key={aesthetic.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleSelect(aesthetic.id)}
            className={`relative rounded-2xl overflow-hidden aspect-[4/5] transition-all duration-300 ${
              profile.aesthetic === aesthetic.id
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`absolute inset-0 ${aesthetic.preview}`} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <div
                className={`w-12 h-12 rounded-full ${aesthetic.accent} mb-3 shadow-lg`}
              />
              <span className="text-sm font-medium text-foreground/80">
                {aesthetic.name}
              </span>
            </div>
            {profile.aesthetic === aesthetic.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
              >
                <Check size={14} className="text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Enter button */}
      <motion.button
        onClick={handleEnter}
        className="soft-button w-full mt-8 flex items-center justify-center gap-2"
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Sparkles size={18} />
        <span>Enter my space</span>
      </motion.button>
    </div>
  );
}
