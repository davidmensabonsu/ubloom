import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ubloomFlower from '@/assets/ubloom-flower.png';
import { onboardingIcons } from '@/lib/moodIcons';

const onboardingSteps = [
{
  id: 'feeling',
  question: "How do you feel about your life right now?",
  subtitle: "Be honest with yourself, there is no wrong answer here.",
  type: 'single',
  options: [
  { value: 'thriving', label: "I feel like I am thriving" },
  { value: 'content', label: "Content, but I know there is more" },
  { value: 'stuck', label: "A little stuck or disconnected" },
  { value: 'overwhelmed', label: "Overwhelmed and unsure" },
  { value: 'rebuilding', label: "Rebuilding from something hard" }]

},
{
  id: 'struggles',
  question: "What do you struggle with most?",
  subtitle: "Select all that resonate with you.",
  type: 'multi',
  options: [
  { value: 'consistency', label: 'Staying consistent with self-care' },
  { value: 'boundaries', label: 'Setting boundaries' },
  { value: 'confidence', label: 'Believing in myself' },
  { value: 'anxiety', label: 'Managing anxiety or stress' },
  { value: 'direction', label: 'Knowing what I truly want' },
  { value: 'energy', label: 'Having enough energy' },
  { value: 'comparison', label: 'Comparing myself to others' },
  { value: 'balance', label: 'Work-life balance' }]

},
{
  id: 'reaction',
  question: "How do you react when things do not go to plan?",
  subtitle: "Understanding your patterns helps us support you better.",
  type: 'single',
  options: [
  { value: 'adapt', label: "I adapt and find a new way" },
  { value: 'shutdown', label: "I tend to shut down" },
  { value: 'overthink', label: "I spiral and overthink" },
  { value: 'push', label: "I push through no matter what" },
  { value: 'avoid', label: "I avoid and distract myself" }]

},
{
  id: 'wantsMore',
  question: "What do you want more of right now?",
  subtitle: "Choose up to 3 that feel most important.",
  type: 'multi',
  max: 3,
  options: [
  { value: 'peace', label: 'Inner peace' },
  { value: 'joy', label: 'Joy and playfulness' },
  { value: 'confidence', label: 'Confidence' },
  { value: 'clarity', label: 'Clarity and direction' },
  { value: 'love', label: 'Love and connection' },
  { value: 'success', label: 'Success and abundance' },
  { value: 'health', label: 'Health and vitality' },
  { value: 'freedom', label: 'Freedom and adventure' }]

},
{
  id: 'dreamFeels',
  question: "How does your dream self feel?",
  subtitle: "Imagine her, fully aligned and radiant.",
  type: 'multi',
  options: [
  { value: 'grounded', label: 'Grounded' },
  { value: 'magnetic', label: 'Magnetic' },
  { value: 'peaceful', label: 'At peace' },
  { value: 'confident', label: 'Deeply confident' },
  { value: 'joyful', label: 'Joyful' },
  { value: 'loved', label: 'Loved and cherished' },
  { value: 'free', label: 'Free' },
  { value: 'abundant', label: 'Abundant' }]

},
{
  id: 'identity',
  question: "Which statement sounds most like you?",
  subtitle: "Choose the one that resonates most deeply.",
  type: 'single',
  options: [
  { value: 'healer', label: "I am healing from my past and becoming whole" },
  { value: 'dreamer', label: "I am chasing big dreams and building something beautiful" },
  { value: 'nurturer', label: "I am learning to pour into myself the way I pour into others" },
  { value: 'transformer', label: "I am in a season of complete transformation" },
  { value: 'seeker', label: "I am searching for meaning and my true path" }]

},
{
  id: 'futureNote',
  question: "Is there anything you want your future self to know?",
  subtitle: "Write a note, a wish, a reminder — anything from your heart.",
  type: 'text'
}];


export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useUserStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textValue, setTextValue] = useState('');

  const step = onboardingSteps[currentStep];
  const progress = (currentStep + 1) / onboardingSteps.length * 100;

  const handleSelect = (value: string) => {
    if (step.type === 'single') {
      setAnswers({ ...answers, [step.id]: value });
    } else if (step.type === 'multi') {
      const current = answers[step.id] as string[] || [];
      const max = (step as any).max || Infinity;

      if (current.includes(value)) {
        setAnswers({ ...answers, [step.id]: current.filter((v) => v !== value) });
      } else if (current.length < max) {
        setAnswers({ ...answers, [step.id]: [...current, value] });
      }
    }
  };

  const isSelected = (value: string) => {
    const answer = answers[step.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const canContinue = () => {
    if (step.type === 'text') return true;
    const answer = answers[step.id];
    if (step.type === 'single') return !!answer;
    if (step.type === 'multi') return Array.isArray(answer) && answer.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step.type === 'text') {
      setAnswers({ ...answers, [step.id]: textValue });
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      updateProfile({
        currentFeeling: answers.feeling as string,
        struggles: answers.struggles as string[],
        reactionStyle: answers.reaction as string,
        wantsMoreOf: answers.wantsMore as string[],
        dreamSelfFeels: answers.dreamFeels as string[],
        identityStatement: answers.identity as string,
        futureNote: step.type === 'text' ? textValue : answers.futureNote as string
      });
      navigate('/dream-life');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          transition={{ duration: 0.3 }} />
        
      </div>

      {/* Back button */}
      {currentStep > 0 &&
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-muted-foreground mb-6 -ml-1">
        
          <ChevronLeft size={20} />
          <span className="text-sm">Back</span>
        </button>
      }

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col">
          
          {/* Question */}
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground mb-2">{step.question}</h1>
          <p className="subtle-text mb-8 text-xs">{step.subtitle}</p>

          {/* Options */}
          {step.type !== 'text' ?
          <div className="space-y-3 flex-1">
              {step.options?.map((option) => {
              const iconSrc = onboardingIcons[option.value];
              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`option-card w-full text-left flex items-center gap-3 ${
                  isSelected(option.value) ? 'selected' : ''}`
                  }
                  whileTap={{ scale: 0.98 }}>
                  
                    {iconSrc &&
                  <img src={iconSrc} alt="" className="w-6 h-6 object-contain" style={{ filter: 'none' }} />
                  }
                    <span className="font-medium">{option.label}</span>
                    {isSelected(option.value) &&
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto">
                    
                        <img src={ubloomFlower} alt="" className="w-5 h-5" />
                      </motion.div>
                  }
                  </motion.button>);

            })}
            </div> :

          <div className="flex-1">
              <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Write from your heart..."
              className="journal-input"
              rows={6} />
            
            </div>
          }

          {/* Continue button */}
          <motion.button
            onClick={handleNext}
            disabled={!canContinue() && step.type !== 'text'}
            className={`soft-button w-full mt-6 flex items-center justify-center gap-2 ${
            !canContinue() && step.type !== 'text' ? 'opacity-50' : ''}`
            }
            whileTap={{ scale: 0.98 }}>
            
            <span>Continue</span>
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>);

}