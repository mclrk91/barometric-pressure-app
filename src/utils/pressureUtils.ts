import type { PressureSnapshot } from '../types';

export function hpaToInhg(hpa: number): number {
  return hpa * 0.02953;
}

export function classifyTrend(hourly: PressureSnapshot[]): 'rising' | 'falling' | 'stable' {
  if (hourly.length < 4) return 'stable';
  const now = hourly[hourly.length - 1];
  const threeHoursAgo = hourly[Math.max(0, hourly.length - 4)];
  const diff = now.pressure - threeHoursAgo.pressure;
  if (diff > 1.5) return 'rising';
  if (diff < -1.5) return 'falling';
  return 'stable';
}

export function getForecastDrop(
  hourly: PressureSnapshot[],
  currentPressure: number
): { maxDropNext24h: number; dropStartsIn: number } {
  const now = Date.now();
  const next24h = hourly.filter(
    (s) => s.timestamp > now && s.timestamp <= now + 24 * 60 * 60 * 1000
  );
  let maxDrop = 0;
  let dropStartsIn = 0;
  for (const snapshot of next24h) {
    const drop = currentPressure - snapshot.pressure;
    if (drop > maxDrop) {
      maxDrop = drop;
      dropStartsIn = Math.round((snapshot.timestamp - now) / (1000 * 60 * 60));
    }
  }
  return { maxDropNext24h: maxDrop, dropStartsIn };
}

export function trendLabel(trend: 'rising' | 'falling' | 'stable'): string {
  switch (trend) {
    case 'rising': return 'RISING';
    case 'falling': return 'FALLING';
    case 'stable': return 'STEADY';
  }
}

export function trendArrow(trend: 'rising' | 'falling' | 'stable'): string {
  switch (trend) {
    case 'rising': return '\u2197';
    case 'falling': return '\u2198';
    case 'stable': return '\u2192';
  }
}

export function pressureLevel(hpa: number): 'low' | 'normal' | 'high' {
  const inhg = hpaToInhg(hpa);
  if (inhg < 29.80) return 'low';
  if (inhg > 30.20) return 'high';
  return 'normal';
}

export function pressureToGaugeAngle(hpa: number): number {
  const inhg = hpaToInhg(hpa);
  const min = 29.0;
  const max = 31.0;
  const clamped = Math.max(min, Math.min(max, inhg));
  return ((clamped - min) / (max - min)) * 180;
}
