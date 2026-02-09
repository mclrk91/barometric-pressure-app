import { ref, onValue, set, get, type Unsubscribe } from 'firebase/database';
import { getFirebaseDb, ensureAuth, isFirebaseConfigured } from './firebase';
import type { AppData, HeadacheEntry, CyclePeriod, UserSettings } from '../types';

export function isFirebaseAvailable(): boolean {
  return isFirebaseConfigured();
}

export async function pushAllData(syncCode: string, data: AppData): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  const ok = await ensureAuth();
  if (!ok) return;

  const headachesObj: Record<string, HeadacheEntry> = {};
  for (const h of data.headaches) {
    headachesObj[h.id] = h;
  }
  const cyclesObj: Record<string, CyclePeriod> = {};
  for (const c of data.cycles) {
    cyclesObj[c.id] = c;
  }

  const dbRef = ref(db, `syncRooms/${syncCode}`);
  await set(dbRef, {
    headaches: headachesObj,
    cycles: cyclesObj,
    settings: {
      latitude: data.settings.latitude,
      longitude: data.settings.longitude,
      locationName: data.settings.locationName,
      averageCycleLength: data.settings.averageCycleLength,
      averagePeriodLength: data.settings.averagePeriodLength,
      pressureThreshold: data.settings.pressureThreshold,
    },
    lastUpdated: Date.now(),
  });
}

export async function pullAllData(syncCode: string): Promise<AppData | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  const ok = await ensureAuth();
  if (!ok) return null;

  const dbRef = ref(db, `syncRooms/${syncCode}`);
  const snapshot = await get(dbRef);
  const val = snapshot.val();
  if (!val) return null;

  const headaches: HeadacheEntry[] = val.headaches
    ? Object.values(val.headaches)
    : [];
  const cycles: CyclePeriod[] = val.cycles
    ? Object.values(val.cycles)
    : [];

  return {
    headaches,
    cycles,
    settings: {
      syncCode,
      latitude: val.settings?.latitude ?? null,
      longitude: val.settings?.longitude ?? null,
      locationName: val.settings?.locationName ?? '',
      averageCycleLength: val.settings?.averageCycleLength ?? 28,
      averagePeriodLength: val.settings?.averagePeriodLength ?? 5,
      pressureThreshold: val.settings?.pressureThreshold ?? 5,
    },
  };
}

export function subscribeToData(
  syncCode: string,
  callback: (data: AppData) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  const dbRef = ref(db, `syncRooms/${syncCode}`);
  return onValue(dbRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) return;

    const headaches: HeadacheEntry[] = val.headaches
      ? Object.values(val.headaches)
      : [];
    const cycles: CyclePeriod[] = val.cycles
      ? Object.values(val.cycles)
      : [];

    callback({
      headaches,
      cycles,
      settings: {
        syncCode,
        latitude: val.settings?.latitude ?? null,
        longitude: val.settings?.longitude ?? null,
        locationName: val.settings?.locationName ?? '',
        averageCycleLength: val.settings?.averageCycleLength ?? 28,
        averagePeriodLength: val.settings?.averagePeriodLength ?? 5,
        pressureThreshold: val.settings?.pressureThreshold ?? 5,
      },
    });
  });
}

export function mergeData(local: AppData, remote: AppData): AppData {
  const headacheMap = new Map<string, HeadacheEntry>();
  for (const h of local.headaches) headacheMap.set(h.id, h);
  for (const h of remote.headaches) {
    const existing = headacheMap.get(h.id);
    if (!existing || h.updatedAt > existing.updatedAt) {
      headacheMap.set(h.id, h);
    }
  }

  const cycleMap = new Map<string, CyclePeriod>();
  for (const c of local.cycles) cycleMap.set(c.id, c);
  for (const c of remote.cycles) {
    const existing = cycleMap.get(c.id);
    if (!existing || c.updatedAt > existing.updatedAt) {
      cycleMap.set(c.id, c);
    }
  }

  const settings: UserSettings = {
    ...local.settings,
    ...remote.settings,
    syncCode: local.settings.syncCode ?? remote.settings.syncCode,
  };

  return {
    headaches: Array.from(headacheMap.values()),
    cycles: Array.from(cycleMap.values()),
    settings,
  };
}
