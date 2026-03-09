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
  type LucideIcon,
} from 'lucide-react';

export interface TaskIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const taskIconOptions: TaskIconOption[] = [
  { id: 'dumbbell', label: 'Exercise', icon: Dumbbell },
  { id: 'glass-water', label: 'Hydration', icon: GlassWater },
  { id: 'utensils', label: 'Meals', icon: UtensilsCrossed },
  { id: 'book', label: 'Reading', icon: BookOpen },
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
];

const iconMap = new Map(taskIconOptions.map((o) => [o.id, o]));

export function getTaskIcon(id: string): TaskIconOption | undefined {
  return iconMap.get(id);
}
