import {
  Dumbbell,
  GlassWater,
  UtensilsCrossed,
  BookOpen,
  Pencil,
  Heart,
  Bed,
  Shirt,
  ShoppingCart,
  Phone,
  Music,
  Dog,
  Pill,
  Sparkles,
  Brain,
  Coffee,
  Leaf,
  Camera,
  Bike,
  Baby,
  Palette,
  Plane,
  Footprints,
  Laptop,
  MessageCircleHeart,
  Sun,
  PiggyBank,
  Bath,
  Flower2,
  GraduationCap,
  Brush,
  CookingPot,
  HandHeart,
  Smile,
  Gift,
  Car,
  Clapperboard,
  Gamepad2,
  Mail,
  Home,
  Mountain,
  Waves,
  Mic,
  Tent,
  Globe,
  Flame,
  Apple,
  Headphones,
  Drama,
  Puzzle,
  Trophy,
  MessageCircle,
  Lightbulb,
  Moon,
  Stars,
  Droplet,
  FlaskConical,
  Paintbrush,
  SprayCan,
  CupSoda,
  Hourglass,
  Calendar,
  NotebookPen,
  Target,
  Clock as ClockIcon,
  Trash2,
  Key,
  Wrench,
  PartyPopper,
  Tv,
  Library,
  Umbrella,
  Sunset,
  Snowflake,
  Trees,
  Map as MapIcon,
  Compass,
  type LucideIcon,
} from 'lucide-react';

import dumbbellImg from '@/assets/icons/dumbbell.png';
import glassWaterImg from '@/assets/icons/glass-water.png';
import utensilsImg from '@/assets/icons/utensils.png';
import bookImg from '@/assets/icons/book.png';
import pencilImg from '@/assets/icons/pencil.png';
import heartImg from '@/assets/icons/heart.png';
import bedImg from '@/assets/icons/bed.png';
import pillImg from '@/assets/icons/pill.png';
import brainImg from '@/assets/icons/brain.png';
import coffeeImg from '@/assets/icons/coffee.png';
import sparklesImg from '@/assets/icons/sparkles.png';
import leafImg from '@/assets/icons/leaf.png';
import dogImg from '@/assets/icons/dog.png';
import musicImg from '@/assets/icons/music.png';
import bikeImg from '@/assets/icons/bike.png';
import runningImg from '@/assets/icons/running.png';
import shirtImg from '@/assets/icons/shirt.png';
import cartImg from '@/assets/icons/cart.png';
import phoneImg from '@/assets/icons/phone.png';
import cameraImg from '@/assets/icons/camera.png';
import babyImg from '@/assets/icons/baby.png';
import paletteImg from '@/assets/icons/palette.png';
import planeImg from '@/assets/icons/plane.png';
import yogaImg from '@/assets/icons/yoga.png';
import cleaningImg from '@/assets/icons/cleaning.png';
import bathImg from '@/assets/icons/bath.png';
import plantImg from '@/assets/icons/plant.png';
import savingsImg from '@/assets/icons/savings.png';
import sunImg from '@/assets/icons/sun.png';
import studyImg from '@/assets/icons/study.png';
import laptopImg from '@/assets/icons/laptop.png';
import chatImg from '@/assets/icons/chat.png';
import cookingImg from '@/assets/icons/cooking.png';
import prayerImg from '@/assets/icons/prayer.png';
import dentalImg from '@/assets/icons/dental.png';
import giftImg from '@/assets/icons/gift.png';
import carImg from '@/assets/icons/car.png';
import movieImg from '@/assets/icons/movie.png';
import gamingImg from '@/assets/icons/gaming.png';
import mailImg from '@/assets/icons/mail.png';
import homeImg from '@/assets/icons/home.png';
import hikingImg from '@/assets/icons/hiking.png';
import swimmingImg from '@/assets/icons/swimming.png';
import singingImg from '@/assets/icons/singing.png';
import campingImg from '@/assets/icons/camping.png';
import globeImg from '@/assets/icons/globe.png';
import candleImg from '@/assets/icons/candle.png';
import fruitImg from '@/assets/icons/fruit.png';
import headphonesImg from '@/assets/icons/headphones.png';
import danceImg from '@/assets/icons/dance.png';
import puzzleImg from '@/assets/icons/puzzle.png';
import trophyImg from '@/assets/icons/trophy.png';
import ubloomImg from '@/assets/ubloom-flower.png';
import saladImg from '@/assets/icons/salad.png';
import cookingPanImg from '@/assets/icons/cooking-pan.png';
import speechBubbleImg from '@/assets/icons/speech-bubble.png';
import lightbulbImg from '@/assets/icons/lightbulb.png';
import moonImg from '@/assets/icons/moon.png';
import moonStarsImg from '@/assets/icons/moon-stars.png';
import waterBottleImg from '@/assets/icons/water-bottle.png';
import waterDropImg from '@/assets/icons/water-drop.png';
import serumImg from '@/assets/icons/serum.png';
import nailPolishImg from '@/assets/icons/nail-polish.png';
import perfumeImg from '@/assets/icons/perfume.png';
import smoothieImg from '@/assets/icons/smoothie.png';
import teapotImg from '@/assets/icons/teapot.png';
import hourglassImg from '@/assets/icons/hourglass.png';
import yogaMatImg from '@/assets/icons/yoga-mat.png';
import calendarImg from '@/assets/icons/calendar.png';
import notebookImg from '@/assets/icons/notebook.png';
import targetImg from '@/assets/icons/target.png';
import clockImg from '@/assets/icons/clock.png';
import vacuumImg from '@/assets/icons/vacuum.png';
import trashImg from '@/assets/icons/trash.png';
import keyImg from '@/assets/icons/key.png';
import toolboxImg from '@/assets/icons/toolbox.png';
import coffeeChatImg from '@/assets/icons/coffee-chat.png';
import partyImg from '@/assets/icons/party.png';
import podcastMicImg from '@/assets/icons/podcast-mic.png';
import tvImg from '@/assets/icons/tv.png';
import bookStackImg from '@/assets/icons/book-stack.png';
import beachImg from '@/assets/icons/beach.png';
import sunsetImg from '@/assets/icons/sunset.png';
import snowflakeImg from '@/assets/icons/snowflake.png';
import treeImg from '@/assets/icons/tree.png';
import mapImg from '@/assets/icons/map.png';
import compassImg from '@/assets/icons/compass-icon.png';

