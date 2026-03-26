// Detail images
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

// Thumbnails
import thumbMountain from '@/assets/wonder/thumb-mountain-meditation.jpg';
import thumbMirror from '@/assets/wonder/thumb-mirror-affirmation.jpg';
import thumbJournal from '@/assets/wonder/thumb-journaling.jpg';
import thumbDryBrush from '@/assets/wonder/thumb-dry-brushing.jpg';
import thumbSleep from '@/assets/wonder/thumb-sleep.jpg';
import thumbGuaSha from '@/assets/wonder/thumb-gua-sha.jpg';
import thumbDigital from '@/assets/wonder/thumb-digital-sunset.jpg';
import thumbWalk from '@/assets/wonder/thumb-walk.jpg';
import thumbDance from '@/assets/wonder/thumb-dance.jpg';
import thumbTidy from '@/assets/wonder/thumb-tidy.jpg';
import thumbSunday from '@/assets/wonder/thumb-sunday-reset.jpg';
import thumbPhoneFree from '@/assets/wonder/thumb-phone-free.jpg';
import thumbBreathing from '@/assets/wonder/thumb-breathing.jpg';
import thumbBodyScan from '@/assets/wonder/thumb-body-scan.jpg';
import thumbGrounding from '@/assets/wonder/thumb-grounding.jpg';
import thumbCapsule from '@/assets/wonder/thumb-capsule-wardrobe.jpg';
import thumbGratitude from '@/assets/wonder/thumb-gratitude.jpg';
import thumbVagus from '@/assets/wonder/thumb-vagus.jpg';
import thumbColdSplash from '@/assets/wonder/thumb-cold-splash.jpg';
import thumbJournalingCalm from '@/assets/wonder/thumb-journaling-calm.jpg';
import thumbProgressiveRelaxation from '@/assets/wonder/thumb-progressive-relaxation.jpg';
import thumbReframing from '@/assets/wonder/thumb-reframing.jpg';

// Meal thumbnails
import mealOvernightOats from '@/assets/wonder/meal-overnight-oats.jpg';
import mealAvocadoToast from '@/assets/wonder/meal-avocado-toast.jpg';
import mealSmoothieBowl from '@/assets/wonder/meal-smoothie-bowl.jpg';
import mealProbioticBowl from '@/assets/wonder/meal-probiotic-bowl.jpg';
import mealQuinoaBowl from '@/assets/wonder/meal-quinoa-bowl.jpg';
import mealMedWrap from '@/assets/wonder/meal-med-wrap.jpg';
import mealMisoSoup from '@/assets/wonder/meal-miso-soup.jpg';
import mealTurmericBowl from '@/assets/wonder/meal-turmeric-bowl.jpg';
import mealSalmon from '@/assets/wonder/meal-salmon.jpg';
import mealStirfry from '@/assets/wonder/meal-stirfry.jpg';
import mealLentilCurry from '@/assets/wonder/meal-lentil-curry.jpg';
import mealBakedCod from '@/assets/wonder/meal-baked-cod.jpg';
import mealEnergyBalls from '@/assets/wonder/meal-energy-balls.jpg';
import mealFruitPlate from '@/assets/wonder/meal-fruit-plate.jpg';
import mealGreenSmoothie from '@/assets/wonder/meal-green-smoothie.jpg';
import mealHummusVeggies from '@/assets/wonder/meal-hummus-veggies.jpg';

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

/** Thumbnail images for resource cards in the grid */
export const resourceThumbnails: Record<string, string> = {
  // Mindset
  'mind-1': thumbMountain,
  'mind-2': bookBadass,
  'mind-3': thumbMirror,
  'mind-4': bookImperfection,
  'mind-5': thumbJournal,
  'mind-6': bookAtomic,
  'mind-7': thumbJournal,
  'mind-8': videoVulnerability.url,
  // Wellness
  'well-1': thumbDryBrush,
  'well-2': thumbBreathing, // reuse zen stones for cold splash
  'well-3': thumbSleep,
  'well-4': bookBodyScore,
  'well-5': thumbGuaSha,
  'well-6': thumbDigital,
  // Fitness
  'fit-1': videoMorningStretch.url,
  'fit-2': thumbWalk,
  'fit-3': videoPilates.url,
  'fit-4': thumbDance,
  'fit-5': videoYoga.url,
  'fit-6': videoStrength.url,
  // Nutrition
  'nutr-1': lemonWater,
  'nutr-2': magnesium,
  'nutr-3': omega3,
  'nutr-4': gutFoods,
  'nutr-5': vitaminD,
  'nutr-6': hydration,
  'nutr-7': antiInflammatory,
  // Lifestyle
  'life-1': thumbTidy,
  'life-2': thumbSunday,
  'life-3': bookSlowLiving,
  'life-4': thumbPhoneFree,
  'life-5': thumbGratitude,
  'life-6': thumbCapsule,
  // Calm
  'calm-1': thumbBreathing,
  'calm-2': thumbBodyScan,
  'calm-3': thumbVagus,
  'calm-4': bookUntethered,
  'calm-5': thumbGrounding,
  'calm-6': thumbBodyScan,
  'calm-7': thumbJournal,
  'calm-8': videoNervousReset.url,
  // Meals
  'meal-1': mealOvernightOats,
  'meal-2': mealAvocadoToast,
  'meal-3': mealSmoothieBowl,
  'meal-4': mealProbioticBowl,
  'meal-5': mealQuinoaBowl,
  'meal-6': mealMedWrap,
  'meal-7': mealMisoSoup,
  'meal-8': mealTurmericBowl,
  'meal-9': mealSalmon,
  'meal-10': mealStirfry,
  'meal-11': mealLentilCurry,
  'meal-12': mealBakedCod,
  'meal-13': mealEnergyBalls,
  'meal-14': mealFruitPlate,
  'meal-15': mealGreenSmoothie,
  'meal-16': mealHummusVeggies,
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
