import type { PressureForecast, PressureSnapshot, WeatherData } from '../types';
import { classifyTrend } from '../utils/pressureUtils';
import { weatherCodeToInfo } from '../utils/weatherUtils';

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

  return { current, trend, hourly, fetchedAt: now };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  const data = await res.json();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daily = (data.daily.time as string[]).map((date: string, i: number) => {
    const d = new Date(date + 'T00:00:00');
    const isToday = i === 0;
    return {
      date,
      dayName: isToday ? 'Today' : dayNames[d.getDay()],
      weatherCode: data.daily.weather_code[i] as number,
      tempMax: Math.round(data.daily.temperature_2m_max[i] as number),
      tempMin: Math.round(data.daily.temperature_2m_min[i] as number),
      precipProbability: data.daily.precipitation_probability_max[i] as number,
    };
  });

  // Check for rain info for alert
  const _rainInfo = weatherCodeToInfo(data.current.weather_code);
  void _rainInfo;

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m as number),
      humidity: Math.round(data.current.relative_humidity_2m as number),
      weatherCode: data.current.weather_code as number,
    },
    daily,
    fetchedAt: Date.now(),
  };
}
