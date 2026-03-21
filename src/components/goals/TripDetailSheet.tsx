import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, Wallet, StickyNote, Pencil, Trash2, Check, X, ImagePlus, Link } from 'lucide-react';
import { useUserStore, type Goal } from '@/stores/userStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import TripItinerary from './TripItinerary';
import TripChecklist from './TripChecklist';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const vibeOptions = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'girls-trip', label: 'Girls Trip' },
  { value: 'solo', label: 'Solo' },
];

// Renders text with clickable hyperlinks
function RichText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

interface TripDetailSheetProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TripDetailSheet({ goal, open, onOpenChange }: TripDetailSheetProps) {
  const { updateTripDetails, updateGoal, removeGoal, toggleGoalComplete } = useUserStore();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!goal) return null;

  const trip = goal.tripDetails ?? { itinerary: [], checklist: [] };
  const photos = trip.photos ?? [];
  const totalDays = trip.departureDate && trip.returnDate
    ? Math.max(1, differenceInDays(parseISO(trip.returnDate), parseISO(trip.departureDate)) + 1)
    : 0;

  const handleVibeSelect = (vibe: string) => {
    updateTripDetails(goal.id, { vibe: trip.vibe === vibe ? undefined : vibe });
  };

  const handleStartEditNotes = () => {
    setNotesText(trip.notes || '');
    setEditingNotes(true);
  };

  const handleSaveNotes = () => {
    updateTripDetails(goal.id, { notes: notesText });
    setEditingNotes(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const ext = file.name.split('.').pop();
      const path = `trips/${goal.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from('vision-images').upload(path, file);
      if (error) {
        toast.error('Failed to upload photo');
        continue;
      }

      const { data: urlData } = supabase.storage.from('vision-images').getPublicUrl(path);
      newPhotos.push(urlData.publicUrl);
    }

    if (newPhotos.length > 0) {
      updateTripDetails(goal.id, { photos: [...photos, ...newPhotos] });
      toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added`);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (url: string) => {
    updateTripDetails(goal.id, { photos: photos.filter((p) => p !== url) });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">{goal.title}</SheetTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { toggleGoalComplete(goal.id); onOpenChange(false); }}
                className={`p-2 rounded-xl transition-colors ${goal.completed ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => { removeGoal(goal.id); onOpenChange(false); }}
                className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {trip.destination && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={12} />
              {trip.destination}
            </p>
          )}
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-3 mb-1 bg-muted/50">
            <TabsTrigger value="overview" className="flex-1 text-xs">Overview</TabsTrigger>
            <TabsTrigger value="itinerary" className="flex-1 text-xs">Itinerary</TabsTrigger>
            <TabsTrigger value="checklist" className="flex-1 text-xs">Checklist</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1 text-xs">Photos</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-5 pb-8">
            <TabsContent value="overview" className="mt-3 space-y-5">
              {/* Destination */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Destination</label>
                <input
                  value={trip.destination || ''}
                  onChange={(e) => updateTripDetails(goal.id, { destination: e.target.value })}
                  placeholder="Where are you going?"
                  className="w-full text-sm bg-muted/50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Departure</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn("w-full text-sm bg-muted/50 rounded-xl px-3 py-2.5 text-left flex items-center gap-2", !trip.departureDate && "text-muted-foreground")}>
                        <Calendar size={14} />
                        {trip.departureDate ? format(parseISO(trip.departureDate), 'MMM d, yyyy') : 'Pick date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={trip.departureDate ? parseISO(trip.departureDate) : undefined}
                        onSelect={(d) => updateTripDetails(goal.id, { departureDate: d ? format(d, 'yyyy-MM-dd') : undefined })}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Return</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={cn("w-full text-sm bg-muted/50 rounded-xl px-3 py-2.5 text-left flex items-center gap-2", !trip.returnDate && "text-muted-foreground")}>
                        <Calendar size={14} />
                        {trip.returnDate ? format(parseISO(trip.returnDate), 'MMM d, yyyy') : 'Pick date'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={trip.returnDate ? parseISO(trip.returnDate) : undefined}
                        onSelect={(d) => updateTripDetails(goal.id, { returnDate: d ? format(d, 'yyyy-MM-dd') : undefined })}
                        disabled={(d) => trip.departureDate ? d < parseISO(trip.departureDate) : false}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {totalDays > 0 && (
                <p className="text-xs text-primary font-medium">✨ {totalDays} day{totalDays !== 1 ? 's' : ''} of adventure</p>
              )}

              {/* Vibe */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trip Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {vibeOptions.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => handleVibeSelect(v.value)}
                      className={cn(
                        "mood-pill text-sm",
                        trip.vibe === v.value && "selected"
                      )}
                    >
                      <span>{v.emoji}</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Wallet size={12} />
                  Budget
                </label>
                <input
                  value={trip.budget || ''}
                  onChange={(e) => updateTripDetails(goal.id, { budget: e.target.value })}
                  placeholder="e.g. £2,000"
                  className="w-full text-sm bg-muted/50 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>

              {/* Notes with hyperlink support */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <StickyNote size={12} />
                  Notes
                  <span className="ml-auto flex items-center gap-0.5 text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60">
                    <Link size={10} />
                    Links auto-detect
                  </span>
                </label>
                {editingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows={5}
                      placeholder="Paste hotel links, flight details, outfit ideas...&#10;URLs will become clickable automatically!"
                      className="w-full text-sm bg-muted/50 rounded-xl px-3 py-2.5 resize-none focus:ring-2 focus:ring-primary/30 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleSaveNotes} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs hover:bg-primary/20">Save</button>
                      <button onClick={() => setEditingNotes(false)} className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleStartEditNotes}
                    className="w-full text-left text-sm bg-muted/50 rounded-xl px-3 py-2.5 min-h-[60px] text-muted-foreground hover:bg-muted/70 transition-colors"
                  >
                    {trip.notes ? <RichText text={trip.notes} /> : 'Tap to add notes...'}
                  </button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="itinerary" className="mt-3">
              {totalDays > 0 ? (
                <TripItinerary goalId={goal.id} items={trip.itinerary} totalDays={totalDays} />
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <p>Set your departure and return dates first</p>
                  <p className="text-xs mt-1">Then you can plan each day ✨</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="mt-3">
              <TripChecklist goalId={goal.id} items={trip.checklist} />
            </TabsContent>

            <TabsContent value="photos" className="mt-3 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-muted/30">
                      <img src={url} alt={`Trip photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemovePhoto(url)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-primary/40 hover:text-primary/70 transition-colors"
              >
                <ImagePlus size={24} />
                <span className="text-sm">
                  {uploading ? 'Uploading...' : 'Add inspiration photos'}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  Hotel screenshots, destination inspo, outfit ideas
                </span>
              </button>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
