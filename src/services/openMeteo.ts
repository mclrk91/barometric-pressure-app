import type { PressureForecast, PressureSnapshot } from '../types';
import { classifyTrend } from '../utils/pressureUtils';

export async function fetchPressure(lat: number, lon: number): Promise<PressureForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=surface_pressure&hourly=surface_pressure&forecast_days=2&past_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  const data = await res.json();

  const hourly: PressureSnapshot[] = (data.hourly.time as string[]).map(
    (time: string, i: number) => ({
      timestamp: new Date(time).getTime(),
      pressure: data.hourly.surface_pressure[i] as number,
    })
  );

  const current = data.current.surface_pressure as number;
  const now = Date.now();
  const pastHourly = hourly.filter((s) => s.timestamp <= now);
  const trend = classifyTrend(pastHourly);

  return {
    current,
    trend,
    hourly,
    fetchedAt: now,
  };
}
