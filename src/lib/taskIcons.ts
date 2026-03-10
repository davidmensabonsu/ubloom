// Clay-style 3D habit icon images
import dumbbellIcon from '@/assets/habit-icons/dumbbell.png';
import glassWaterIcon from '@/assets/habit-icons/glass-water.png';
import utensilsIcon from '@/assets/habit-icons/utensils.png';
import bookIcon from '@/assets/habit-icons/book.png';
import pencilIcon from '@/assets/habit-icons/pencil.png';
import heartIcon from '@/assets/habit-icons/heart.png';
import bedIcon from '@/assets/habit-icons/bed.png';
import shirtIcon from '@/assets/habit-icons/shirt.png';
import cartIcon from '@/assets/habit-icons/cart.png';
import phoneIcon from '@/assets/habit-icons/phone.png';
import musicIcon from '@/assets/habit-icons/music.png';
import dogIcon from '@/assets/habit-icons/dog.png';
import pillIcon from '@/assets/habit-icons/pill.png';
import sparklesIcon from '@/assets/habit-icons/sparkles.png';
import brainIcon from '@/assets/habit-icons/brain.png';
import coffeeIcon from '@/assets/habit-icons/coffee.png';
import leafIcon from '@/assets/habit-icons/leaf.png';
import cameraIcon from '@/assets/habit-icons/camera.png';
import bikeIcon from '@/assets/habit-icons/bike.png';
import babyIcon from '@/assets/habit-icons/baby.png';
import paletteIcon from '@/assets/habit-icons/palette.png';
import planeIcon from '@/assets/habit-icons/plane.png';

export interface TaskIconOption {
  id: string;
  label: string;
  image: string;
}

export const taskIconOptions: TaskIconOption[] = [
  { id: 'dumbbell', label: 'Exercise', image: dumbbellIcon },
  { id: 'glass-water', label: 'Hydration', image: glassWaterIcon },
  { id: 'utensils', label: 'Meals', image: utensilsIcon },
  { id: 'book', label: 'Reading', image: bookIcon },
  { id: 'pencil', label: 'Writing', image: pencilIcon },
  { id: 'heart', label: 'Self-care', image: heartIcon },
  { id: 'bed', label: 'Sleep', image: bedIcon },
  { id: 'shirt', label: 'Laundry', image: shirtIcon },
  { id: 'cart', label: 'Errands', image: cartIcon },
  { id: 'phone', label: 'Calls', image: phoneIcon },
  { id: 'music', label: 'Music', image: musicIcon },
  { id: 'dog', label: 'Pets', image: dogIcon },
  { id: 'pill', label: 'Vitamins', image: pillIcon },
  { id: 'sparkles', label: 'Beauty', image: sparklesIcon },
  { id: 'brain', label: 'Mindfulness', image: brainIcon },
  { id: 'coffee', label: 'Coffee', image: coffeeIcon },
  { id: 'leaf', label: 'Nature', image: leafIcon },
  { id: 'camera', label: 'Photos', image: cameraIcon },
  { id: 'bike', label: 'Cycling', image: bikeIcon },
  { id: 'baby', label: 'Kids', image: babyIcon },
  { id: 'palette', label: 'Art', image: paletteIcon },
  { id: 'plane', label: 'Travel', image: planeIcon },
];

const iconMap = new Map(taskIconOptions.map((o) => [o.id, o]));

export function getTaskIcon(id: string): TaskIconOption | undefined {
  return iconMap.get(id);
}
