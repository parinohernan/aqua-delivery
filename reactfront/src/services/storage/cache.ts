import { db } from './indexedDB';
import { DB_STORES } from '@/utils/constants';

/**
 * Utilidades para gestión de caché
 */

/**
 * Guarda datos en IndexedDB
 */
export async function cacheData<T>(
  storeName: keyof typeof DB_STORES,
  data: T | T[]
): Promise<void> {
  const store = db[storeName as keyof typeof db] as any;
  const items = Array.isArray(data) ? data : [data];
  
  await store.bulkPut(items);
}

/**
 * Obtiene datos de IndexedDB
 */
export async function getCachedData<T>(
  storeName: keyof typeof DB_STORES
): Promise<T[]> {
  const store = db[storeName as keyof typeof db] as any;
  return await store.toArray();
}

/**
 * Obtiene un item específico por ID
 */
export async function getCachedItem<T>(
  storeName: keyof typeof DB_STORES,
  id: number
): Promise<T | undefined> {
  const store = db[storeName as keyof typeof db] as any;
  return await store.get(id);
}

/**
 * Elimina un item del caché
 */
export async function removeCachedItem(
  storeName: keyof typeof DB_STORES,
  id: number
): Promise<void> {
  const store = db[storeName as keyof typeof db] as any;
  await store.delete(id);
}

/**
 * Limpia el caché de una store específica
 */
export async function clearCache(
  storeName: keyof typeof DB_STORES
): Promise<void> {
  const store = db[storeName as keyof typeof db] as any;
  await store.clear();
}

