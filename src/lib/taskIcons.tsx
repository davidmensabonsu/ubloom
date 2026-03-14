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

export interface TaskIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
  imageSrc?: string;
}

export const taskIconOptions: TaskIconOption[] = [
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
  { id: 'ubloom', label: 'ubloom', icon: Sparkles, imageSrc: ubloomImg },
  { id: 'salad', label: 'Healthy Eating', icon: Apple, imageSrc: saladImg },
  { id: 'cooking-pan', label: 'Cooking Pan', icon: CookingPot, imageSrc: cookingPanImg },
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
    iconIds: ['dumbbell', 'running', 'bike', 'yoga', 'swimming', 'hiking', 'dance', 'glass-water', 'pill', 'dental', 'fruit'],
  },
  {
    label: 'Wellness & Self-care',
    iconIds: ['heart', 'brain', 'sparkles', 'bath', 'candle', 'bed', 'prayer', 'coffee'],
  },
  {
    label: 'Work & Learning',
    iconIds: ['laptop', 'study', 'book', 'pencil', 'globe', 'puzzle', 'trophy', 'savings'],
  },
  {
    label: 'Home & Daily',
    iconIds: ['home', 'cooking', 'cooking-pan', 'utensils', 'salad', 'cleaning', 'shirt', 'cart', 'car', 'plant'],
  },
  {
    label: 'Social & Entertainment',
    iconIds: ['chat', 'phone', 'mail', 'music', 'headphones', 'movie', 'gaming', 'singing', 'camera'],
  },
  {
    label: 'Outdoors & Adventure',
    iconIds: ['sun', 'leaf', 'plane', 'camping', 'dog', 'baby', 'palette', 'gift'],
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
