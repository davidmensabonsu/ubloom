import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const dreamCategories = [
  {
    id: 'career',
    title: 'Career & Money',
    
    statements: [
      'I earn abundantly doing work I love',
      'I am recognized for my talents and contribution',
      'Financial freedom is my reality',
      'I lead with confidence and vision',
      'My work creates real impact in the world',
    ],
  },
  {
    id: 'selfWorth',
    title: 'Self-Worth & Confidence',
    
    statements: [
      'I know my worth and never settle for less',
      'I speak up and take up space unapologetically',
      'I trust my intuition completely',
      'I am enough exactly as I am',
      'I celebrate my wins, big and small',
    ],
  },
  {
    id: 'wellness',
    title: 'Wellness & Body',
    
    statements: [
      'I nourish my body with love and care',
      'Movement is a joy, not a punishment',
      'I listen to what my body needs',
      'I feel strong, vibrant, and energized',
      'Rest is sacred and I honor it',
    ],
  },
  {
    id: 'peace',
    title: 'Peace & Emotional Life',
    
    statements: [
      'I am calm even when life is chaotic',
      'I process my emotions with grace',
      'Anxiety no longer controls me',
      'I choose peace in every moment',
      'I feel safe in my own mind and heart',
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Experiences',
    
    statements: [
      'I live a soft, beautiful life',
      'Travel and adventure are part of my story',
      'I surround myself with beauty and intention',
      'My home is a sanctuary of peace',
      'I say yes to joy and pleasure',
    ],
  },
  {
    id: 'love',
    title: 'Love & Relationships',
    
    statements: [
      'I give and receive love freely',
      'My relationships are healthy and nourishing',
      'I attract people who honor and celebrate me',
      'I am deeply connected to my loved ones',
      'Romance and passion flow naturally into my life',
    ],
  },
];

export default function DreamLife() {
  const navigate = useNavigate();
  const { updateProfile } = useUserStore();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const category = dreamCategories[currentCategory];
  const progress = ((currentCategory + 1) / dreamCategories.length) * 100;

  const MAX_PER_CATEGORY = 2;

  const handleSelect = (statement: string) => {
    const current = selections[category.id] || [];
    if (current.includes(statement)) {
      setSelections({
        ...selections,
        [category.id]: current.filter((s) => s !== statement),
      });
    } else if (current.length < MAX_PER_CATEGORY) {
      setSelections({
        ...selections,
        [category.id]: [...current, statement],
      });
    }
  };

  const isSelected = (statement: string) => {
    return (selections[category.id] || []).includes(statement);
  };

  const handleNext = () => {
    if (currentCategory < dreamCategories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      updateProfile({
        dreamSelf: {
          career: selections.career || [],
          selfWorth: selections.selfWorth || [],
          wellness: selections.wellness || [],
          peace: selections.peace || [],
          lifestyle: selections.lifestyle || [],
          love: selections.love || [],
        },
      });
      navigate('/choose-aesthetic');
    }
  };

  const handleBack = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  return (
    <div className="min-h-screen gradient-background px-5 py-8 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Back button */}
      {currentCategory > 0 && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-muted-foreground mb-6 -ml-1"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Question */}
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground mb-2">
            {category.title}
          </h1>
          <p className="subtle-text mb-8 text-sm">Choose up to 2 that resonate most</p>

          {/* Statements */}
          <div className="space-y-3 flex-1">
            {category.statements.map((statement) => (
              <motion.button
                key={statement}
                onClick={() => handleSelect(statement)}
                className={`option-card w-full text-left flex items-center gap-3 ${
                  isSelected(statement) ? 'selected' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium">{statement}</span>
              </motion.button>
            ))}
          </div>

          {/* Continue button */}
          <motion.button
            onClick={handleNext}
            className="soft-button w-full mt-6 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span>
              {currentCategory === dreamCategories.length - 1
                ? 'Choose my aesthetic'
                : 'Next'}
            </span>
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
