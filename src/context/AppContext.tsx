import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type {
  HeadacheEntry,
  CyclePeriod,
  UserSettings,
  PressureForecast,
  WeatherData,
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { usePressure } from '../hooks/usePressure';
import { useWeather } from '../hooks/useWeather';
import { generateId } from '../utils/id';
import { getCyclePhase } from '../services/cycleCalculations';
import { toDateString } from '../utils/dateUtils';
import {
  isFirebaseAvailable,
  pushAllData,
  pullAllData,
  subscribeToData,
  mergeData,
} from '../services/firebaseSync';

const DEFAULT_SETTINGS: UserSettings = {
  syncCode: null,
  latitude: null,
  longitude: null,
  locationName: '',
  averageCycleLength: 28,
  averagePeriodLength: 5,
  pressureThreshold: 5,
};

interface AppContextValue {
  headaches: HeadacheEntry[];
  cycles: CyclePeriod[];
  settings: UserSettings;
  pressure: PressureForecast | null;
  pressureLoading: boolean;
  weather: WeatherData | null;
  syncStatus: 'disconnected' | 'connected' | 'syncing' | 'error';
  addHeadache: (severity: number, notes?: string, timestamp?: number) => void;
  deleteHeadache: (id: string) => void;
  addCyclePeriod: (startDate: string) => void;
  endCyclePeriod: (id: string, endDate: string) => void;
  deleteCyclePeriod: (id: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  connectSync: (code: string) => Promise<void>;
  disconnectSync: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  refreshPressure: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [headaches, setHeadaches] = useLocalStorage<HeadacheEntry[]>('ht_headaches', []);
  const [cycles, setCycles] = useLocalStorage<CyclePeriod[]>('ht_cycles', []);
  const [settings, setSettings] = useLocalStorage<UserSettings>('ht_settings', DEFAULT_SETTINGS);
  const [syncStatus, setSyncStatus] = useLocalStorage<'disconnected' | 'connected' | 'syncing' | 'error'>('ht_sync_status', 'disconnected');

  const { forecast: pressure, loading: pressureLoading, refresh: refreshPressure } = usePressure(
    settings.latitude,
    settings.longitude
  );
  const { weather } = useWeather(settings.latitude, settings.longitude);

  const unsubRef = useRef<(() => void) | null>(null);
  const pushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressRemoteRef = useRef(false);

  const pushToFirebase = useCallback(
    (h: HeadacheEntry[], c: CyclePeriod[], s: UserSettings) => {
      if (!s.syncCode || !isFirebaseAvailable()) return;
      if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
      pushTimeoutRef.current = setTimeout(() => {
        pushAllData(s.syncCode!, { headaches: h, cycles: c, settings: s }).catch(
          () => setSyncStatus('error')
        );
      }, 500);
    },
    [setSyncStatus]
  );

  const addHeadache = useCallback(
    (severity: number, notes = '', timestamp?: number) => {
      const now = timestamp ?? Date.now();
      const today = toDateString(new Date(now));
      const cycleInfo = getCyclePhase(
        cycles,
        today,
        settings.averageCycleLength,
        settings.averagePeriodLength
      );
      const entry: HeadacheEntry = {
        id: generateId(),
        timestamp: now,
        severity,
        notes,
        pressureAtTime: pressure?.current ?? null,
        cycleDay: cycleInfo?.cycleDay ?? null,
        cyclePhase: cycleInfo?.phase ?? null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setHeadaches((prev) => {
        const next = [entry, ...prev];
        pushToFirebase(next, cycles, settings);
        return next;
      });
    },
    [cycles, settings, pressure, setHeadaches, pushToFirebase]
  );

  const deleteHeadache = useCallback(
    (id: string) => {
      setHeadaches((prev) => {
        const next = prev.filter((h) => h.id !== id);
        pushToFirebase(next, cycles, settings);
        return next;
      });
    },
    [cycles, settings, setHeadaches, pushToFirebase]
  );

  const addCyclePeriod = useCallback(
    (startDate: string) => {
      const entry: CyclePeriod = {
        id: generateId(),
        startDate,
        endDate: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCycles((prev) => {
        const next = [entry, ...prev];
        pushToFirebase(headaches, next, settings);
        return next;
      });
    },
    [headaches, settings, setCycles, pushToFirebase]
  );

  const endCyclePeriod = useCallback(
    (id: string, endDate: string) => {
      setCycles((prev) => {
        const next = prev.map((c) =>
          c.id === id ? { ...c, endDate, updatedAt: Date.now() } : c
        );
        pushToFirebase(headaches, next, settings);
        return next;
      });
    },
    [headaches, settings, setCycles, pushToFirebase]
  );

  const deleteCyclePeriod = useCallback(
    (id: string) => {
      setCycles((prev) => {
        const next = prev.filter((c) => c.id !== id);
        pushToFirebase(headaches, next, settings);
        return next;
      });
    },
    [headaches, settings, setCycles, pushToFirebase]
  );

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        pushToFirebase(headaches, cycles, next);
        return next;
      });
    },
    [headaches, cycles, setSettings, pushToFirebase]
  );

  const connectSync = useCallback(
    async (code: string) => {
      if (!isFirebaseAvailable()) {
        setSyncStatus('error');
        return;
      }
      setSyncStatus('syncing');

      try {
        const remote = await pullAllData(code);
        if (remote) {
          const local = { headaches, cycles, settings: { ...settings, syncCode: code } };
          const merged = mergeData(local, remote);
          suppressRemoteRef.current = true;
          setHeadaches(merged.headaches);
          setCycles(merged.cycles);
          setSettings({ ...merged.settings, syncCode: code });
          await pushAllData(code, merged);
          suppressRemoteRef.current = false;
        } else {
          setSettings((prev) => ({ ...prev, syncCode: code }));
          await pushAllData(code, { headaches, cycles, settings: { ...settings, syncCode: code } });
        }

        if (unsubRef.current) unsubRef.current();
        const unsub = subscribeToData(code, (remoteData) => {
          if (suppressRemoteRef.current) return;
          suppressRemoteRef.current = true;
          setHeadaches(remoteData.headaches);
          setCycles(remoteData.cycles);
          setSettings((prev) => ({ ...remoteData.settings, syncCode: prev.syncCode }));
          suppressRemoteRef.current = false;
        });
        unsubRef.current = unsub;
        setSyncStatus('connected');
      } catch {
        setSyncStatus('error');
      }
    },
    [headaches, cycles, settings, setHeadaches, setCycles, setSettings, setSyncStatus]
  );

  const disconnectSync = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setSettings((prev) => ({ ...prev, syncCode: null }));
    setSyncStatus('disconnected');
  }, [setSettings, setSyncStatus]);

  // Re-subscribe on mount if sync code exists
  useEffect(() => {
    if (settings.syncCode && isFirebaseAvailable() && !unsubRef.current) {
      const code = settings.syncCode;
      const unsub = subscribeToData(code, (remoteData) => {
        if (suppressRemoteRef.current) return;
        suppressRemoteRef.current = true;
        setHeadaches(remoteData.headaches);
        setCycles(remoteData.cycles);
        setSettings((prev) => ({ ...remoteData.settings, syncCode: prev.syncCode }));
        suppressRemoteRef.current = false;
      });
      unsubRef.current = unsub;
      setSyncStatus('connected');
    }
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify({ headaches, cycles, settings }, null, 2);
  }, [headaches, cycles, settings]);

  const importData = useCallback(
    (json: string): boolean => {
      try {
        const data = JSON.parse(json);
        if (data.headaches) setHeadaches(data.headaches);
        if (data.cycles) setCycles(data.cycles);
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        return true;
      } catch {
        return false;
      }
    },
    [setHeadaches, setCycles, setSettings]
  );

  const value: AppContextValue = {
    headaches,
    cycles,
    settings,
    pressure,
    pressureLoading,
    weather,
    syncStatus,
    addHeadache,
    deleteHeadache,
    addCyclePeriod,
    endCyclePeriod,
    deleteCyclePeriod,
    updateSettings,
    connectSync,
    disconnectSync,
    exportData,
    importData,
    refreshPressure,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
