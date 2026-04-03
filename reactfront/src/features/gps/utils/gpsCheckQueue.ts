import { eventosGpsService, type RegistrarEventoGpsBody } from '../services/eventosGpsService';

const STORAGE_KEY = 'adm_gps_check_queue_v1';
/** Límite de eventos en cola (FIFO; si se supera, se descartan los más antiguos). */
const MAX_QUEUE = 80;

export type QueuedGpsCheck = Pick<
  RegistrarEventoGpsBody,
  'latitud' | 'longitud' | 'ocurrido_en' | 'evento'
>;

function loadRaw(): QueuedGpsCheck[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is QueuedGpsCheck =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as QueuedGpsCheck).latitud === 'number' &&
        typeof (x as QueuedGpsCheck).longitud === 'number' &&
        typeof (x as QueuedGpsCheck).evento === 'string',
    );
  } catch {
    return [];
  }
}

function save(queue: QueuedGpsCheck[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // disco lleno o modo privado
  }
}

/** Encola un Check fallido para reenvío cuando haya conexión. */
export function enqueueGpsCheckFailed(payload: Omit<QueuedGpsCheck, 'evento'>): void {
  const item: QueuedGpsCheck = {
    evento: 'Check',
    latitud: payload.latitud,
    longitud: payload.longitud,
    ocurrido_en: payload.ocurrido_en ?? new Date().toISOString(),
  };
  let queue = loadRaw();
  queue.push(item);
  while (queue.length > MAX_QUEUE) queue.shift();
  save(queue);
}

export function getGpsCheckQueueLength(): number {
  return loadRaw().length;
}

/**
 * Intenta enviar la cola en orden FIFO. Para en el primer fallo para mantener orden.
 */
export async function flushGpsCheckQueue(): Promise<void> {
  for (;;) {
    const queue = loadRaw();
    if (queue.length === 0) return;
    const first = queue[0];
    try {
      await eventosGpsService.registrar({
        evento: first.evento,
        latitud: first.latitud,
        longitud: first.longitud,
        ocurrido_en: first.ocurrido_en,
      });
      queue.shift();
      save(queue);
    } catch {
      return;
    }
  }
}
