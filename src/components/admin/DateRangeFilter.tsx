import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const;

interface Props {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function DateRangeFilter({ dateRange, onDateRangeChange }: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const hasFilter = dateRange.from || dateRange.to;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map(p => (
        <Button
          key={p.label}
          variant="outline"
          size="sm"
          className="text-xs h-7 px-2.5"
          onClick={() => onDateRangeChange({
            from: startOfDay(subDays(new Date(), p.days)),
            to: endOfDay(new Date()),
          })}
        >
          {p.label}
        </Button>
      ))}

      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn('text-xs h-7 gap-1.5', !dateRange.from && 'text-muted-foreground')}>
            <CalendarIcon className="h-3 w-3" />
            {dateRange.from ? format(dateRange.from, 'MMM d') : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.from}
            onSelect={(d) => { onDateRangeChange({ ...dateRange, from: d ? startOfDay(d) : undefined }); setFromOpen(false); }}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">–</span>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn('text-xs h-7 gap-1.5', !dateRange.to && 'text-muted-foreground')}>
            <CalendarIcon className="h-3 w-3" />
            {dateRange.to ? format(dateRange.to, 'MMM d') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.to}
            onSelect={(d) => { onDateRangeChange({ ...dateRange, to: d ? endOfDay(d) : undefined }); setToOpen(false); }}
            disabled={(d) => d > new Date()}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => onDateRangeChange({ from: undefined, to: undefined })}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
