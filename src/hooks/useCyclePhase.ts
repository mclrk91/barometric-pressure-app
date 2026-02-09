import { useMemo } from 'react';
import type { CyclePeriod } from '../types';
import { getCyclePhase, type CycleInfo } from '../services/cycleCalculations';
import { toDateString } from '../utils/dateUtils';

export function useCyclePhase(
  cycles: CyclePeriod[],
  avgCycleLength: number,
  avgPeriodLength: number
): CycleInfo | null {
  return useMemo(() => {
    const today = toDateString(new Date());
    return getCyclePhase(cycles, today, avgCycleLength, avgPeriodLength);
  }, [cycles, avgCycleLength, avgPeriodLength]);
}
