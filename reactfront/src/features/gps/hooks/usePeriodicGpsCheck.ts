import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentPositionOnce } from '@/utils/geolocation';
import { eventosGpsService } from '../services/eventosGpsService';
import { enqueueGpsCheckFailed, flushGpsCheckQueue } from '../utils/gpsCheckQueue';
import { isRegistroGpsPeriodicoEnabled } from '../utils/gpsFlags';

/** Intervalo entre registros tipo Check (pestaña visible). */
export const PERIODIC_GPS_MS = 15 * 60 * 1000;

/**
 * Mientras la sesión esté activa y el vendedor tenga `registro_gps_periodico`,
 * envía POST /api/eventos-gps con evento "Check" cada PERIODIC_GPS_MS si la pestaña está visible.
 */
export function usePeriodicGpsCheck(): void {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const enabled = isAuthenticated && isRegistroGpsPeriodicoEnabled(user);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!enabled) return;

    const runTick = async () => {
      if (!enabledRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

      await flushGpsCheckQueue();

      const pos = await getCurrentPositionOnce(12000);
      if (!pos) return;

      const ocurridoEn = new Date().toISOString();
      try {
        await eventosGpsService.registrar({
          evento: 'Check',
          latitud: pos.latitude,
          longitud: pos.longitude,
        });
      } catch (err) {
        console.warn('[GPS periódico] No se pudo registrar el evento (se encola para reenvío):', err);
        enqueueGpsCheckFailed({
          latitud: pos.latitude,
          longitud: pos.longitude,
          ocurrido_en: ocurridoEn,
        });
      }
    };

    void flushGpsCheckQueue();

    const onOnline = () => {
      void flushGpsCheckQueue();
    };
    window.addEventListener('online', onOnline);

    const id = window.setInterval(runTick, PERIODIC_GPS_MS);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(id);
    };
  }, [enabled]);
}
