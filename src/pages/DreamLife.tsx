import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Check, Sparkles, ImagePlus, X, Loader2 } from 'lucide-react';
import briefcaseIcon from '@/assets/icons/briefcase.png';
import crownIcon from '@/assets/icons/crown.png';
import leafIcon from '@/assets/icons/leaf.png';
import doveIcon from '@/assets/icons/dove.png';
import sparklesIcon from '@/assets/icons/sparkles.png';
import twoHeartsIcon from '@/assets/icons/two-hearts.png';
import { toast } from 'sonner';

const dreamCategories = [
  {
    id: 'career',
    title: 'Career & Money',
    icon: '💼',
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
    icon: '👑',
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
    icon: '🌿',
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
    icon: '🕊️',
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
    icon: '✨',
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
    icon: '💕',
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
  const { updateProfile, profile } = useUserStore();
  const { user } = useAuth();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(profile.dreamImages || {});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const category = dreamCategories[currentCategory];
  const progress = ((currentCategory + 1) / dreamCategories.length) * 100;

  const handleSelect = (statement: string) => {
    const current = selections[category.id] || [];
    if (current.includes(statement)) {
      setSelections({
        ...selections,
        [category.id]: current.filter((s) => s !== statement),
      });
    } else {
      setSelections({
        ...selections,
        [category.id]: [...current, statement],
      });
    }
  };

  const isSelected = (statement: string) => {
    return (selections[category.id] || []).includes(statement);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${category.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vision-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vision-images')
        .getPublicUrl(filePath);

      setCategoryImages({
        ...categoryImages,
        [category.id]: publicUrl,
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async () => {
    if (!user) return;
    const currentUrl = categoryImages[category.id];
    
    // Try to delete from storage if it's a storage URL
    if (currentUrl && currentUrl.includes('vision-images')) {
      try {
        const pathMatch = currentUrl.split('vision-images/')[1];
        if (pathMatch) {
          await supabase.storage.from('vision-images').remove([pathMatch]);
        }
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
      }
    }

    const newImages = { ...categoryImages };
    delete newImages[category.id];
    setCategoryImages(newImages);
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
        dreamImages: categoryImages,
      });
      navigate('/choose-aesthetic');
    }
  };

  const hasSelections = (selections[category.id] || []).length > 0;
  const currentImage = categoryImages[category.id];

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

      {/* Header */}
      <div className="mb-6">
        <p className="subtle-text mb-1">Design your dream life</p>
        <h1 className="text-2xl font-display font-medium text-foreground">
          What kind of life are you building?
        </h1>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Category header */}
          <div className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h2 className="font-display text-lg font-medium text-foreground">
                {category.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Select statements that resonate
              </p>
            </div>
          </div>

          {/* Image upload section */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          
          {currentImage ? (
            <div className="relative mb-4 rounded-2xl overflow-hidden">
              <img
                src={currentImage}
                alt={`${category.title} vision`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full mb-4 py-4 rounded-2xl border-2 border-dashed border-primary/30 bg-glow/30 flex items-center justify-center gap-2 text-primary/70 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
              <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Add vision image'}</span>
            </button>
          )}

          {/* Statements */}
          <div className="space-y-3 flex-1">
            {category.statements.map((statement, index) => (
              <motion.button
                key={statement}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(statement)}
                className={`option-card w-full text-left flex items-center gap-3 ${
                  isSelected(statement) ? 'selected' : ''
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className={`check-circle flex-shrink-0 ${
                    isSelected(statement) ? 'checked' : ''
                  }`}
                >
                  {isSelected(statement) && <Check size={14} />}
                </div>
                <span className="text-sm font-medium">{statement}</span>
              </motion.button>
            ))}
          </div>

          {/* Category indicators */}
          <div className="flex justify-center gap-2 my-6">
            {dreamCategories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentCategory
                    ? 'bg-primary w-6'
                    : index < currentCategory
                    ? 'bg-primary/60'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Continue button */}
          <motion.button
            onClick={handleNext}
            className="soft-button w-full flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <span>
              {currentCategory === dreamCategories.length - 1
                ? 'Choose my aesthetic'
                : 'Next'}
            </span>
            <Sparkles size={18} />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
