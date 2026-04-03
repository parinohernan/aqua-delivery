import type { User } from '@/types/entities';

/** Normaliza el flag desde MySQL/JSON (0/1, boolean, string). */
export function isRegistroGpsPeriodicoEnabled(user: User | null | undefined): boolean {
  if (!user) return false;
  const raw = user.registro_gps_periodico;
  if (raw === true || raw === 1) return true;
  if (raw === false || raw === 0) return false;
  if (typeof raw === 'string') return raw === '1' || raw.toLowerCase() === 'true';
  return Boolean(raw);
}
