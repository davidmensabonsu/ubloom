// Images
import lemonWater from '@/assets/wonder/lemon-water.jpg';
import gutFoods from '@/assets/wonder/gut-foods.jpg';
import antiInflammatory from '@/assets/wonder/anti-inflammatory.jpg';
import hydration from '@/assets/wonder/hydration.jpg';
import magnesium from '@/assets/wonder/magnesium.jpg';
import omega3 from '@/assets/wonder/omega3.jpg';
import vitaminD from '@/assets/wonder/vitamin-d.jpg';
import bookBadass from '@/assets/wonder/book-badass.jpg';
import bookImperfection from '@/assets/wonder/book-imperfection.jpg';
import bookAtomic from '@/assets/wonder/book-atomic.jpg';
import bookBodyScore from '@/assets/wonder/book-body-score.jpg';
import bookSlowLiving from '@/assets/wonder/book-slow-living.jpg';
import bookUntethered from '@/assets/wonder/book-untethered.jpg';

// Videos (CDN asset pointers)
import videoMorningStretch from '@/assets/wonder/video-morning-stretch.mp4.asset.json';
import videoPilates from '@/assets/wonder/video-pilates.mp4.asset.json';
import videoYoga from '@/assets/wonder/video-yoga.mp4.asset.json';
import videoStrength from '@/assets/wonder/video-strength.mp4.asset.json';
import videoNervousReset from '@/assets/wonder/video-nervous-reset.mp4.asset.json';
import videoVulnerability from '@/assets/wonder/video-vulnerability.mp4.asset.json';

/** Static image to show in the resource detail sheet */
export const resourceImages: Record<string, string> = {
  // Nutrition
  'nutr-1': lemonWater,
  'nutr-4': gutFoods,
  'nutr-7': antiInflammatory,
  'nutr-6': hydration,
  'nutr-2': magnesium,
  'nutr-3': omega3,
  'nutr-5': vitaminD,
  // Books
  'mind-2': bookBadass,
  'mind-4': bookImperfection,
  'mind-6': bookAtomic,
  'well-4': bookBodyScore,
  'life-3': bookSlowLiving,
  'calm-4': bookUntethered,
};

/** AI-generated demo videos for exercise / video-type resources */
export const resourceVideos: Record<string, string> = {
  'fit-1': videoMorningStretch.url,
  'fit-3': videoPilates.url,
  'fit-5': videoYoga.url,
  'fit-6': videoStrength.url,
  'calm-8': videoNervousReset.url,
  'mind-8': videoVulnerability.url,
};
