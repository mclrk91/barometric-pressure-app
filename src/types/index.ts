export interface HeadacheEntry {
  id: string;
  timestamp: number;
  severity: number;
  notes: string;
  pressureAtTime: number | null;
  cycleDay: number | null;
  cyclePhase: CyclePhase | null;
  createdAt: number;
  updatedAt: number;
}

export interface CyclePeriod {
  id: string;
  startDate: string;
  endDate: string | null;
  createdAt: number;
  updatedAt: number;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface PressureSnapshot {
  timestamp: number;
  pressure: number;
}

export interface PressureForecast {
  current: number;
  trend: 'rising' | 'falling' | 'stable';
  hourly: PressureSnapshot[];
  fetchedAt: number;
}

export interface UserSettings {
  syncCode: string | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  pressureThreshold: number;
}

export interface AppData {
  headaches: HeadacheEntry[];
  cycles: CyclePeriod[];
  settings: UserSettings;
}

export interface Alert {
  level: 'high' | 'medium' | 'low';
  message: string;
}
