import { fromZonedTime } from 'date-fns-tz';

const DEFAULT_TZ = 'America/Argentina/Buenos_Aires';

/** Zona IANA de la empresa (filtros de día y formato en pantalla). */
export function getAppTimeZone(): string {
  const tz = import.meta.env.VITE_APP_TIMEZONE;
  return typeof tz === 'string' && tz.trim() !== '' ? tz.trim() : DEFAULT_TZ;
}

/** YYYY-MM-DD del “hoy” según el calendario en la zona de la empresa. */
export function todayDateInputValueInAppTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: getAppTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/** Inicio del día calendario YYYY-MM-MM en zona empresa → instante UTC. */
export function startOfAppDayUtc(ymd: string): Date {
  return fromZonedTime(`${ymd}T00:00:00.000`, getAppTimeZone());
}

/** Fin del día calendario en zona empresa → instante UTC. */
export function endOfAppDayUtc(ymd: string): Date {
  return fromZonedTime(`${ymd}T23:59:59.999`, getAppTimeZone());
}
