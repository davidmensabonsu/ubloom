import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import crystalBallIcon from '@/assets/icons/crystal-ball.png';

const DEFAULT_LABELS = ['MOVEMENT', 'NUTRITION', 'PERFORMANCE'];

interface UbiInsightsCardProps {
  insights: string[];
  loading: boolean;
}

function stripEmojis(text: string): string {
  // Remove common emoji ranges and surrogate pairs
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{1F000}-\u{1F2FF}]/gu, '')
    .trim();
}

export default function UbiInsightsCard({ insights, loading }: UbiInsightsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-center gap-2 mb-4">
        <img src={crystalBallIcon} alt="Ubi" className="w-6 h-6 clay-icon" />
        <h3 className="font-display text-lg text-foreground">Ubi Insights</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-12 rounded-md" />
          <Skeleton className="h-12 rounded-md" />
        </div>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">No insights yet.</p>
      ) : (
        <div className="space-y-4">
          {insights.slice(0, DEFAULT_LABELS.length).map((insight, i) => (
            <div
              key={i}
              className={i > 0 ? 'pt-4 border-t border-border' : ''}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-1.5">
                {DEFAULT_LABELS[i]}
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {stripEmojis(insight)}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
