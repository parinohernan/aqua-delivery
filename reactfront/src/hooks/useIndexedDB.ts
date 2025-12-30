import { useEffect, useState } from 'react';
import { db } from '@/services/storage/indexedDB';
import { DB_STORES } from '@/utils/constants';

/**
 * Hook para trabajar con IndexedDB
 */
export function useIndexedDB<T>(storeName: keyof typeof DB_STORES) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const store = db[storeName as keyof typeof db] as any;
        const items = await store.toArray();
        setData(items);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error cargando datos'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storeName]);

  return { data, isLoading, error };
}

