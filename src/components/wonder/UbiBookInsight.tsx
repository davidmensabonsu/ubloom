import { Sparkles } from 'lucide-react';

interface UbiBookInsightProps {
  reason: string;
}

export default function UbiBookInsight({ reason }: UbiBookInsightProps) {
  return (
    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
          Why this book is for you
        </h4>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{reason}</p>
    </div>
  );
}
