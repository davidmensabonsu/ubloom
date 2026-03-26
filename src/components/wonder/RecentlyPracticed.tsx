import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { wonderResources } from '@/lib/wonderResources';
import { categoryIcons, categoryColors } from '@/lib/wonderResources';

export default function RecentlyPracticed({ onSelectResource }: { onSelectResource?: (r: any) => void }) {
  const { resourceCompletions = [] } = useUserStore((s) => s.profile);

  const recent = useMemo(() => {
    if (!resourceCompletions.length) return [];
    // Sort by timestamp descending, take last 5 unique
    const sorted = [...resourceCompletions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const seen = new Set<string>();
    const result: { resourceId: string; timestamp: string }[] = [];
    for (const c of sorted) {
      if (!seen.has(c.resourceId)) {
        seen.add(c.resourceId);
        result.push(c);
      }
      if (result.length >= 5) break;
    }
    return result;
  }, [resourceCompletions]);

  if (!recent.length) return null;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-2"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Clock size={14} />
        Recently Practiced
      </h3>
      <div className="space-y-1.5">
        {recent.map((item, i) => {
          const resource = wonderResources.find((r) => r.id === item.resourceId);
          if (!resource) return null;
          const color = categoryColors[resource.category];
          const icon = categoryIcons[resource.category];
          return (
            <motion.button
              key={`${item.resourceId}-${item.timestamp}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelectResource?.(resource)}
              className="w-full flex items-center gap-3 rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 px-3 py-2.5 text-left hover:bg-card/80 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `hsl(${color} / 0.15)` }}
              >
                <img src={icon} alt="" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{resource.title}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{resource.category}</p>
              </div>
              <span className="text-[11px] text-muted-foreground shrink-0">{formatTime(item.timestamp)}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
