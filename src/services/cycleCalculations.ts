import type { CyclePeriod, CyclePhase } from '../types';
import { daysBetween, toDateString } from '../utils/dateUtils';

export interface CycleInfo {
  phase: CyclePhase;
  cycleDay: number;
  daysUntilNextPeriod: number;
  isPMSWindow: boolean;
}

export function getCyclePhase(
  cycles: CyclePeriod[],
  targetDate: string,
  avgCycleLength: number,
  avgPeriodLength: number
): CycleInfo | null {
  if (cycles.length === 0) return null;

  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const recent = sorted.find((c) => c.startDate <= targetDate);
  if (!recent) return null;

  const cycleDay = daysBetween(recent.startDate, targetDate) + 1;
  if (cycleDay < 1) return null;

  const ovulationDay = avgCycleLength - 14;
  let phase: CyclePhase;

  if (cycleDay <= avgPeriodLength) {
    phase = 'menstrual';
  } else if (cycleDay <= ovulationDay - 1) {
    phase = 'follicular';
  } else if (cycleDay <= ovulationDay + 2) {
    phase = 'ovulation';
  } else {
    phase = 'luteal';
  }

  const daysUntilNextPeriod = Math.max(0, avgCycleLength - cycleDay + 1);
  const isPMSWindow = phase === 'luteal' && cycleDay >= avgCycleLength - 7;

  return { phase, cycleDay, daysUntilNextPeriod, isPMSWindow };
}

export function estimateNextPeriod(
  cycles: CyclePeriod[],
  avgCycleLength: number
): string | null {
  if (cycles.length === 0) return null;
  const sorted = [...cycles].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
  const last = sorted[0];
  const start = new Date(last.startDate + 'T00:00:00');
  start.setDate(start.getDate() + avgCycleLength);
  return toDateString(start);
}

export function phaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual': return 'Menstrual';
    case 'follicular': return 'Follicular';
    case 'ovulation': return 'Ovulation';
    case 'luteal': return 'Luteal';
  }
}

export function phaseColor(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual': return '#e74c3c';
    case 'follicular': return '#e91e8f';
    case 'ovulation': return '#9b59b6';
    case 'luteal': return '#3498db';
  }
}
