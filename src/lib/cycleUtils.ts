import { differenceInDays, addDays, format } from 'date-fns';

export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulatory' | 'Luteal';

export function getCurrentCycleDay(lastPeriodStart: string, cycleLength: number): number {
  const start = new Date(lastPeriodStart + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = differenceInDays(today, start);
  // Wrap around if past one cycle
  const day = (diff % cycleLength) + 1;
  return day <= 0 ? day + cycleLength : day;
}

export function getCurrentPhase(cycleDay: number, periodLength: number, cycleLength: number): CyclePhase {
  if (cycleDay <= periodLength) return 'Menstrual';
  const ovulationDay = Math.round(cycleLength / 2);
  if (cycleDay <= ovulationDay - 2) return 'Follicular';
  if (cycleDay <= ovulationDay + 1) return 'Ovulatory';
  return 'Luteal';
}

export function getNextPeriodDate(lastPeriodStart: string, cycleLength: number): Date {
  const start = new Date(lastPeriodStart + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(start);
  while (next <= today) {
    next = addDays(next, cycleLength);
  }
  return next;
}

export function getFormattedNextPeriod(lastPeriodStart: string, cycleLength: number): string {
  const next = getNextPeriodDate(lastPeriodStart, cycleLength);
  return format(next, 'MMM d');
}

export function getPhaseInsight(phase: CyclePhase): string {
  switch (phase) {
    case 'Menstrual':
      return "Your body is in its rest and release phase — energy may feel lower, and that's completely okay. This is your time to slow down, honour what you need, and be extra gentle with yourself. Cosy rituals, warm drinks, and lighter movement like stretching or walking can feel really nourishing right now.";
    case 'Follicular':
      return "You're entering your rising energy phase — creativity and motivation are building. This is a beautiful time to plan, start new things, and lean into what excites you. Your body is ready for more movement and fresh ideas. Let yourself dream a little bigger today.";
    case 'Ovulatory':
      return "You're in your most radiant, expressive phase — energy and confidence are at their peak. This is your moment to connect, communicate, and shine. Social plans, challenging workouts, and putting yourself out there all feel more natural right now. Enjoy the glow.";
    case 'Luteal':
      return "Your body is winding down and turning inward — you might notice a shift towards wanting more comfort and quiet. This is a great time for wrapping up tasks, nesting, and prioritising self-care. Be patient with yourself if things feel heavier than usual — it's all part of your rhythm.";
  }
}

export function getPhaseColor(phase: CyclePhase): string {
  switch (phase) {
    case 'Menstrual': return 'hsl(var(--destructive, 0 84% 60%))';
    case 'Follicular': return 'hsl(142 71% 45%)';
    case 'Ovulatory': return 'hsl(38 92% 50%)';
    case 'Luteal': return 'hsl(var(--primary))';
  }
}

export function getPhaseIcon(phase: CyclePhase): string {
  switch (phase) {
    case 'Menstrual': return 'moon';
    case 'Follicular': return 'blossom';
    case 'Ovulatory': return 'sun';
    case 'Luteal': return 'leaf';
  }
}
