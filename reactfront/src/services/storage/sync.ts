/**
 * Utilidades para sincronización offline/online
 */

/**
 * Verifica si hay conexión a internet
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Escucha cambios en el estado de conexión
 */
export function onConnectionChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Retornar función para limpiar listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Cola de operaciones pendientes para sincronizar cuando vuelva la conexión
 */
class SyncQueue {
  private queue: Array<() => Promise<void>> = [];

  /**
   * Agrega una operación a la cola
   */
  add(operation: () => Promise<void>): void {
    this.queue.push(operation);
  }

  /**
   * Procesa todas las operaciones pendientes
   */
  async process(): Promise<void> {
    if (!isOnline()) {
      console.log('Sin conexión, operaciones en cola:', this.queue.length);
      return;
    }

    const operations = [...this.queue];
    this.queue = [];

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('Error sincronizando operación:', error);
        // Re-agregar a la cola si falla
        this.queue.push(operation);
      }
    }
  }

  /**
   * Obtiene el tamaño de la cola
   */
  getSize(): number {
    return this.queue.length;
  }
}

export const syncQueue = new SyncQueue();

