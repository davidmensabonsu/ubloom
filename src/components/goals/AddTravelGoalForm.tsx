import { useState } from 'react';
import { MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { motion } from 'framer-motion';

const vibeOptions = [
  { value: 'romantic', emoji: '🌹', label: 'Romantic' },
  { value: 'adventure', emoji: '🏔️', label: 'Adventure' },
  { value: 'cultural', emoji: '🏛️', label: 'Cultural' },
  { value: 'relaxation', emoji: '🌊', label: 'Relaxation' },
  { value: 'girls-trip', emoji: '👯', label: 'Girls Trip' },
  { value: 'solo', emoji: '🧘', label: 'Solo' },
];

interface AddTravelGoalFormProps {
  onClose: () => void;
}

export default function AddTravelGoalForm({ onClose }: AddTravelGoalFormProps) {
  const { addGoal } = useUserStore();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [vibe, setVibe] = useState<string | undefined>();
  const [budget, setBudget] = useState('');

  const handleSubmit = () => {
    if (!tripName.trim()) return;
    addGoal({
      title: tripName.trim(),
      category: 'travel',
      completed: false,
      vision: 'Adventures that expand my world and fill my soul',
      deadline: departureDate ? format(departureDate, 'yyyy-MM-dd') : undefined,
      tripDetails: {
        destination: destination || undefined,
        departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : undefined,
        returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
        vibe,
        budget: budget || undefined,
        itinerary: [],
        checklist: [],
      },
    });
    onClose();
  };

  return (
    <>
      <div className="px-6 overflow-y-auto flex-1 space-y-3">
        <input
          type="text"
          autoFocus
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="Name your trip ✈️"
          className="w-full p-4 rounded-2xl bg-muted border-0 focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/50">
          <MapPin size={16} className="text-muted-foreground shrink-0" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to?"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("p-3 rounded-2xl border border-border flex items-center gap-2 text-sm hover:bg-muted transition-colors", !departureDate && "text-muted-foreground")}>
                <CalendarIcon size={14} />
                {departureDate ? format(departureDate, 'MMM d') : 'Depart'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={departureDate} onSelect={setDepartureDate} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("p-3 rounded-2xl border border-border flex items-center gap-2 text-sm hover:bg-muted transition-colors", !returnDate && "text-muted-foreground")}>
                <CalendarIcon size={14} />
                {returnDate ? format(returnDate, 'MMM d') : 'Return'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={returnDate} onSelect={setReturnDate} disabled={(d) => departureDate ? d < departureDate : d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        {/* Vibe selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Trip vibe</label>
          <div className="flex flex-wrap gap-2">
            {vibeOptions.map((v) => (
              <button
                key={v.value}
                onClick={() => setVibe(vibe === v.value ? undefined : v.value)}
                className={cn("mood-pill text-sm", vibe === v.value && "selected")}
              >
                <span>{v.emoji}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Budget (optional) e.g. £2,000"
          className="w-full p-3 rounded-2xl bg-muted/50 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
      </div>

      <div className="p-6 pt-2">
        <motion.button
          onClick={handleSubmit}
          disabled={!tripName.trim()}
          className={`soft-button w-full ${!tripName.trim() ? 'opacity-50' : ''}`}
          whileTap={{ scale: 0.98 }}
        >
          Plan this trip ✨
        </motion.button>
      </div>
    </>
  );
}
