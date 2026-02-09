import { useState, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../services/storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => getStorageItem(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        setStorageItem(key, next);
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
