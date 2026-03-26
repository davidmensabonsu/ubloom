import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle } from 'lucide-react';
import { typeLabels, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { resourceImages, resourceVideos } from '@/lib/resourceMedia';
import BreathingCircle from './BreathingCircle';
import GroundingExercise from './GroundingExercise';
import BodyScanGuide from './BodyScanGuide';
import StepByStepGuide from './StepByStepGuide';
import SimpleTimer from './SimpleTimer';
import HydrationTracker from './HydrationTracker';
import JournalPrompt from './JournalPrompt';

interface ResourceDetailSheetProps {
  resource: WonderResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Map resource IDs to interactive visual components */
function ResourceVisual({ resourceId, onComplete }: { resourceId: string; onComplete: () => void }) {
  switch (resourceId) {
    case 'calm-1': // 4-7-8 Breathing
      return <BreathingCircle pattern={[4, 7, 8]} cycles={4} onComplete={onComplete} />;
    case 'calm-2': // Body Scan Meditation
      return <BodyScanGuide onComplete={onComplete} />;
    case 'calm-5': // 5-4-3-2-1 Grounding
      return <GroundingExercise onComplete={onComplete} />;
    case 'calm-3': // Vagus Nerve Stimulation
      return (
        <StepByStepGuide
          title="Vagus nerve exercises"
          onComplete={onComplete}
          steps={[
            'Hum gently for 2 minutes — feel the vibration in your chest and throat.',
            'Splash cold water on your face, or hold a cold cloth on your forehead for 30 seconds.',
            'Gargle with water slowly for 30 seconds — this activates the vagus nerve at the back of your throat.',
            'Place your hand on your heart. Breathe in for 4, out for 6. Repeat 5 times.',
          ]}
        />
      );
    case 'well-1': // Dry Brushing
      return (
        <StepByStepGuide
          title="Dry brushing routine"
          onComplete={onComplete}
          steps={[
            'Use a natural bristle brush on dry skin before your shower.',
            'Start at your feet — brush upward in long, firm strokes toward your heart.',
            'Move to your legs, then belly, then arms — always brushing toward the heart.',
            'Brush gently over your chest and back.',
            'Shower as normal. Your skin will tingle and glow!',
          ]}
        />
      );
    case 'well-3': // Sleep Hygiene
      return (
        <StepByStepGuide
          title="Wind-down timeline"
          onComplete={onComplete}
          steps={[
            '60 min before bed: Dim all lights in your home.',
            '30 min before bed: Put your phone in another room.',
            '15 min before bed: Gentle stretching or light reading.',
            '5 min before bed: 4-7-8 breathing (inhale 4, hold 7, exhale 8).',
            'Close your eyes. Let your body know it\'s safe to rest.',
          ]}
        />
      );
    case 'well-5': // Gua Sha
      return (
        <StepByStepGuide
          title="Gua sha facial routine"
          onComplete={onComplete}
          steps={[
            'Apply a generous layer of facial oil to clean skin.',
            'Start at the chin — glide the gua sha upward along your jawline to your ear. Repeat 5x each side.',
            'Move to cheekbones — sweep outward from nose to hairline. Repeat 5x each side.',
            'Forehead — stroke upward from brows to hairline. Repeat 5x.',
            'Finish with gentle downward strokes along the neck to drain lymph.',
          ]}
        />
      );
    case 'life-2': // Sunday Reset
      return (
        <StepByStepGuide
          title="Sunday reset checklist"
          onComplete={onComplete}
          steps={[
            'Tidy your space — clear surfaces, put things back where they belong.',
            'Do a load of laundry. Fold and put away.',
            'Meal prep something simple for the week ahead.',
            'Review your calendar — set 3 intentions for the week.',
            'Light a candle, play gentle music. End with a moment of calm.',
          ]}
        />
      );
    case 'mind-3': // Mirror Affirmation
      return (
        <StepByStepGuide
          title="Mirror affirmation practice"
          onComplete={onComplete}
          steps={[
            'Stand in front of your mirror. Look into your own eyes.',
            'Say: "I am worthy of love and good things."',
            'Say: "I am becoming the person I\'m meant to be."',
            'Say one more thing you genuinely love about yourself.',
            'Hold your gaze for a moment. Let it feel soft, not forced.',
          ]}
        />
      );
    // TIMERS
    case 'mind-1':
      return <SimpleTimer duration={300} label="Mountain meditation" doneMessage="You are the mountain ✨" onComplete={onComplete} />;
    case 'fit-2':
      return <SimpleTimer duration={1200} label="Mindful walk" doneMessage="Beautiful walk ✨" onComplete={onComplete} />;
    case 'fit-4':
      return <SimpleTimer duration={210} label="Dance it out" doneMessage="You danced! 💃" onComplete={onComplete} />;
    case 'life-1':
      return <SimpleTimer duration={300} label="Tidy time" doneMessage="Space cleared ✨" onComplete={onComplete} />;
    case 'life-4':
      return <SimpleTimer duration={3600} label="Phone-free" doneMessage="One hour reclaimed ✨" onComplete={onComplete} />;
    case 'calm-6':
      return <SimpleTimer duration={300} label="Legs up the wall" doneMessage="Rest complete ✨" onComplete={onComplete} />;
    case 'calm-7':
      return <SimpleTimer duration={600} label="Free write" doneMessage="Release complete ✨" onComplete={onComplete} />;
    case 'well-2':
      return <SimpleTimer duration={60} label="Cold splash" doneMessage="Refreshed! 💦" onComplete={onComplete} />;
    case 'well-6':
      return <SimpleTimer duration={3600} label="Digital sunset" doneMessage="Screens off ✨" onComplete={onComplete} />;
    // HYDRATION
    case 'nutr-6':
      return <HydrationTracker onComplete={onComplete} />;
    // JOURNAL PROMPTS
    case 'life-5':
      return (
        <JournalPrompt
          prompts={[
            'Name something small that made you smile today.',
            'What\'s something you\'re grateful for about yourself?',
            'What\'s one kind thing someone did for you recently?',
          ]}
          placeholder="I'm grateful for..."
          doneMessage="Sweet dreams ✨"
          maxEntries={3}
          onComplete={onComplete}
        />
      );
    case 'mind-5':
      return (
        <JournalPrompt
          prompts={[
            'Write down a belief you hold about yourself that hurts.',
            'Ask yourself: "Is this actually true? Where did this come from?"',
            'Now write a kinder, truer version of that belief.',
          ]}
          placeholder="Write freely..."
          doneMessage="A kinder story, written ✨"
          maxEntries={3}
          onComplete={onComplete}
        />
      );
    case 'mind-7':
      return (
        <JournalPrompt
          prompts={[
            'Imagine it\'s one year from now. Where are you? What does your day look like?',
            'What does your future self want you to know right now?',
            'What\'s one thing she did to get where she is?',
          ]}
          placeholder="Dear present me..."
          doneMessage="Your future self is proud of you ✨"
          maxEntries={3}
          onComplete={onComplete}
        />
      );
    // STEP-BY-STEP for remaining nutrition tips
    case 'nutr-1':
      return (
        <StepByStepGuide
          title="Morning lemon water"
          onComplete={onComplete}
          steps={[
            'Boil water and let it cool until warm (not hot).',
            'Squeeze half a fresh lemon into the warm water.',
            'Drink it slowly, first thing, before breakfast.',
            'Wait 15-30 minutes before eating to let it work.',
          ]}
        />
      );
    case 'nutr-7':
      return (
        <StepByStepGuide
          title="Anti-inflammatory plate"
          onComplete={onComplete}
          steps={[
            'Fill half your plate with colourful vegetables and leafy greens.',
            'Add a portion of omega-3 rich protein (salmon, sardines, or lentils).',
            'Include healthy fats — olive oil, avocado, or a handful of nuts.',
            'Season with turmeric, ginger, or garlic for extra anti-inflammatory power.',
            'Minimise processed foods, refined sugar, and excess alcohol.',
          ]}
        />
      );
    case 'nutr-4':
      return (
        <StepByStepGuide
          title="Gut-friendly daily plan"
          onComplete={onComplete}
          steps={[
            'Morning: Start with yoghurt or kefir for probiotics.',
            'Lunch: Add fibre-rich foods — oats, beans, or whole grains.',
            'Snack: Reach for fermented foods — kimchi, sauerkraut, or kombucha.',
            'Dinner: Include plenty of vegetables for prebiotic fibre.',
          ]}
        />
      );
    case 'life-6':
      return (
        <StepByStepGuide
          title="Capsule wardrobe in 5 steps"
          onComplete={onComplete}
          steps={[
            'Pull out everything from your wardrobe. Yes, everything.',
            'Keep only pieces you love AND that fit well right now.',
            'Aim for 30-40 versatile items that mix and match.',
            'Organise by category: tops, bottoms, layers, dresses.',
            'Donate or sell the rest. Getting dressed is now effortless.',
          ]}
        />
      );
    default:
      return null;
  }
}

export default function ResourceDetailSheet({ resource, open, onOpenChange }: ResourceDetailSheetProps) {
  const { profile, saveResource, unsaveResource, markResourceUsed, unmarkResourceUsed, logResourceCompletion } = useUserStore();

  if (!resource) return null;

  const isSaved = profile.savedResources?.includes(resource.id);
  const isUsed = profile.usedResources?.includes(resource.id);
  const typeInfo = typeLabels[resource.type];
  const handleComplete = () => logResourceCompletion(resource.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2 mb-1">
            <img src={typeInfo.icon} alt="" className="w-6 h-6 object-contain clay-icon" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{typeInfo.label}</span>
          </div>
          <SheetTitle className="font-display text-xl">{resource.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {resource.description}
          </p>

          {/* Static image (books, food, vitamins) */}
          {resourceImages[resource.id] && (
            <div className="rounded-2xl overflow-hidden">
              <img
                src={resourceImages[resource.id]}
                alt={resource.title}
                className={`w-full object-cover ${resource.type === 'book' ? 'max-h-64 object-top' : 'max-h-48'}`}
                loading="lazy"
              />
            </div>
          )}

          {/* AI-generated demo video */}
          {resourceVideos[resource.id] && (
            <div className="rounded-2xl overflow-hidden">
              <video
                src={resourceVideos[resource.id]}
                className="w-full rounded-2xl"
                controls
                loop
                playsInline
                preload="metadata"
              />
            </div>
          )}

          {/* Interactive visual */}
          <ResourceVisual resourceId={resource.id} onComplete={handleComplete} />

          {resource.content && (
            <div className="p-4 rounded-2xl bg-muted/50 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How to practice</h4>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {resource.content}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <span key={tag} className="mood-pill text-xs">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => isSaved ? unsaveResource(resource.id) : saveResource(resource.id)}
            >
              {isSaved ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
              {isSaved ? 'Saved' : 'Save for later'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={() => isUsed ? unmarkResourceUsed(resource.id) : markResourceUsed(resource.id)}
            >
              {isUsed ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} />}
              {isUsed ? 'Used' : 'Mark as used'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
