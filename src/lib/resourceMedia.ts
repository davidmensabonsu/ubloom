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

/** YouTube video IDs for exercise / video-type resources */
export const resourceVideos: Record<string, string> = {
  'fit-1': 'g_tea8ZNtKA',  // 10-min morning stretch
  'fit-3': 'K56Z12XNQ5c',  // Pilates for posture
  'fit-5': 'sTANio_2E0Q',  // 20-min yoga flow
  'fit-6': 'U9ENCkaYmEE',  // Strength training basics
  'calm-8': 'CyFSAz_eYyU', // Nervous system reset
  'mind-8': 'iCvmsMzlF7o',  // Brené Brown — Power of Vulnerability
};
