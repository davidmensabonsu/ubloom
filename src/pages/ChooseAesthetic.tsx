import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import sparkleIcon from '@/assets/icons/sparkle-diamond.png';

const aesthetics = [
  {
    id: 'rose',
    name: 'Warm Rose',
    class: '',
    gradient: 'linear-gradient(135deg, hsl(344 40% 57%), hsl(344 55% 78%))',
  },
  {
    id: 'sage',
    name: 'Sage',
    class: 'theme-sage',
    gradient: 'linear-gradient(135deg, hsl(150 30% 35%), hsl(150 30% 63%))',
  },
  {
    id: 'sand',
    name: 'Sand',
    class: 'theme-sand',
    gradient: 'linear-gradient(135deg, hsl(25 55% 50%), hsl(25 55% 75%))',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    class: 'theme-lavender',
    gradient: 'linear-gradient(135deg, hsl(270 30% 48%), hsl(270 35% 73%))',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    class: 'theme-arctic',
    gradient: 'linear-gradient(135deg, hsl(210 35% 45%), hsl(210 35% 70%))',
  },
  {
    id: 'grey',
    name: 'Silver Mist',
    class: 'theme-grey',
    gradient: 'linear-gradient(135deg, hsl(0 0% 78%), hsl(36 9% 89%))',
  },
  {
    id: 'yellow',
    name: 'Golden Hour',
    class: 'theme-yellow',
    gradient: 'linear-gradient(135deg, hsl(40 100% 65%), hsl(44 100% 82%))',
  },
  {
    id: 'beige',
    name: 'Oat Milk',
    class: 'theme-beige',
    gradient: 'linear-gradient(135deg, hsl(33 27% 67%), hsl(37 46% 85%))',
  },
  {
    id: 'brown',
    name: 'Cocoa',
    class: 'theme-brown',
    gradient: 'linear-gradient(135deg, hsl(27 28% 52%), hsl(32 28% 72%))',
  },
  {
    id: 'cream',
    name: 'Cashmere',
    class: 'theme-cream',
    gradient: 'linear-gradient(135deg, hsl(33 49% 71%), hsl(31 63% 92%))',
  },
  {
    id: 'blue',
    name: 'Ocean Calm',
    class: 'theme-blue',
    gradient: 'linear-gradient(135deg, hsl(213 42% 30%), hsl(211 59% 78%))',
  },
  {
    id: 'purple',
    name: 'Moon Violet',
    class: 'theme-purple',
    gradient: 'linear-gradient(135deg, hsl(272 30% 55%), hsl(266 57% 87%))',
  },
  {
    id: 'green',
    name: 'Matcha',
    class: 'theme-green',
    gradient: 'linear-gradient(135deg, hsl(102 15% 51%), hsl(100 29% 86%))',
  },
  {
    id: 'pink',
    name: 'Ballet',
    class: 'theme-pink',
    gradient: 'linear-gradient(135deg, hsl(344 100% 78%), hsl(343 100% 92%))',
  },
  {
    id: 'orange',
    name: 'Apricot',
    class: 'theme-orange',
    gradient: 'linear-gradient(135deg, hsl(24 100% 62%), hsl(24 100% 85%))',
  },
];

export default function ChooseAesthetic() {
  const navigate = useNavigate();
  const { profile, setAesthetic, completeOnboarding } = useUserStore();

  useEffect(() => {
    aesthetics.forEach((a) => {
      if (a.class) document.documentElement.classList.remove(a.class);
    });
    const theme = aesthetics.find((a) => a.id === profile.aesthetic);
    if (theme?.class) document.documentElement.classList.add(theme.class);
  }, [profile.aesthetic]);

  const handleSelect = (id: string) => setAesthetic(id);

  const handleEnter = () => {
    completeOnboarding();
    navigate('/home');
  };

  return (
    <div className="min-h-screen gradient-background px-5 py-8 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="page-title mb-2">Choose Your Aesthetic</h1>
        <p className="subtle-text">This will color your entire uBloom experience</p>
      </div>

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
            <div className="absolute inset-0" style={{ background: aesthetic.gradient }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              <span className="text-base font-display font-medium text-white drop-shadow-md">
                {aesthetic.name}
              </span>
            </div>
            {profile.aesthetic === aesthetic.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <Check size={14} className="text-foreground" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={handleEnter}
        className="soft-button w-full mt-8 flex items-center justify-center gap-2"
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <img src={sparkleIcon} alt="" className="w-5 h-5 object-contain" style={{ filter: 'none' }} />
        <span>Enter my space</span>
      </motion.button>
    </div>
  );
}
