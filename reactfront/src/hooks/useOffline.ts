import { useState, useEffect } from 'react';
import { onConnectionChange } from '@/services/storage/sync';

/**
 * Hook para detectar estado de conexión
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const cleanup = onConnectionChange((online) => {
      setIsOnline(online);
    });

    return cleanup;
  }, []);

  return { isOnline, isOffline: !isOnline };
}

