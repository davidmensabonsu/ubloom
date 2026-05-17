import {
  Dumbbell, GlassWater, UtensilsCrossed, BookOpen, Pencil, Heart, Bed, Shirt,
  ShoppingCart, Phone, Music, Dog, Pill, Sparkles, Brain, Coffee, Leaf, Camera,
  Bike, Baby, Palette, Plane, Footprints, Laptop, MessageCircleHeart, Sun,
  PiggyBank, Bath, Flower2, GraduationCap, Brush, CookingPot, HandHeart, Smile,
  Gift, Car, Clapperboard, Gamepad2, Mail, Home, Mountain, Waves, Mic, Tent,
  Globe, Flame, Apple, Headphones, Drama, Puzzle, Trophy, MessageCircle,
  Lightbulb, Moon, Stars, Droplet, FlaskConical, Paintbrush, SprayCan, CupSoda,
  Hourglass, Calendar, NotebookPen, Target, Clock as ClockIcon, Trash2, Key,
  Wrench, PartyPopper, Tv, Library, Umbrella, Sunset, Snowflake, Trees,
  Map as MapIcon, Compass, Stethoscope, CreditCard, Receipt, Wallet, Coins,
  Banknote, LineChart, BarChart3, Image as ImageIcon, Video, Lightbulb as LightbulbIcon,
  Wind, Briefcase, Croissant, Wine, Flower, RefreshCw,
  type LucideIcon,
} from 'lucide-react';

import ubloomImg from '@/assets/ubloom-flower.png';

/**
 * Build a public URL for an icon stored in the `routine-icons` bucket.
 * Bucket is the single source of truth for all habit icon images.
 */
