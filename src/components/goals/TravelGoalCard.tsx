import { motion } from 'framer-motion';
import { MapPin, Calendar, CheckCircle2, Plane } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Goal } from '@/stores/userStore';
import { vibeIconMap } from '@/lib/vibeOptions';

interface TravelGoalCardProps {
  goal: Goal;
  onTap: () => void;
}

export default function TravelGoalCard({ goal, onTap }: TravelGoalCardProps) {
  const trip = goal.tripDetails;
  const checklistTotal = trip?.checklist.length ?? 0;
  const checklistDone = trip?.checklist.filter((c) => c.completed).length ?? 0;
  const progress = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  return (
    <motion.button
      onClick={onTap}
      className="w-full text-left p-4 rounded-2xl bg-muted/50 hover:bg-muted/70 transition-colors space-y-2"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {goal.title}
          </h4>
          {trip?.destination && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {trip.destination}
            </p>
          )}
        </div>
        {trip?.vibe && (
          <span className="text-lg shrink-0">{vibeEmojis[trip.vibe] || '✈️'}</span>
        )}
        {!trip?.vibe && <Plane size={16} className="text-muted-foreground shrink-0" />}
      </div>

      {(trip?.departureDate || checklistTotal > 0) && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {trip?.departureDate && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {format(parseISO(trip.departureDate), 'MMM d')}
              {trip.returnDate && ` – ${format(parseISO(trip.returnDate), 'MMM d')}`}
            </span>
          )}
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} />
              {checklistDone}/{checklistTotal}
            </span>
          )}
        </div>
      )}

      {checklistTotal > 0 && (
        <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.button>
  );
}
