import twoHeartsIcon from '@/assets/icons/two-hearts.png';
import hikingIcon from '@/assets/icons/hiking.png';
import globeIcon from '@/assets/icons/globe.png';
import bathIcon from '@/assets/icons/bath.png';
import danceIcon from '@/assets/icons/dance.png';
import yogaIcon from '@/assets/icons/yoga.png';

export const vibeOptions = [
  { value: 'romantic', icon: twoHeartsIcon, label: 'Romantic' },
  { value: 'adventure', icon: hikingIcon, label: 'Adventure' },
  { value: 'cultural', icon: globeIcon, label: 'Cultural' },
  { value: 'relaxation', icon: bathIcon, label: 'Relaxation' },
  { value: 'girls-trip', icon: danceIcon, label: 'Girls Trip' },
  { value: 'solo', icon: yogaIcon, label: 'Solo' },
] as const;

export const vibeIconMap: Record<string, string> = Object.fromEntries(
  vibeOptions.map((v) => [v.value, v.icon])
);