const BUCKET_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/routine-icons`;
function b(filename: string): string {
  return `${BUCKET_BASE}/${filename}`;
}

export interface TaskIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
  imageSrc?: string;
}

export const taskIconOptions: TaskIconOption[] = [
  // uBloom (bundled, not in bucket)
  { id: 'ubloom', label: 'uBloom', icon: Sparkles, imageSrc: ubloomImg },

  // ===== Existing icons (now sourced from routine-icons bucket) =====
  { id: 'dumbbell', label: 'Exercise', icon: Dumbbell, imageSrc: b('dumbbell.png') },
  { id: 'glass-water', label: 'Hydration', icon: GlassWater, imageSrc: b('glass-water.png') },
  { id: 'utensils', label: 'Meals', icon: UtensilsCrossed, imageSrc: b('utensils.png') },
  { id: 'book', label: 'Reading', icon: BookOpen, imageSrc: b('book.png') },
  { id: 'pencil', label: 'Writing', icon: Pencil, imageSrc: b('pencil.png') },
  { id: 'heart', label: 'Self-care', icon: Heart, imageSrc: b('heart.png') },
  { id: 'bed', label: 'Sleep', icon: Bed, imageSrc: b('bed.png') },
  { id: 'shirt', label: 'Laundry', icon: Shirt, imageSrc: b('shirt.png') },
  { id: 'cart', label: 'Errands', icon: ShoppingCart, imageSrc: b('cart.png') },
  { id: 'phone', label: 'Calls', icon: Phone, imageSrc: b('phone.png') },
  { id: 'music', label: 'Music', icon: Music, imageSrc: b('music.png') },
  { id: 'dog', label: 'Pets', icon: Dog, imageSrc: b('dog.png') },
  { id: 'pill', label: 'Vitamins', icon: Pill, imageSrc: b('pill.png') },
  { id: 'sparkles', label: 'Beauty', icon: Sparkles, imageSrc: b('sparkles.png') },
  { id: 'brain', label: 'Mindfulness', icon: Brain, imageSrc: b('brain.png') },
  { id: 'coffee', label: 'Coffee', icon: Coffee, imageSrc: b('coffee.png') },
  { id: 'leaf', label: 'Nature', icon: Leaf, imageSrc: b('leaf.png') },
  { id: 'camera', label: 'Photos', icon: Camera, imageSrc: b('camera.png') },
  { id: 'bike', label: 'Cycling', icon: Bike, imageSrc: b('bike.png') },
  { id: 'baby', label: 'Kids', icon: Baby, imageSrc: b('baby.png') },
  { id: 'palette', label: 'Art', icon: Palette, imageSrc: b('palette.png') },
  { id: 'plane', label: 'Travel', icon: Plane, imageSrc: b('plane.png') },
  { id: 'running', label: 'Running', icon: Footprints, imageSrc: b('running.png') },
  { id: 'yoga', label: 'Yoga', icon: Flower2, imageSrc: b('yoga.png') },
  { id: 'cleaning', label: 'Cleaning', icon: Brush, imageSrc: b('cleaning.png') },
  { id: 'bath', label: 'Bath', icon: Bath, imageSrc: b('bath.png') },
  { id: 'plant', label: 'Gardening', icon: Flower2, imageSrc: b('plant.png') },
  { id: 'savings', label: 'Savings', icon: PiggyBank, imageSrc: b('savings.png') },
  { id: 'sun', label: 'Outdoors', icon: Sun, imageSrc: b('sun.png') },
  { id: 'study', label: 'Studying', icon: GraduationCap, imageSrc: b('study.png') },
  { id: 'laptop', label: 'Work', icon: Laptop, imageSrc: b('laptop.png') },
  { id: 'chat', label: 'Social', icon: MessageCircleHeart, imageSrc: b('chat.png') },
  { id: 'cooking', label: 'Cooking', icon: CookingPot, imageSrc: b('cooking.png') },
  { id: 'prayer', label: 'Prayer', icon: HandHeart, imageSrc: b('prayer.png') },
  { id: 'dental', label: 'Dental', icon: Smile, imageSrc: b('dental.png') },
  { id: 'gift', label: 'Gifts', icon: Gift, imageSrc: b('gift.png') },
  { id: 'car', label: 'Driving', icon: Car, imageSrc: b('car.png') },
  { id: 'movie', label: 'Movies', icon: Clapperboard, imageSrc: b('movie.png') },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, imageSrc: b('gaming.png') },
  { id: 'mail', label: 'Mail', icon: Mail, imageSrc: b('mail.png') },
  { id: 'home', label: 'Home', icon: Home, imageSrc: b('home.png') },
  { id: 'hiking', label: 'Hiking', icon: Mountain, imageSrc: b('hiking.png') },
  { id: 'swimming', label: 'Swimming', icon: Waves, imageSrc: b('swimming.png') },
  { id: 'singing', label: 'Singing', icon: Mic, imageSrc: b('singing.png') },
  { id: 'camping', label: 'Camping', icon: Tent, imageSrc: b('camping.png') },
  { id: 'globe', label: 'Languages', icon: Globe, imageSrc: b('globe.png') },
  { id: 'candle', label: 'Relaxation', icon: Flame, imageSrc: b('candle.png') },
  { id: 'fruit', label: 'Nutrition', icon: Apple, imageSrc: b('fruit.png') },
  { id: 'headphones', label: 'Podcasts', icon: Headphones, imageSrc: b('headphones.png') },
  { id: 'dance', label: 'Dance', icon: Drama, imageSrc: b('dance.png') },
  { id: 'puzzle', label: 'Puzzles', icon: Puzzle, imageSrc: b('puzzle.png') },
  { id: 'trophy', label: 'Goals', icon: Trophy, imageSrc: b('trophy.png') },
  { id: 'salad', label: 'Healthy Eating', icon: Apple, imageSrc: b('salad.png') },
  { id: 'cooking-pan', label: 'Cooking Pan', icon: CookingPot, imageSrc: b('cooking-pan.png') },
  { id: 'thought-bubble', label: 'Thoughts', icon: MessageCircle, imageSrc: b('speech-bubble.png') },
  { id: 'lightbulb', label: 'Ideas', icon: Lightbulb, imageSrc: b('lightbulb.png') },
  { id: 'moon', label: 'Moon', icon: Moon, imageSrc: b('moon.png') },
  { id: 'stars', label: 'Stars', icon: Stars, imageSrc: b('moon-stars.png') },
  { id: 'water-bottle', label: 'Water Bottle', icon: GlassWater, imageSrc: b('water-bottle.png') },
  { id: 'water-drop', label: 'Water Drop', icon: Droplet, imageSrc: b('water-drop.png') },
  { id: 'serum', label: 'Skincare', icon: FlaskConical, imageSrc: b('serum.png') },
  { id: 'nail-polish', label: 'Nail Polish', icon: Paintbrush, imageSrc: b('nail-polish.png') },
  { id: 'perfume', label: 'Perfume', icon: SprayCan, imageSrc: b('perfume.png') },
  { id: 'smoothie', label: 'Smoothie', icon: CupSoda, imageSrc: b('smoothie.png') },
  { id: 'teapot', label: 'Tea', icon: Coffee, imageSrc: b('teapot.png') },
  { id: 'hourglass', label: 'Hourglass', icon: Hourglass, imageSrc: b('hourglass.png') },
  { id: 'yoga-mat', label: 'Stretching', icon: Flower2, imageSrc: b('yoga-mat.png') },
  { id: 'calendar', label: 'Calendar', icon: Calendar, imageSrc: b('calendar.png') },
  { id: 'notebook', label: 'Notebook', icon: NotebookPen, imageSrc: b('notebook.png') },
  { id: 'target', label: 'Target', icon: Target, imageSrc: b('target.png') },
  { id: 'clock', label: 'Time', icon: ClockIcon, imageSrc: b('clock.png') },
  { id: 'vacuum', label: 'Vacuum', icon: Brush, imageSrc: b('vacuum.png') },
  { id: 'trash', label: 'Take Out Trash', icon: Trash2, imageSrc: b('trash.png') },
  { id: 'key', label: 'Keys', icon: Key, imageSrc: b('key.png') },
  { id: 'toolbox', label: 'DIY', icon: Wrench, imageSrc: b('toolbox.png') },
  { id: 'coffee-chat', label: 'Coffee Chat', icon: Coffee, imageSrc: b('coffee-chat.png') },
  { id: 'party', label: 'Celebrate', icon: PartyPopper, imageSrc: b('party.png') },
  { id: 'podcast-mic', label: 'Podcasting', icon: Mic, imageSrc: b('podcast-mic.png') },
  { id: 'tv', label: 'TV Time', icon: Tv, imageSrc: b('tv.png') },
  { id: 'book-stack', label: 'Book Club', icon: Library, imageSrc: b('book-stack.png') },
  { id: 'beach', label: 'Beach', icon: Umbrella, imageSrc: b('beach.png') },
  { id: 'sunset', label: 'Sunset', icon: Sunset, imageSrc: b('sunset.png') },
  { id: 'snowflake', label: 'Snow', icon: Snowflake, imageSrc: b('snowflake.png') },
  { id: 'tree', label: 'Tree', icon: Trees, imageSrc: b('tree.png') },
  { id: 'map', label: 'Explore', icon: MapIcon, imageSrc: b('map.png') },
  { id: 'compass', label: 'Adventure', icon: Compass, imageSrc: b('compass-icon.png') },
  { id: 'wall-clock', label: 'Clock', icon: ClockIcon, imageSrc: b('wall-clock.png') },
  { id: 'watch', label: 'Watch', icon: ClockIcon, imageSrc: b('wristwatch.png') },

  // ===== New 30 icons =====
  // Health (7)
  { id: 'health-stethoscope', label: 'Doctor Visit', icon: Stethoscope, imageSrc: b('health-stethoscope.png') },
  { id: 'health-tooth', label: 'Tooth Care', icon: Smile, imageSrc: b('health-tooth.png') },
  { id: 'health-scissors', label: 'Haircut', icon: Sparkles, imageSrc: b('health-scissors.png') },
  { id: 'health-nailfile', label: 'Nail Care', icon: Paintbrush, imageSrc: b('health-nailfile.png') },
  { id: 'health-thermometer', label: 'Temperature', icon: Stethoscope, imageSrc: b('health-thermometer.png') },
  { id: 'health-bandaid', label: 'First Aid', icon: Heart, imageSrc: b('health-bandaid.png') },
  { id: 'health-mirror', label: 'Mirror Check', icon: Sparkles, imageSrc: b('health-mirror.png') },

  // Content Creation (9)
  { id: 'content-filmcamera', label: 'Film Camera', icon: Camera, imageSrc: b('content-filmcamera.png') },
  { id: 'content-clapperboard', label: 'Filming', icon: Clapperboard, imageSrc: b('content-clapperboard.png') },
  { id: 'content-phonepost', label: 'Posting', icon: ImageIcon, imageSrc: b('content-phonepost.png') },
  { id: 'content-analytics', label: 'Analytics', icon: BarChart3, imageSrc: b('content-analytics.png') },
  { id: 'content-visionboard', label: 'Vision Board', icon: ImageIcon, imageSrc: b('content-visionboard.png') },
  { id: 'content-monthlyreset', label: 'Monthly Reset', icon: RefreshCw, imageSrc: b('content-monthlyreset.png') },
  { id: 'content-ringlight', label: 'Ring Light', icon: LightbulbIcon, imageSrc: b('content-ringlight.png') },
  { id: 'content-microphone', label: 'Recording', icon: Mic, imageSrc: b('content-microphone.png') },
  { id: 'content-laptopvideo', label: 'Editing', icon: Video, imageSrc: b('content-laptopvideo.png') },

  // Finance (7)
  { id: 'finance-creditcard', label: 'Card Spending', icon: CreditCard, imageSrc: b('finance-creditcard.png') },
  { id: 'finance-piggybank', label: 'Save Money', icon: PiggyBank, imageSrc: b('finance-piggybank.png') },
  { id: 'finance-receipt', label: 'Receipts', icon: Receipt, imageSrc: b('finance-receipt.png') },
  { id: 'finance-wallet', label: 'Wallet', icon: Wallet, imageSrc: b('finance-wallet.png') },
  { id: 'finance-coins', label: 'Coins', icon: Coins, imageSrc: b('finance-coins.png') },
  { id: 'finance-banknote', label: 'Cash', icon: Banknote, imageSrc: b('finance-banknote.png') },
  { id: 'finance-chart', label: 'Budget Chart', icon: LineChart, imageSrc: b('finance-chart.png') },

  // Soft Life (7)
  { id: 'softlife-croissant', label: 'Pastry', icon: Croissant, imageSrc: b('softlife-croissant.png') },
  { id: 'softlife-wine', label: 'Wine Night', icon: Wine, imageSrc: b('softlife-wine.png') },
  { id: 'softlife-flowers', label: 'Fresh Flowers', icon: Flower, imageSrc: b('softlife-flowers.png') },
  { id: 'softlife-suitcase', label: 'Weekend Trip', icon: Briefcase, imageSrc: b('softlife-suitcase.png') },
  { id: 'softlife-rest', label: 'Deep Rest', icon: Bed, imageSrc: b('softlife-rest.png') },
  { id: 'softlife-spa', label: 'Spa Day', icon: Flower, imageSrc: b('softlife-spa.png') },
  { id: 'softlife-massage', label: 'Massage', icon: HandHeart, imageSrc: b('softlife-massage.png') },
];

export interface IconCategory {
  label: string;
  iconIds: string[];
}

export const iconCategories: IconCategory[] = [
  {
    label: 'uBloom',
    iconIds: ['ubloom'],
  },
  {
    label: 'Health & Fitness',
    iconIds: ['dumbbell', 'running', 'bike', 'yoga', 'yoga-mat', 'swimming', 'hiking', 'dance', 'glass-water', 'water-bottle', 'water-drop', 'smoothie', 'pill', 'dental', 'fruit', 'health-stethoscope', 'health-tooth', 'health-thermometer', 'health-bandaid', 'health-scissors', 'health-nailfile', 'health-mirror'],
  },
  {
    label: 'Wellness & Self-care',
    iconIds: ['heart', 'brain', 'sparkles', 'bath', 'candle', 'bed', 'prayer', 'coffee', 'teapot', 'serum', 'nail-polish', 'perfume', 'moon', 'stars', 'hourglass'],
  },
  {
    label: 'Soft Life',
    iconIds: ['softlife-croissant', 'softlife-wine', 'softlife-flowers', 'softlife-suitcase', 'softlife-rest', 'softlife-spa', 'softlife-massage'],
  },
  {
    label: 'Content Creation',
    iconIds: ['content-filmcamera', 'content-clapperboard', 'content-phonepost', 'content-analytics', 'content-visionboard', 'content-monthlyreset', 'content-ringlight', 'content-microphone', 'content-laptopvideo'],
  },
  {
    label: 'Finance',
    iconIds: ['finance-creditcard', 'finance-piggybank', 'finance-receipt', 'finance-wallet', 'finance-coins', 'finance-banknote', 'finance-chart', 'savings'],
  },
  {
    label: 'Work & Learning',
    iconIds: ['laptop', 'study', 'book', 'book-stack', 'notebook', 'pencil', 'calendar', 'clock', 'wall-clock', 'watch', 'target', 'globe', 'puzzle', 'trophy', 'lightbulb', 'thought-bubble'],
  },
  {
    label: 'Home & Daily',
    iconIds: ['home', 'cooking', 'cooking-pan', 'utensils', 'salad', 'cleaning', 'vacuum', 'trash', 'shirt', 'cart', 'car', 'key', 'toolbox', 'plant'],
  },
  {
    label: 'Social & Entertainment',
    iconIds: ['chat', 'phone', 'mail', 'coffee-chat', 'party', 'music', 'headphones', 'podcast-mic', 'movie', 'tv', 'gaming', 'singing', 'camera', 'gift'],
  },
  {
    label: 'Outdoors & Adventure',
    iconIds: ['sun', 'sunset', 'snowflake', 'leaf', 'tree', 'plane', 'map', 'compass', 'beach', 'camping', 'dog', 'baby', 'palette'],
  },
];

const iconMap = new Map(taskIconOptions.map((o) => [o.id, o]));

export function getTaskIcon(id: string): TaskIconOption | undefined {
  return iconMap.get(id);
}

/**
 * Search keywords/synonyms per icon. Each entry expands what a user can type
 * to find the icon (label + id are always searched too).
 */
const iconKeywords: Record<string, string[]> = {
  ubloom: ['flower', 'bloom', 'lotus', 'logo'],
  dumbbell: ['exercise', 'gym', 'workout', 'weights', 'lift', 'strength', 'fitness'],
  running: ['run', 'jog', 'cardio', 'sprint', 'marathon', 'feet', 'steps', 'walk'],
  bike: ['bicycle', 'cycle', 'cycling', 'ride', 'spin', 'commute'],
  yoga: ['yoga', 'flexibility', 'pose', 'mindful movement', 'pilates', 'flower'],
  'yoga-mat': ['yoga', 'mat', 'stretch', 'stretching', 'pilates', 'mobility', 'floor'],
  swimming: ['swim', 'pool', 'water', 'waves', 'ocean', 'cardio'],
  hiking: ['hike', 'mountain', 'trail', 'walk', 'outdoors', 'nature', 'climb'],
  dance: ['dance', 'dancing', 'choreography', 'movement', 'ballet', 'cardio'],
  'glass-water': ['water', 'drink', 'hydrate', 'hydration', 'glass', 'cup'],
  'water-bottle': ['water', 'bottle', 'drink', 'hydrate', 'hydration', 'flask'],
  'water-drop': ['water', 'drop', 'droplet', 'hydrate', 'hydration', 'liquid', 'rain'],
  smoothie: ['smoothie', 'shake', 'blender', 'juice', 'drink', 'protein', 'breakfast'],
  pill: ['pill', 'vitamin', 'vitamins', 'medication', 'meds', 'supplement', 'medicine', 'tablet'],
  dental: ['dental', 'teeth', 'tooth', 'brush', 'floss', 'smile', 'mouth'],
  fruit: ['fruit', 'apple', 'nutrition', 'healthy', 'snack', 'eat'],
  heart: ['heart', 'love', 'self-care', 'self love', 'care', 'kind'],
  brain: ['brain', 'mind', 'mindful', 'mindfulness', 'meditation', 'think', 'thought', 'mental'],
  sparkles: ['beauty', 'sparkle', 'shine', 'glow', 'magic', 'glam'],
  bath: ['bath', 'shower', 'soak', 'tub', 'bathe', 'self-care', 'relax'],
  candle: ['candle', 'relax', 'relaxation', 'calm', 'aroma', 'flame', 'cozy', 'evening'],
  bed: ['bed', 'sleep', 'rest', 'nap', 'bedtime', 'night', 'pillow'],
  prayer: ['prayer', 'pray', 'gratitude', 'spiritual', 'faith', 'hands', 'devotion'],
  coffee: ['coffee', 'caffeine', 'morning', 'cup', 'mug', 'espresso', 'latte'],
  teapot: ['tea', 'teapot', 'kettle', 'hot drink', 'herbal', 'morning', 'brew', 'time'],
  serum: ['skincare', 'serum', 'dropper', 'beauty', 'face', 'routine', 'oil'],
  'nail-polish': ['nail', 'nails', 'polish', 'manicure', 'pedicure', 'beauty'],
  perfume: ['perfume', 'fragrance', 'scent', 'spray', 'cologne', 'beauty'],
  moon: ['moon', 'night', 'evening', 'sleep', 'dream', 'lunar', 'bedtime'],
  stars: ['stars', 'star', 'night', 'dream', 'wish', 'sparkle', 'sky'],
  hourglass: ['hourglass', 'time', 'timer', 'sand', 'wait', 'patience', 'minutes', 'clock'],
  laptop: ['laptop', 'work', 'computer', 'desk', 'office', 'job', 'remote'],
  study: ['study', 'studying', 'school', 'graduation', 'learn', 'university', 'exam', 'class'],
  book: ['book', 'read', 'reading', 'novel', 'literature', 'story'],
  'book-stack': ['books', 'reading', 'book club', 'library', 'stack', 'literature', 'study'],
  notebook: ['notebook', 'journal', 'diary', 'write', 'notes', 'planner'],
  pencil: ['pencil', 'write', 'writing', 'draw', 'note', 'sketch', 'journal'],
  calendar: ['calendar', 'schedule', 'date', 'planner', 'agenda', 'plan', 'event', 'time'],
  clock: ['clock', 'time', 'alarm', 'timer', 'schedule', 'morning', 'wake', 'minutes', 'hour'],
  'wall-clock': ['wall clock', 'clock', 'time', 'alarm', 'timer', 'schedule', 'morning', 'wake', 'minutes', 'hour', 'wall'],
  watch: ['watch', 'wristwatch', 'time', 'clock', 'wrist', 'timer', 'minutes', 'hour', 'accessory'],
  target: ['target', 'goal', 'goals', 'aim', 'focus', 'objective', 'bullseye'],
  globe: ['globe', 'world', 'language', 'languages', 'travel', 'earth', 'international'],
  puzzle: ['puzzle', 'brain', 'game', 'logic', 'solve', 'problem'],
  trophy: ['trophy', 'goal', 'goals', 'win', 'achievement', 'success', 'reward', 'medal'],
  savings: ['savings', 'save', 'money', 'finance', 'budget', 'piggy bank', 'cash'],
  lightbulb: ['lightbulb', 'idea', 'ideas', 'inspiration', 'creative', 'think', 'innovation'],
  'thought-bubble': ['thought', 'thoughts', 'think', 'reflect', 'idea', 'speech', 'bubble', 'mind'],
  home: ['home', 'house', 'household', 'family', 'place'],
  cooking: ['cook', 'cooking', 'kitchen', 'meal', 'food', 'recipe', 'pot'],
  'cooking-pan': ['cook', 'cooking', 'pan', 'kitchen', 'fry', 'meal', 'food'],
  utensils: ['utensils', 'meal', 'eat', 'dinner', 'lunch', 'fork', 'knife', 'food'],
  salad: ['salad', 'healthy', 'food', 'eat', 'nutrition', 'veggie', 'greens', 'lunch'],
  cleaning: ['clean', 'cleaning', 'tidy', 'brush', 'chores', 'housework', 'scrub'],
  vacuum: ['vacuum', 'clean', 'cleaning', 'hoover', 'chores', 'floor', 'housework'],
  trash: ['trash', 'rubbish', 'garbage', 'bin', 'waste', 'chores', 'recycle'],
  shirt: ['shirt', 'laundry', 'clothes', 'wash', 'fold', 'wardrobe'],
  cart: ['cart', 'shop', 'shopping', 'errands', 'grocery', 'groceries', 'store'],
  car: ['car', 'drive', 'driving', 'commute', 'travel', 'vehicle'],
  key: ['key', 'keys', 'lock', 'home', 'house', 'unlock', 'door'],
  toolbox: ['toolbox', 'tools', 'diy', 'fix', 'repair', 'handy', 'home'],
  plant: ['plant', 'garden', 'gardening', 'flower', 'green', 'grow', 'nature'],
  chat: ['chat', 'social', 'message', 'talk', 'connect', 'friends', 'conversation'],
  phone: ['phone', 'call', 'calls', 'ring', 'mobile', 'contact'],
  mail: ['mail', 'email', 'letter', 'inbox', 'post', 'message'],
  'coffee-chat': ['coffee', 'chat', 'meet', 'friends', 'catch up', 'date', 'cafe', 'social'],
  party: ['party', 'celebrate', 'celebration', 'confetti', 'birthday', 'fun', 'event'],
  music: ['music', 'song', 'note', 'melody', 'tunes', 'audio'],
  headphones: ['headphones', 'podcast', 'music', 'listen', 'audio', 'audiobook'],
  'podcast-mic': ['podcast', 'mic', 'microphone', 'record', 'voice', 'broadcast', 'audio'],
  movie: ['movie', 'film', 'cinema', 'watch', 'theater', 'show'],
  tv: ['tv', 'television', 'watch', 'show', 'series', 'screen', 'binge'],
  gaming: ['gaming', 'game', 'play', 'video game', 'console', 'controller'],
  singing: ['sing', 'singing', 'voice', 'karaoke', 'mic', 'choir', 'song'],
  camera: ['camera', 'photo', 'photos', 'photography', 'picture', 'snap'],
  gift: ['gift', 'present', 'birthday', 'celebrate', 'give', 'surprise'],
  sun: ['sun', 'sunny', 'outdoors', 'morning', 'light', 'warm', 'day'],
  sunset: ['sunset', 'evening', 'sunrise', 'dusk', 'sky', 'horizon', 'golden hour'],
  snowflake: ['snow', 'snowflake', 'winter', 'cold', 'ice', 'frost'],
  leaf: ['leaf', 'nature', 'green', 'plant', 'eco', 'fall', 'autumn'],
  tree: ['tree', 'nature', 'forest', 'park', 'outdoors', 'green'],
  plane: ['plane', 'travel', 'fly', 'flight', 'trip', 'vacation', 'holiday', 'airport'],
  map: ['map', 'explore', 'navigate', 'travel', 'route', 'trip', 'location', 'directions'],
  compass: ['compass', 'adventure', 'navigate', 'direction', 'explore', 'travel', 'north'],
  beach: ['beach', 'sea', 'ocean', 'sand', 'umbrella', 'vacation', 'summer', 'holiday'],
  camping: ['camping', 'tent', 'outdoors', 'nature', 'campfire', 'wilderness', 'trip'],
  dog: ['dog', 'pet', 'pets', 'puppy', 'walk', 'animal'],
  baby: ['baby', 'kids', 'child', 'children', 'family', 'parenting', 'newborn'],
  palette: ['palette', 'art', 'paint', 'creative', 'colors', 'craft', 'design'],
  // Health (new)
  'health-stethoscope': ['stethoscope', 'doctor', 'checkup', 'appointment', 'health', 'medical', 'visit'],
  'health-tooth': ['tooth', 'teeth', 'dentist', 'dental', 'brush', 'cleaning', 'smile'],
  'health-scissors': ['scissors', 'haircut', 'hair', 'trim', 'cut', 'salon', 'barber', 'grooming'],
  'health-nailfile': ['nail', 'nails', 'file', 'manicure', 'pedicure', 'grooming', 'beauty'],
  'health-thermometer': ['thermometer', 'temperature', 'fever', 'sick', 'health', 'check'],
  'health-bandaid': ['bandaid', 'plaster', 'first aid', 'injury', 'heal', 'cut', 'care'],
  'health-mirror': ['mirror', 'check', 'reflection', 'glow', 'self-check', 'beauty', 'grooming'],
  // Content (new)
  'content-filmcamera': ['film', 'camera', 'video', 'shoot', 'create', 'vlog', 'reel'],
  'content-clapperboard': ['filming', 'clapperboard', 'shoot', 'video', 'action', 'film', 'scene'],
  'content-phonepost': ['post', 'social', 'instagram', 'tiktok', 'phone', 'share', 'upload'],
  'content-analytics': ['analytics', 'stats', 'metrics', 'numbers', 'growth', 'chart', 'data', 'review'],
  'content-visionboard': ['vision', 'board', 'moodboard', 'goals', 'inspo', 'inspiration', 'plan'],
  'content-monthlyreset': ['monthly', 'reset', 'review', 'reflect', 'reset month', 'refresh', 'plan'],
  'content-ringlight': ['ring light', 'light', 'lighting', 'film', 'setup', 'shoot', 'video'],
  'content-microphone': ['microphone', 'mic', 'podcast', 'record', 'voice', 'audio', 'studio'],
  'content-laptopvideo': ['edit', 'editing', 'video', 'laptop', 'cut', 'post-production', 'create'],
  // Finance (new)
  'finance-creditcard': ['credit card', 'card', 'spend', 'spending', 'payment', 'finance', 'money'],
  'finance-piggybank': ['piggy bank', 'save', 'savings', 'money', 'budget', 'finance'],
  'finance-receipt': ['receipt', 'expense', 'track', 'spending', 'budget', 'finance', 'log'],
  'finance-wallet': ['wallet', 'cash', 'money', 'finance', 'budget', 'spending'],
  'finance-coins': ['coins', 'money', 'change', 'cash', 'save', 'finance'],
  'finance-banknote': ['banknote', 'cash', 'bill', 'money', 'finance', 'budget'],
  'finance-chart': ['budget chart', 'finance', 'growth', 'invest', 'investing', 'money', 'wealth'],
  // Soft Life
  'softlife-croissant': ['croissant', 'pastry', 'breakfast', 'cafe', 'treat', 'bakery', 'soft life'],
  'softlife-wine': ['wine', 'glass', 'drink', 'night', 'unwind', 'soft life', 'cheers'],
  'softlife-flowers': ['flowers', 'bouquet', 'fresh', 'romance', 'self gift', 'soft life'],
  'softlife-suitcase': ['suitcase', 'trip', 'travel', 'weekend', 'getaway', 'vacation', 'soft life'],
  'softlife-rest': ['rest', 'nap', 'eye mask', 'sleep', 'recharge', 'cozy', 'soft life'],
  'softlife-spa': ['spa', 'towel', 'pamper', 'self care', 'wellness', 'soft life'],
  'softlife-massage': ['massage', 'spa', 'relax', 'unwind', 'body', 'self care', 'soft life'],
};

/** Search across id, label and curated keywords. Returns matching options in their declared order. */
export function searchTaskIcons(query: string): TaskIconOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return taskIconOptions;
  const terms = q.split(/\s+/).filter(Boolean);
  return taskIconOptions.filter((opt) => {
    const haystack = [
      opt.id.toLowerCase().replace(/-/g, ' '),
      opt.label.toLowerCase(),
      ...(iconKeywords[opt.id] || []),
    ].join(' | ');
    return terms.every((t) => haystack.includes(t));
  });
}

/** Render helper: returns an <img> if clay icon exists, else renders LucideIcon */
export function renderTaskIcon(opt: TaskIconOption, size: number = 14) {
  if (opt.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain" loading="lazy" style={{ width: size + 10, height: size + 10 }} />;
  }
  const IconComp = opt.icon;
  return <IconComp size={size} strokeWidth={2.5} />;
}
