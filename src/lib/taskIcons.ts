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
  type LucideIcon,
} from 'lucide-react';

import readingIcon from '@/assets/habit-icons/reading.png';
import runningIcon from '@/assets/habit-icons/running.png';

export interface TaskIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
  image?: string; // Optional clay-style image override
}

export const taskIconOptions: TaskIconOption[] = [
  { id: 'dumbbell', label: 'Exercise', icon: Dumbbell },
  { id: 'glass-water', label: 'Hydration', icon: GlassWater },
  { id: 'utensils', label: 'Meals', icon: UtensilsCrossed },
  { id: 'book', label: 'Reading', icon: BookOpen, image: readingIcon },
  { id: 'pencil', label: 'Writing', icon: Pencil },
  { id: 'heart', label: 'Self-care', icon: Heart },
  { id: 'bed', label: 'Sleep', icon: Bed },
  { id: 'shirt', label: 'Laundry', icon: Shirt },
  { id: 'cart', label: 'Errands', icon: ShoppingCart },
  { id: 'phone', label: 'Calls', icon: Phone },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'dog', label: 'Pets', icon: Dog },
  { id: 'pill', label: 'Vitamins', icon: Pill },
  { id: 'sparkles', label: 'Beauty', icon: Sparkles },
  { id: 'brain', label: 'Mindfulness', icon: Brain },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'leaf', label: 'Nature', icon: Leaf },
  { id: 'camera', label: 'Photos', icon: Camera },
  { id: 'bike', label: 'Cycling', icon: Bike, image: runningIcon },
  { id: 'baby', label: 'Kids', icon: Baby },
  { id: 'palette', label: 'Art', icon: Palette },
  { id: 'plane', label: 'Travel', icon: Plane },
];

const iconMap = new Map(taskIconOptions.map((o) => [o.id, o]));

export function getTaskIcon(id: string): TaskIconOption | undefined {
  return iconMap.get(id);
}
