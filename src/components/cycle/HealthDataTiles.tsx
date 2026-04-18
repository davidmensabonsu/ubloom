import { motion } from 'framer-motion';
import { useState } from 'react';
import { Footprints, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/stores/userStore';
import { computeBloomScore } from '@/lib/bloomScore';
import { toast } from 'sonner';

import bedIcon from '@/assets/icons/bed.png';
import heartPulseIcon from '@/assets/icons/heart-pulse.png';
import flameIcon from '@/assets/icons/flame.png';

type FieldKey = 'sleepHours' | 'recoveryLevel' | 'activityMinutes' | 'steps';

interface TileConfig {
  key: FieldKey;
  icon: string | 'footsteps';
  label: string;
  subLabel: string;
  unit?: string;
  max?: number;
  editable: boolean;
  info: string;
}

const TILES: TileConfig[] = [
  {
    key: 'sleepHours',
    icon: bedIcon,
    label: 'Sleep',
    subLabel: 'hours last night',
    unit: 'h',
    max: 24,
    editable: true,
    info: 'Total hours of sleep you got last night. Most adults thrive on 7–9 hours.',
  },
  {
    key: 'recoveryLevel',
    icon: heartPulseIcon,
    label: 'HRV',
    subLabel: 'recovery',
    max: 100,
    editable: true,
    info: 'Heart Rate Variability — a 0–100 recovery score from your wearable. Higher means better recovered and less stressed.',
  },
  {
    key: 'activityMinutes',
    icon: flameIcon,
    label: 'Active',
    subLabel: 'mins today',
    unit: 'm',
    max: 1440,
    editable: true,
    info: 'Minutes spent in moderate-to-vigorous movement today (walks, workouts, etc.). Not calories.',
  },
  {
    key: 'steps',
    icon: 'footsteps',
    label: 'Steps',
    subLabel: 'today',
    max: 100000,
    editable: true,
    info: 'Total steps taken today. A common daily target is 7,000–10,000.',
  },
];

export default function HealthDataTiles() {
  const { profile, updateProfile } = useUserStore();
  const [editingTile, setEditingTile] = useState<TileConfig | null>(null);
  const [inputValue, setInputValue] = useState('');

  const healthData = profile.healthData || {};
  const totalHabits = (profile.coreHabits || []).length;

  const openLog = (tile: TileConfig) => {
    if (!tile.editable) return;
    setEditingTile(tile);
    const existing = (healthData as any)[tile.key];
    setInputValue(existing ? String(existing) : '');
  };

  const handleSave = () => {
    if (!editingTile) return;
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid number');
      return;
    }
    if (editingTile.max && num > editingTile.max) {
      toast.error(`Value must be ${editingTile.max} or less`);
      return;
    }

    const updatedHealthData = {
      ...healthData,
      [editingTile.key]: num,
      lastUpdated: new Date().toISOString(),
    };

    // Recalculate bloom with updated health data
    const updatedProfile = { ...profile, healthData: updatedHealthData };
    const bloom = computeBloomScore(updatedProfile as any, totalHabits);

    updateProfile({
      healthData: updatedHealthData,
      bloomScore: bloom.total,
    });

    toast.success(`${editingTile.label} logged`);
    setEditingTile(null);
    setInputValue('');
  };

  return (
    <>
      <div className="-mx-5 px-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 pb-1">
          {TILES.map((tile, i) => {
            const value = tile.editable ? (healthData as any)[tile.key] : undefined;
            const hasValue = value !== undefined && value !== null && value !== '';
            return (
              <motion.div
                key={tile.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-3 shadow-[var(--shadow-soft)] flex-shrink-0"
                style={{ width: 130 }}
              >
                <div className="flex items-center justify-between mb-2">
                  {tile.icon === 'footsteps' ? (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Footprints size={16} className="text-primary" />
                    </div>
                  ) : (
                    <img src={tile.icon as string} alt={tile.label} className="w-7 h-7 clay-icon" />
                  )}
                </div>
                <div className="font-display text-xl text-foreground leading-tight">
                  {hasValue ? value : '—'}
                </div>
                <div className="text-[11px] font-medium text-foreground/80 uppercase tracking-wide mt-0.5">
                  {tile.label}
                </div>
                {hasValue && tile.subLabel && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">{tile.subLabel}</div>
                )}
                {!hasValue && tile.editable && (
                  <button
                    onClick={() => openLog(tile)}
                    className="text-[11px] text-primary/80 hover:text-primary mt-1 underline-offset-2 hover:underline"
                  >
                    Log it
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingTile} onOpenChange={(o) => !o && setEditingTile(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Log {editingTile?.label.toLowerCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              type="number"
              inputMode="decimal"
              placeholder={`Enter ${editingTile?.label.toLowerCase()}${editingTile?.unit ? ` (${editingTile.unit})` : ''}`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              className="rounded-xl"
            />
            <Button onClick={handleSave} className="w-full rounded-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
