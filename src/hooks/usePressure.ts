import { useState, useEffect, useCallback } from 'react';
import type { PressureForecast } from '../types';
import { fetchPressure } from '../services/openMeteo';
import { getStorageItem, setStorageItem } from '../services/storage';

const CACHE_KEY = 'ht_pressure_cache';
const CACHE_DURATION = 30 * 60 * 1000;

export function usePressure(lat: number | null, lon: number | null) {
  const [forecast, setForecast] = useState<PressureForecast | null>(() =>
    getStorageItem<PressureForecast | null>(CACHE_KEY, null)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (lat === null || lon === null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPressure(lat, lon);
      setForecast(data);
      setStorageItem(CACHE_KEY, data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch pressure');
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (lat === null || lon === null) return;
    const cached = getStorageItem<PressureForecast | null>(CACHE_KEY, null);
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      setForecast(cached);
      return;
    }
    refresh();
  }, [lat, lon, refresh]);

  useEffect(() => {
    if (lat === null || lon === null) return;
    const interval = setInterval(refresh, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [lat, lon, refresh]);

  return { forecast, loading, error, refresh };
}