export interface TaskIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
  imageSrc?: string;
}

export const taskIconOptions: TaskIconOption[] = [
  { id: 'ubloom', label: 'ubloom', icon: Sparkles, imageSrc: ubloomImg },
  { id: 'dumbbell', label: 'Exercise', icon: Dumbbell, imageSrc: dumbbellImg },
  { id: 'glass-water', label: 'Hydration', icon: GlassWater, imageSrc: glassWaterImg },
  { id: 'utensils', label: 'Meals', icon: UtensilsCrossed, imageSrc: utensilsImg },
  { id: 'book', label: 'Reading', icon: BookOpen, imageSrc: bookImg },
  { id: 'pencil', label: 'Writing', icon: Pencil, imageSrc: pencilImg },
  { id: 'heart', label: 'Self-care', icon: Heart, imageSrc: heartImg },
  { id: 'bed', label: 'Sleep', icon: Bed, imageSrc: bedImg },
  { id: 'shirt', label: 'Laundry', icon: Shirt, imageSrc: shirtImg },
  { id: 'cart', label: 'Errands', icon: ShoppingCart, imageSrc: cartImg },
  { id: 'phone', label: 'Calls', icon: Phone, imageSrc: phoneImg },
  { id: 'music', label: 'Music', icon: Music, imageSrc: musicImg },
  { id: 'dog', label: 'Pets', icon: Dog, imageSrc: dogImg },
  { id: 'pill', label: 'Vitamins', icon: Pill, imageSrc: pillImg },
  { id: 'sparkles', label: 'Beauty', icon: Sparkles, imageSrc: sparklesImg },
  { id: 'brain', label: 'Mindfulness', icon: Brain, imageSrc: brainImg },
  { id: 'coffee', label: 'Coffee', icon: Coffee, imageSrc: coffeeImg },
  { id: 'leaf', label: 'Nature', icon: Leaf, imageSrc: leafImg },
  { id: 'camera', label: 'Photos', icon: Camera, imageSrc: cameraImg },
  { id: 'bike', label: 'Cycling', icon: Bike, imageSrc: bikeImg },
  { id: 'baby', label: 'Kids', icon: Baby, imageSrc: babyImg },
  { id: 'palette', label: 'Art', icon: Palette, imageSrc: paletteImg },
  { id: 'plane', label: 'Travel', icon: Plane, imageSrc: planeImg },
  { id: 'running', label: 'Running', icon: Footprints, imageSrc: runningImg },
  { id: 'yoga', label: 'Yoga', icon: Flower2, imageSrc: yogaImg },
  { id: 'cleaning', label: 'Cleaning', icon: Brush, imageSrc: cleaningImg },
  { id: 'bath', label: 'Bath', icon: Bath, imageSrc: bathImg },
  { id: 'plant', label: 'Gardening', icon: Flower2, imageSrc: plantImg },
  { id: 'savings', label: 'Savings', icon: PiggyBank, imageSrc: savingsImg },
  { id: 'sun', label: 'Outdoors', icon: Sun, imageSrc: sunImg },
  { id: 'study', label: 'Studying', icon: GraduationCap, imageSrc: studyImg },
  { id: 'laptop', label: 'Work', icon: Laptop, imageSrc: laptopImg },
  { id: 'chat', label: 'Social', icon: MessageCircleHeart, imageSrc: chatImg },
  { id: 'cooking', label: 'Cooking', icon: CookingPot, imageSrc: cookingImg },
  { id: 'prayer', label: 'Prayer', icon: HandHeart, imageSrc: prayerImg },
  { id: 'dental', label: 'Dental', icon: Smile, imageSrc: dentalImg },
  { id: 'gift', label: 'Gifts', icon: Gift, imageSrc: giftImg },
  { id: 'car', label: 'Driving', icon: Car, imageSrc: carImg },
  { id: 'movie', label: 'Movies', icon: Clapperboard, imageSrc: movieImg },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, imageSrc: gamingImg },
  { id: 'mail', label: 'Mail', icon: Mail, imageSrc: mailImg },
  { id: 'home', label: 'Home', icon: Home, imageSrc: homeImg },
  { id: 'hiking', label: 'Hiking', icon: Mountain, imageSrc: hikingImg },
  { id: 'swimming', label: 'Swimming', icon: Waves, imageSrc: swimmingImg },
  { id: 'singing', label: 'Singing', icon: Mic, imageSrc: singingImg },
  { id: 'camping', label: 'Camping', icon: Tent, imageSrc: campingImg },
  { id: 'globe', label: 'Languages', icon: Globe, imageSrc: globeImg },
  { id: 'candle', label: 'Relaxation', icon: Flame, imageSrc: candleImg },
  { id: 'fruit', label: 'Nutrition', icon: Apple, imageSrc: fruitImg },
  { id: 'headphones', label: 'Podcasts', icon: Headphones, imageSrc: headphonesImg },
  { id: 'dance', label: 'Dance', icon: Drama, imageSrc: danceImg },
  { id: 'puzzle', label: 'Puzzles', icon: Puzzle, imageSrc: puzzleImg },
  { id: 'trophy', label: 'Goals', icon: Trophy, imageSrc: trophyImg },
  { id: 'salad', label: 'Healthy Eating', icon: Apple, imageSrc: saladImg },
  { id: 'cooking-pan', label: 'Cooking Pan', icon: CookingPot, imageSrc: cookingPanImg },
  { id: 'thought-bubble', label: 'Thoughts', icon: MessageCircle, imageSrc: speechBubbleImg },
  { id: 'lightbulb', label: 'Ideas', icon: Lightbulb, imageSrc: lightbulbImg },
  { id: 'moon', label: 'Moon', icon: Moon, imageSrc: moonImg },
  { id: 'stars', label: 'Stars', icon: Stars, imageSrc: moonStarsImg },
  { id: 'water-bottle', label: 'Water Bottle', icon: GlassWater, imageSrc: waterBottleImg },
  { id: 'water-drop', label: 'Water Drop', icon: Droplet, imageSrc: waterDropImg },
  { id: 'serum', label: 'Skincare', icon: FlaskConical, imageSrc: serumImg },
  { id: 'nail-polish', label: 'Nail Polish', icon: Paintbrush, imageSrc: nailPolishImg },
  { id: 'perfume', label: 'Perfume', icon: SprayCan, imageSrc: perfumeImg },
  { id: 'smoothie', label: 'Smoothie', icon: CupSoda, imageSrc: smoothieImg },
  { id: 'teapot', label: 'Tea', icon: Coffee, imageSrc: teapotImg },
  { id: 'hourglass', label: 'Hourglass', icon: Hourglass, imageSrc: hourglassImg },
  { id: 'yoga-mat', label: 'Stretching', icon: Flower2, imageSrc: yogaMatImg },
  { id: 'calendar', label: 'Calendar', icon: Calendar, imageSrc: calendarImg },
  { id: 'notebook', label: 'Notebook', icon: NotebookPen, imageSrc: notebookImg },
  { id: 'target', label: 'Target', icon: Target, imageSrc: targetImg },
  { id: 'clock', label: 'Time', icon: ClockIcon, imageSrc: clockImg },
  { id: 'vacuum', label: 'Vacuum', icon: Brush, imageSrc: vacuumImg },
  { id: 'trash', label: 'Take Out Trash', icon: Trash2, imageSrc: trashImg },
  { id: 'key', label: 'Keys', icon: Key, imageSrc: keyImg },
  { id: 'toolbox', label: 'DIY', icon: Wrench, imageSrc: toolboxImg },
  { id: 'coffee-chat', label: 'Coffee Chat', icon: Coffee, imageSrc: coffeeChatImg },
  { id: 'party', label: 'Celebrate', icon: PartyPopper, imageSrc: partyImg },
  { id: 'podcast-mic', label: 'Podcasting', icon: Mic, imageSrc: podcastMicImg },
  { id: 'tv', label: 'TV Time', icon: Tv, imageSrc: tvImg },
  { id: 'book-stack', label: 'Book Club', icon: Library, imageSrc: bookStackImg },
  { id: 'beach', label: 'Beach', icon: Umbrella, imageSrc: beachImg },
  { id: 'sunset', label: 'Sunset', icon: Sunset, imageSrc: sunsetImg },
  { id: 'snowflake', label: 'Snow', icon: Snowflake, imageSrc: snowflakeImg },
  { id: 'tree', label: 'Tree', icon: Trees, imageSrc: treeImg },
  { id: 'map', label: 'Explore', icon: MapIcon, imageSrc: mapImg },
  { id: 'compass', label: 'Adventure', icon: Compass, imageSrc: compassImg },
];

