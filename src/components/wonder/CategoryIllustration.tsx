import React from 'react';

interface Props {
  category: string;
  className?: string;
}

const stroke = 'hsl(var(--primary) / 0.7)';
const sw = 1.6;

const common = {
  fill: 'none',
  stroke,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Four-pointed sparkle ✦
const Sparkle = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    d={`M ${x} ${y - 4 * s} C ${x} ${y - s}, ${x + s} ${y - s}, ${x + 4 * s} ${y} C ${x + s} ${y + s}, ${x} ${y + s}, ${x} ${y + 4 * s} C ${x} ${y + s}, ${x - s} ${y + s}, ${x - 4 * s} ${y} C ${x - s} ${y - s}, ${x} ${y - s}, ${x} ${y - 4 * s} Z`}
    fill={stroke}
    opacity={0.6}
    stroke="none"
  />
);

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {children}
  </svg>
);

const Illustrations: Record<string, React.ReactNode> = {
  calm: (
    <Wrap>
      {/* head */}
      <circle cx="50" cy="28" r="7" {...common} />
      {/* bun */}
      <circle cx="50" cy="19" r="3" {...common} />
      {/* body / torso */}
      <path d="M44 35 C 42 44, 42 50, 44 56" {...common} />
      <path d="M56 35 C 58 44, 58 50, 56 56" {...common} />
      {/* crossed legs */}
      <path d="M30 70 Q 50 60, 70 70 Q 60 76, 50 74 Q 40 76, 30 70 Z" {...common} />
      {/* arms resting on knees */}
      <path d="M44 50 Q 35 60, 33 68" {...common} />
      <path d="M56 50 Q 65 60, 67 68" {...common} />
      <circle cx="32" cy="69" r="2" {...common} />
      <circle cx="68" cy="69" r="2" {...common} />
      <Sparkle x={18} y={30} />
      <Sparkle x={82} y={42} s={0.8} />
      <Sparkle x={20} y={60} s={0.7} />
    </Wrap>
  ),
  podcasts: (
    <Wrap>
      {/* headband */}
      <path d="M22 55 C 22 30, 78 30, 78 55" {...common} />
      {/* ear cups */}
      <rect x="16" y="50" width="14" height="22" rx="6" {...common} />
      <rect x="70" y="50" width="14" height="22" rx="6" {...common} />
      {/* heart on headband */}
      <path d="M50 44 C 47 41, 43 43, 43 47 C 43 51, 50 55, 50 55 C 50 55, 57 51, 57 47 C 57 43, 53 41, 50 44 Z" {...common} />
      {/* sound waves */}
      <path d="M10 58 Q 7 62, 10 66" {...common} />
      <path d="M6 56 Q 2 62, 6 68" {...common} opacity={0.6} />
      <path d="M90 58 Q 93 62, 90 66" {...common} />
      <path d="M94 56 Q 98 62, 94 68" {...common} opacity={0.6} />
    </Wrap>
  ),
  wellness: (
    <Wrap>
      {/* heart */}
      <path d="M50 32 C 45 26, 36 28, 36 36 C 36 44, 50 52, 50 52 C 50 52, 64 44, 64 36 C 64 28, 55 26, 50 32 Z" {...common} />
      {/* left hand */}
      <path d="M22 78 C 22 66, 28 58, 36 58 L 40 58 L 40 80 Z" {...common} />
      <path d="M28 64 L 28 56" {...common} />
      <path d="M32 62 L 32 54" {...common} />
      <path d="M36 62 L 36 54" {...common} />
      {/* right hand */}
      <path d="M78 78 C 78 66, 72 58, 64 58 L 60 58 L 60 80 Z" {...common} />
      <path d="M72 64 L 72 56" {...common} />
      <path d="M68 62 L 68 54" {...common} />
      <path d="M64 62 L 64 54" {...common} />
      <Sparkle x={28} y={28} s={0.8} />
      <Sparkle x={72} y={26} />
      <Sparkle x={80} y={48} s={0.7} />
    </Wrap>
  ),
  mindset: (
    <Wrap>
      {/* brain - two halves */}
      <path d="M50 22 C 42 18, 32 22, 30 32 C 24 34, 22 42, 26 48 C 22 54, 26 62, 32 64 C 32 72, 42 76, 50 72 Z" {...common} />
      <path d="M50 22 C 58 18, 68 22, 70 32 C 76 34, 78 42, 74 48 C 78 54, 74 62, 68 64 C 68 72, 58 76, 50 72 Z" {...common} />
      <path d="M50 22 L 50 72" {...common} opacity={0.5} />
      <path d="M38 34 Q 42 40, 38 46" {...common} opacity={0.6} />
      <path d="M62 34 Q 58 40, 62 46" {...common} opacity={0.6} />
      <path d="M38 52 Q 44 58, 40 64" {...common} opacity={0.6} />
      <path d="M62 52 Q 56 58, 60 64" {...common} opacity={0.6} />
      <Sparkle x={20} y={26} s={0.8} />
      <Sparkle x={82} y={22} />
      <Sparkle x={86} y={50} s={0.7} />
    </Wrap>
  ),
  nutrition: (
    <Wrap>
      {/* bowl */}
      <path d="M18 52 Q 50 60, 82 52 L 76 76 Q 50 84, 24 76 Z" {...common} />
      {/* contents - leaves & berries */}
      <circle cx="34" cy="48" r="5" {...common} />
      <circle cx="46" cy="44" r="5" {...common} />
      <circle cx="68" cy="48" r="5" {...common} />
      {/* avocado half */}
      <ellipse cx="56" cy="48" rx="7" ry="9" {...common} />
      <circle cx="56" cy="50" r="3" {...common} />
      {/* leaf */}
      <path d="M28 44 Q 32 36, 40 38" {...common} />
      <Sparkle x={80} y={32} s={0.8} />
      <Sparkle x={22} y={36} s={0.7} />
    </Wrap>
  ),
  lifestyle: (
    <Wrap>
      {/* vase */}
      <path d="M32 30 L 32 38 Q 22 50, 28 68 Q 32 78, 42 78 Q 52 78, 56 68 Q 62 50, 52 38 L 52 30 Z" {...common} />
      <circle cx="42" cy="56" r="6" {...common} opacity={0.5} />
      {/* candle */}
      <rect x="62" y="56" width="20" height="22" rx="2" {...common} />
      <path d="M72 56 L 72 50" {...common} />
      <path d="M72 50 Q 68 46, 72 42 Q 76 46, 72 50 Z" {...common} />
      <Sparkle x={80} y={36} s={0.8} />
      <Sparkle x={86} y={50} s={0.6} />
    </Wrap>
  ),
  vitamins: (
    <Wrap>
      {/* bottle */}
      <rect x="34" y="32" width="28" height="44" rx="4" {...common} />
      <rect x="38" y="26" width="20" height="8" rx="2" {...common} />
      {/* leaf logo */}
      <path d="M44 54 Q 48 48, 52 54 Q 48 60, 44 54 Z" {...common} />
      <path d="M48 50 L 48 58" {...common} opacity={0.5} />
      {/* capsules */}
      <rect x="62" y="62" width="20" height="9" rx="4.5" {...common} transform="rotate(20 72 66)" />
      <rect x="60" y="70" width="20" height="9" rx="4.5" {...common} transform="rotate(20 70 74)" />
      <Sparkle x={74} y={34} s={0.8} />
      <Sparkle x={22} y={42} s={0.7} />
    </Wrap>
  ),
  fitness: (
    <Wrap>
      {/* dumbbell */}
      <rect x="14" y="40" width="10" height="20" rx="2" {...common} />
      <rect x="22" y="44" width="6" height="12" rx="1.5" {...common} />
      <rect x="28" y="48" width="44" height="4" rx="1" {...common} />
      <rect x="72" y="44" width="6" height="12" rx="1.5" {...common} />
      <rect x="76" y="40" width="10" height="20" rx="2" {...common} />
      <Sparkle x={22} y={26} s={0.8} />
      <Sparkle x={80} y={28} />
      <Sparkle x={50} y={72} s={0.7} />
    </Wrap>
  ),
  hygiene: (
    <Wrap>
      {/* pump bottle */}
      <rect x="18" y="38" width="22" height="38" rx="3" {...common} />
      <path d="M24 38 L 24 30 L 34 30 L 34 38" {...common} />
      <path d="M29 30 L 29 22 L 36 22" {...common} />
      {/* dropper bottle */}
      <rect x="46" y="48" width="16" height="28" rx="2" {...common} />
      <rect x="49" y="42" width="10" height="8" rx="1" {...common} />
      <path d="M54 42 L 54 34" {...common} />
      <circle cx="54" cy="32" r="2" {...common} />
      {/* jar */}
      <rect x="66" y="58" width="20" height="18" rx="2" {...common} />
      <rect x="64" y="54" width="24" height="6" rx="1" {...common} />
      <Sparkle x={80} y={36} s={0.7} />
    </Wrap>
  ),
  books: (
    <Wrap>
      {/* open book */}
      <path d="M14 56 L 50 50 L 86 56 L 86 78 L 50 72 L 14 78 Z" {...common} />
      <path d="M50 50 L 50 72" {...common} />
      <path d="M22 60 L 42 56" {...common} opacity={0.5} />
      <path d="M22 66 L 42 62" {...common} opacity={0.5} />
      <path d="M58 56 L 78 60" {...common} opacity={0.5} />
      <path d="M58 62 L 78 66" {...common} opacity={0.5} />
      <Sparkle x={32} y={32} s={0.8} />
      <Sparkle x={52} y={22} />
      <Sparkle x={70} y={34} s={0.7} />
    </Wrap>
  ),
};

export default function CategoryIllustration({ category, className }: Props) {
  const node = Illustrations[category] ?? Illustrations.wellness;
  return <div className={className}>{node}</div>;
}