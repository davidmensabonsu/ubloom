// Centralized mood/feeling icon mapping - replaces all emojis with custom 3D clay icons
import leafIcon from '@/assets/icons/leaf.png';
import lightningIcon from '@/assets/icons/lightning.png';
import twoHeartsIcon from '@/assets/icons/two-hearts.png';
import paletteIcon from '@/assets/icons/palette.png';
import doveIcon from '@/assets/icons/dove.png';
import crownIcon from '@/assets/icons/crown.png';
import plantIcon from '@/assets/icons/plant.png';
import sparklesIcon from '@/assets/icons/sparkles.png';
import brainIcon from '@/assets/icons/brain.png';
import glassWaterIcon from '@/assets/icons/glass-water.png';
import waveIcon from '@/assets/icons/wave.png';
import flameIcon from '@/assets/icons/flame.png';
import bedIcon from '@/assets/icons/bed.png';
import wiltedRoseIcon from '@/assets/icons/wilted-rose.png';
import cloudIcon from '@/assets/icons/cloud.png';
import sunriseIcon from '@/assets/icons/sunrise.png';
import moonIcon from '@/assets/icons/moon.png';
import butterflyIcon from '@/assets/icons/butterfly.png';
import spiralIcon from '@/assets/icons/spiral.png';
import darkMoonIcon from '@/assets/icons/dark-moon.png';
import crystalBallIcon from '@/assets/icons/crystal-ball.png';
import heartIcon from '@/assets/icons/heart.png';
import starIcon from '@/assets/icons/star.png';
import blossomIcon from '@/assets/icons/blossom.png';
import pencilIcon from '@/assets/icons/pencil.png';
import trophyIcon from '@/assets/icons/trophy.png';
import cameraIcon from '@/assets/icons/camera.png';
import briefcaseIcon from '@/assets/icons/briefcase.png';
import planeIcon from '@/assets/icons/plane.png';

// Mood/feeling icons used across alignment, mood charts, and summaries
export const feelingIcons: Record<string, string> = {
  calm: leafIcon,
  energized: lightningIcon,
  grateful: twoHeartsIcon,
  creative: paletteIcon,
  peaceful: doveIcon,
  confident: crownIcon,
  grounded: plantIcon,
  joyful: sparklesIcon,
  anxious: brainIcon,
  sad: glassWaterIcon,
  overwhelmed: waveIcon,
  frustrated: flameIcon,
  tired: bedIcon,
  lonely: wiltedRoseIcon,
  numb: cloudIcon,
  hopeful: sunriseIcon,
  // Daily check-in states (grounded already mapped above)
  disconnected: cloudIcon,
  'off-track': spiralIcon,
  aligned: starIcon,
  elevated: sparklesIcon,
};

// Onboarding step icons
export const onboardingIcons: Record<string, string> = {
  thriving: sparklesIcon,
  content: blossomIcon,
  stuck: moonIcon,
  overwhelmed: cloudIcon,
  rebuilding: butterflyIcon,
  adapt: leafIcon,
  shutdown: darkMoonIcon,
  overthink: spiralIcon,
  push: flameIcon,
  avoid: cloudIcon,
  healer: plantIcon,
  dreamer: starIcon,
  nurturer: heartIcon,
  transformer: butterflyIcon,
  seeker: crystalBallIcon,
};

// Goal category icons
export const goalCategoryIcons: Record<string, string> = {
  lifestyle: sparklesIcon,
  career: briefcaseIcon,
  wellness: leafIcon,
  travel: planeIcon,
};

// Home quick action icons
export const quickActionIcons: Record<string, string> = {
  journal: pencilIcon,
  routine: sparklesIcon,
  ubi: crystalBallIcon,
  wonder: butterflyIcon,
};

// Shared icon component helper - renders an img tag for a mood icon
export function MoodIcon({ icon, size = 'sm', className = '' }: { icon: string; size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };
  return `<img src="${icon}" class="${sizeClasses[size]} ${className} object-contain" style="filter:none" />`;
}
