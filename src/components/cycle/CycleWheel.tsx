import { motion } from 'framer-motion';
import { CyclePhase, getPhaseColor, getPhaseIcon } from '@/lib/cycleUtils';

import moonIcon from '@/assets/icons/moon.png';
import blossomIcon from '@/assets/icons/blossom.png';
import sunIcon from '@/assets/icons/sun.png';
import leafIcon from '@/assets/icons/leaf.png';

const phaseIcons: Record<CyclePhase, string> = {
  Menstrual: moonIcon,
  Follicular: blossomIcon,
  Ovulatory: sunIcon,
  Luteal: leafIcon,
};

interface CycleWheelProps {
  currentDay: number;
  currentPhase: CyclePhase;
  cycleLength: number;
  periodLength: number;
  nextPeriod: string;
}

const PHASES: { phase: CyclePhase; label: string }[] = [
  { phase: 'Menstrual', label: 'Menstrual' },
  { phase: 'Follicular', label: 'Follicular' },
  { phase: 'Ovulatory', label: 'Ovulatory' },
  { phase: 'Luteal', label: 'Luteal' },
];

function getPhaseArcs(periodLength: number, cycleLength: number) {
  const ovulationDay = Math.round(cycleLength / 2);
  return [
    { phase: 'Menstrual' as CyclePhase, start: 0, end: periodLength },
    { phase: 'Follicular' as CyclePhase, start: periodLength, end: ovulationDay - 2 },
    { phase: 'Ovulatory' as CyclePhase, start: ovulationDay - 2, end: ovulationDay + 1 },
    { phase: 'Luteal' as CyclePhase, start: ovulationDay + 1, end: cycleLength },
  ];
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function CycleWheel({ currentDay, currentPhase, cycleLength, periodLength, nextPeriod }: CycleWheelProps) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 85;
  const strokeWidth = 18;
  const arcs = getPhaseArcs(periodLength, cycleLength);

  // Current day marker angle
  const dayAngle = ((currentDay - 1) / cycleLength) * 360;
  const markerPos = polarToCartesian(cx, cy, r, dayAngle);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Phase arcs */}
          {arcs.map(({ phase, start, end }) => {
            const startAngle = (start / cycleLength) * 360;
            const endAngle = (end / cycleLength) * 360;
            const isActive = phase === currentPhase;
            return (
              <path
                key={phase}
                d={describeArc(cx, cy, r, startAngle, endAngle)}
                fill="none"
                stroke={getPhaseColor(phase)}
                strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="round"
                opacity={isActive ? 1 : 0.35}
                style={isActive ? { filter: 'drop-shadow(0 0 8px currentColor)' } : undefined}
              />
            );
          })}

          {/* Current day dot */}
          <circle cx={markerPos.x} cy={markerPos.y} r={6} fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth={2} />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <img src={phaseIcons[currentPhase]} alt={currentPhase} className="w-8 h-8 clay-icon mb-1" />
          <span className="text-2xl font-display font-bold text-foreground">Day {currentDay}</span>
          <span className="text-xs text-muted-foreground">{currentPhase}</span>
        </div>
      </div>

      {/* Phase legend */}
      <div className="flex gap-3 mt-4 flex-wrap justify-center">
        {PHASES.map(({ phase, label }) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPhaseColor(phase), opacity: phase === currentPhase ? 1 : 0.5 }} />
            <span className={`text-xs ${phase === currentPhase ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Next period */}
      <p className="text-sm text-muted-foreground mt-3">
        Next period predicted: <span className="text-foreground font-medium">{nextPeriod}</span>
      </p>
    </motion.div>
  );
}
