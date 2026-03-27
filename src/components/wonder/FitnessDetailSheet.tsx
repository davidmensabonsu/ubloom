import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Clock, Dumbbell, Flame, Star, Target, Wrench, Heart } from 'lucide-react';
import type { FitnessWorkout } from '@/lib/wonderResources';
import { fitnessThumbnails, fitnessFormIllustrations } from '@/lib/resourceMedia';

interface FitnessDetailSheetProps {
  workout: FitnessWorkout | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

export default function FitnessDetailSheet({ workout, open, onOpenChange }: FitnessDetailSheetProps) {
  if (!workout) return null;

  const thumbnail = fitnessThumbnails[workout.id];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl px-5 pt-6 pb-10">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="font-display text-xl">{workout.name}</SheetTitle>
        </SheetHeader>

        {thumbnail && (
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-4">
            <img src={thumbnail} alt={workout.name} className="w-full h-full object-cover" />
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{workout.description}</p>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-muted/40 rounded-xl p-3 text-center space-y-1">
            <Clock size={16} className="mx-auto text-primary" />
            <div className="text-xs font-semibold text-foreground">{workout.duration}</div>
            <div className="text-[10px] text-muted-foreground">Duration</div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 text-center space-y-1">
            <Flame size={16} className="mx-auto text-primary" />
            <div className="text-xs font-semibold text-foreground">~{workout.calories}</div>
            <div className="text-[10px] text-muted-foreground">Calories</div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 text-center space-y-1">
            <Dumbbell size={16} className="mx-auto text-primary" />
            <StarRating rating={workout.difficulty} />
            <div className="text-[10px] text-muted-foreground">Difficulty</div>
          </div>
          <div className="bg-muted/40 rounded-xl p-3 text-center space-y-1">
            <Flame size={16} className="mx-auto text-primary" />
            <StarRating rating={workout.intensity} />
            <div className="text-[10px] text-muted-foreground">Intensity</div>
          </div>
        </div>

        {/* Muscles targeted */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-primary" /> Muscles Targeted
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {workout.musclesTargeted.map((m) => (
              <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Wrench size={14} className="text-primary" /> Equipment
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {workout.equipment.map((e) => (
              <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
                {e}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
            <Heart size={14} className="text-primary" /> Benefits
          </h3>
          <ul className="space-y-1.5">
            {workout.benefits.map((b, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">How to do it</h3>
          <ol className="space-y-3">
            {workout.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/80 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </SheetContent>
    </Sheet>
  );
}
