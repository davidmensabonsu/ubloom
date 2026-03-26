import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle, ExternalLink, Heart, HeartOff } from 'lucide-react';
import { typeLabels, type WonderResource } from '@/lib/wonderResources';
import { useUserStore } from '@/stores/userStore';
import { resourceImages, resourceVideos } from '@/lib/resourceMedia';
import { bookLinks } from '@/lib/bookLinks';
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
  const { profile, saveResource, unsaveResource, saveRecipe, unsaveRecipe, markResourceUsed, unmarkResourceUsed, logResourceCompletion } = useUserStore();

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

          {/* Vitamin dosage info */}
          {resource.dosage && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">Dosage & Timing</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Amount</p>
                  <p className="text-sm font-semibold text-foreground">{resource.dosage.amount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">When to take</p>
                  <p className="text-sm font-semibold text-foreground capitalize">{resource.dosage.timing.replace('-', ' ')}</p>
                </div>
              </div>
              {resource.dosage.withFood && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-primary">🍽</span> Take with food
                </div>
              )}
              {resource.dosage.notes && (
                <p className="text-xs text-muted-foreground italic leading-relaxed">{resource.dosage.notes}</p>
              )}
            </div>
          )}

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

          {/* Recipes */}
          {resource.recipes && resource.recipes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Recipes to try</h4>
              {resource.recipes.map((recipe, i) => (
                <details
                  key={i}
                  className="rounded-2xl bg-muted/40 overflow-hidden group"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{recipe.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{recipe.time}</span>
                  </summary>
                  {(() => {
                    const recipeKey = `${resource.id}::${i}`;
                    const isRecipeSaved = (profile.savedRecipes || []).includes(recipeKey);
                    return (
                      <div className="px-4 pt-2 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); isRecipeSaved ? unsaveRecipe(recipeKey) : saveRecipe(recipeKey); }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                          {isRecipeSaved ? <Heart size={14} className="fill-primary text-primary" /> : <Heart size={14} />}
                          {isRecipeSaved ? 'Saved' : 'Save recipe'}
                        </button>
                      </div>
                    );
                  })()}
                  <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                    <div className="pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Ingredients</p>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ing, j) => (
                          <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Steps</p>
                      <ol className="space-y-1.5">
                        {recipe.steps.map((step, j) => (
                          <li key={j} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-primary font-semibold shrink-0">{j + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <span key={tag} className="mood-pill text-xs">
                {tag}
              </span>
            ))}
          </div>

          {/* Book purchase links */}
          {bookLinks[resource.id] && (
            <div className="p-4 rounded-2xl bg-muted/50 space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{resource.type === 'vitamin' ? 'Where to buy' : 'Get this book'}</h4>
              <div className="space-y-2">
                {bookLinks[resource.id].map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      link.topPick
                        ? 'bg-primary/10 border-2 border-primary text-primary hover:bg-primary/20'
                        : 'bg-background border border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {link.topPick && <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">Top Pick</span>}
                        <span className="truncate">{link.label}</span>
                        {link.price && <span className="ml-auto shrink-0 text-xs font-semibold text-foreground">{link.price}</span>}
                      </div>
                      {link.rating != null && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < Math.round(link.rating!) ? 'text-amber-400' : 'text-muted-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{link.rating}</span>
                          {link.reviews != null && (
                            <span className="text-xs text-muted-foreground">({link.reviews >= 1000 ? `${(link.reviews / 1000).toFixed(1)}k` : link.reviews} reviews)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <ExternalLink size={12} className={link.topPick ? 'text-primary/60' : 'text-muted-foreground'} />
                  </a>
                ))}
              </div>
            </div>
          )}

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
