import { useMemo } from 'react';
import type { HeadacheEntry, CyclePhase, PressureForecast } from '../types';
import { daysAgo } from '../utils/dateUtils';

export interface PhaseStats {
  count: number;
  avgSeverity: number;
}

export interface PatternStats {
  totalHeadaches: number;
  last30Days: number;
  avgSeverity: number;
  headachesByPhase: Record<CyclePhase, PhaseStats>;
  mostCommonPhase: CyclePhase | null;
  pressureDropCorrelation: number;
  weeklyFrequency: { week: string; count: number }[];
}

export function useHeadachePatterns(
  headaches: HeadacheEntry[],
  _forecast: PressureForecast | null
): PatternStats {
  return useMemo(() => {
    const thirtyDaysAgo = daysAgo(30);
    const recent = headaches.filter((h) => h.timestamp >= thirtyDaysAgo);

    const totalHeadaches = headaches.length;
    const last30Days = recent.length;
    const avgSeverity =
      headaches.length > 0
        ? headaches.reduce((s, h) => s + h.severity, 0) / headaches.length
        : 0;

    const phases: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
    const headachesByPhase = {} as Record<CyclePhase, PhaseStats>;
    for (const phase of phases) {
      const inPhase = headaches.filter((h) => h.cyclePhase === phase);
      headachesByPhase[phase] = {
        count: inPhase.length,
        avgSeverity:
          inPhase.length > 0
            ? inPhase.reduce((s, h) => s + h.severity, 0) / inPhase.length
            : 0,
      };
    }

    let mostCommonPhase: CyclePhase | null = null;
    let maxCount = 0;
    for (const phase of phases) {
      if (headachesByPhase[phase].count > maxCount) {
        maxCount = headachesByPhase[phase].count;
        mostCommonPhase = phase;
      }
    }

    const withPressure = headaches.filter((h) => h.pressureAtTime !== null);
    const duringDrop = withPressure.filter(
      (h) => h.pressureAtTime !== null && h.pressureAtTime < 1010
    );
    const pressureDropCorrelation =
      withPressure.length > 0 ? (duringDrop.length / withPressure.length) * 100 : 0;

    const weekMap = new Map<string, number>();
    for (const h of headaches) {
      const d = new Date(h.timestamp);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    }
    const weeklyFrequency = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12);

    return {
      totalHeadaches,
      last30Days,
      avgSeverity,
      headachesByPhase,
      mostCommonPhase,
      pressureDropCorrelation,
      weeklyFrequency,
    };
  }, [headaches, _forecast]);
}