export interface IconCategory {
  label: string;
  iconIds: string[];
}

export const iconCategories: IconCategory[] = [
  {
    label: 'ubloom',
    iconIds: ['ubloom'],
  },
  {
    label: 'Health & Fitness',
    iconIds: ['dumbbell', 'running', 'bike', 'yoga', 'yoga-mat', 'swimming', 'hiking', 'dance', 'glass-water', 'water-bottle', 'water-drop', 'smoothie', 'pill', 'dental', 'fruit'],
  },
  {
    label: 'Wellness & Self-care',
    iconIds: ['heart', 'brain', 'sparkles', 'bath', 'candle', 'bed', 'prayer', 'coffee', 'teapot', 'serum', 'nail-polish', 'perfume', 'moon', 'stars', 'hourglass'],
  },
  {
    label: 'Work & Learning',
    iconIds: ['laptop', 'study', 'book', 'book-stack', 'notebook', 'pencil', 'calendar', 'clock', 'target', 'globe', 'puzzle', 'trophy', 'savings', 'lightbulb', 'thought-bubble'],
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

/** Render helper: returns an <img> if clay icon exists, else renders LucideIcon */
export function renderTaskIcon(opt: TaskIconOption, size: number = 14) {
  if (opt.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain" style={{ width: size + 10, height: size + 10 }} />;
  }
  const IconComp = opt.icon;
  return <IconComp size={size} strokeWidth={2.5} />;
}
