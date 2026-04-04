import { motion } from 'framer-motion';
import { Clock, Dumbbell, Flame, Star } from 'lucide-react';
import type { FitnessWorkout } from '@/lib/wonderResources';
import { fitnessThumbnails } from '@/lib/resourceMedia';

interface FitnessWorkoutCardProps {
  workout: FitnessWorkout;
  onTap: () => void;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={10}
          className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  );
}

export default function FitnessWorkoutCard({ workout, onTap }: FitnessWorkoutCardProps) {
  const thumbnail = fitnessThumbnails[workout.id];

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden"
      whileTap={{ scale: 0.97 }}
    >
      {thumbnail && (
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img src={thumbnail} alt={workout.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-3 space-y-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
          {workout.name}
        </h4>

        {/* Calories badge */}
        <span className="text-[10px] font-medium inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          ~{workout.calories} kcal
        </span>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {workout.description}
        </p>

        {/* Muscles */}
        <div className="flex flex-wrap gap-1">
          {workout.musclesTargeted.slice(0, 3).map((m) => (
            <span key={m} className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {m}
            </span>
          ))}
        </div>

        {/* Ratings row */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Dumbbell size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground w-12">Difficulty</span>
            <StarRating rating={workout.difficulty} />
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground w-12">Intensity</span>
            <StarRating rating={workout.intensity} />
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground">{workout.duration}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
