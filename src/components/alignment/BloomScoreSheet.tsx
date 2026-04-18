import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import type { BloomBreakdown } from '@/lib/bloomScore';
import crystalBallIcon from '@/assets/icons/crystal-ball.png';

interface BloomScoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: BloomBreakdown;
}

function getInterpretation(b: BloomBreakdown): string {
  const { total, mood, habits, cycle, consistency } = b;
  // Find the weakest component (weighted)
  const items = [
    { key: 'mood', label: 'check in with how you feel', score: mood },
    { key: 'habits', label: 'tend to your daily habits', score: habits },
    { key: 'cycle', label: 'honour your cycle phase', score: cycle },
    { key: 'consistency', label: 'show up a little more often', score: consistency },
  ];
  const lowest = items.reduce((a, b) => (a.score < b.score ? a : b));

  if (total >= 85) return "You're in beautiful alignment — keep flowing with what's working.";
  if (total >= 70) return `You're doing well — a small nudge to ${lowest.label} could lift you higher.`;
  if (total >= 50) return `You're steady. Try to ${lowest.label} this week — gentle, no pressure.`;
  return `Be soft with yourself today. Start small: ${lowest.label}.`;
}

const ROW = (label: string, weight: string, score: number) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{weight}</span>
      </div>
      <span className="text-sm font-semibold text-foreground tabular-nums">{score}</span>
    </div>
    <Progress value={score} className="h-1.5" />
  </div>
);

export default function BloomScoreSheet({ open, onOpenChange, breakdown }: BloomScoreSheetProps) {
  const interpretation = getInterpretation(breakdown);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t-0 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-2xl">Your Bloom Score</SheetTitle>
        </SheetHeader>

        <div className="mt-2 mb-5 flex items-baseline gap-2">
          <span className="text-5xl font-serif text-primary tabular-nums">{breakdown.total}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>

        <div className="space-y-4 mb-5">
          {ROW('Mood today', '30%', breakdown.mood)}
          {ROW('Habits this week', '30%', breakdown.habits)}
          {ROW('Cycle phase energy', '20%', breakdown.cycle)}
          {ROW('Consistency (7d)', '20%', breakdown.consistency)}
        </div>

        <div className="bg-primary/15 rounded-2xl p-4 flex items-start gap-3">
          <img src={crystalBallIcon} alt="Ubi" className="w-6 h-6 object-contain shrink-0 clay-icon mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-foreground/60 mb-1">Ubi says</p>
            <p className="text-sm text-foreground/90 leading-relaxed italic font-serif">{interpretation}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
