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
];

const iconMap = new Map(taskIconOptions.map((o) => [o.id, o]));

export function getTaskIcon(id: string): TaskIconOption | undefined {
  return iconMap.get(id);
}

/** Render helper: returns an <img> if clay icon exists, else renders LucideIcon */
export function renderTaskIcon(opt: TaskIconOption, size: number = 14) {
  if (opt.imageSrc) {
    return <img src={opt.imageSrc} alt={opt.label} className="object-contain" style={{ width: size + 4, height: size + 4 }} />;
  }
  const IconComp = opt.icon;
  return <IconComp size={size} strokeWidth={2.5} />;
}
