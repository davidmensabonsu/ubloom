import { motion } from 'framer-motion';

interface BloomScoreCardProps {
  score: number;
}

function getInterpretation(score: number): { title: string; text: string } {
  if (score >= 80) return { title: 'Thriving today', text: 'Your energy and consistency are aligned — lean into it.' };
  if (score >= 60) return { title: 'Building momentum', text: 'Good foundation this week — keep showing up.' };
  if (score >= 40) return { title: 'Finding your rhythm', text: 'Some days are for rest. Tomorrow is a fresh start.' };
  return { title: 'Be gentle today', text: 'Your body is asking for care. Honour that.' };
}

export default function BloomScoreCard({ score }: BloomScoreCardProps) {
  const { title, text } = getInterpretation(score);
  const size = 92;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const gradientId = 'bloomGradient';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)] flex items-center gap-5"
    >
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--gradient-hero-from))" />
              <stop offset="100%" stopColor="hsl(var(--gradient-hero-to))" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl text-foreground leading-none">{score}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5">/100</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg text-foreground mb-1">{title}</h3>
        <p className="text-sm text-foreground/75 leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}
