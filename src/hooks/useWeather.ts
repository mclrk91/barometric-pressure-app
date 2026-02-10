import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '../types';
import { fetchWeather } from '../services/openMeteo';
import { getStorageItem, setStorageItem } from '../services/storage';

const CACHE_KEY = 'ht_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000;

export function useWeather(lat: number | null, lon: number | null) {
  const [weather, setWeather] = useState<WeatherData | null>(() =>
    getStorageItem<WeatherData | null>(CACHE_KEY, null)
  );
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (lat === null || lon === null) return;
    setLoading(true);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setStorageItem(CACHE_KEY, data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (lat === null || lon === null) return;
    const cached = getStorageItem<WeatherData | null>(CACHE_KEY, null);
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      setWeather(cached);
      return;
    }
    refresh();
  }, [lat, lon, refresh]);

  return { weather, loading, refresh };
}
