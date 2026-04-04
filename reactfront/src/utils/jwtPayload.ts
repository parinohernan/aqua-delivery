import type { User } from '@/types';

/** Decodifica el payload de un JWT (sin verificar firma; solo para lectura de claims en el cliente). */
export function decodeJwtPayload<T extends Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Si el usuario guardado no trae codigoEmpresa (sesiones viejas), lo completa desde el JWT.
 */
export function mergeUserCodigoEmpresaFromJwt(user: User | null, token: string | null): User | null {
  if (!user) return null;
  const existing = user.codigoEmpresa;
  const nExisting =
    existing === undefined || existing === null || existing === ''
      ? NaN
      : Number(existing);
  if (Number.isFinite(nExisting)) return user;
  if (!token) return user;
  const p = decodeJwtPayload<{ codigoEmpresa?: number | string }>(token);
  if (p == null || p.codigoEmpresa === undefined || p.codigoEmpresa === null) return user;
  const n = Number(p.codigoEmpresa);
  if (!Number.isFinite(n)) return user;
  return { ...user, codigoEmpresa: n };
}

export function getSessionCodigoEmpresa(user: User | null, token: string | null): number | null {
  const merged = mergeUserCodigoEmpresaFromJwt(user, token);
  if (!merged) return null;
  const n = Number(merged.codigoEmpresa);
  return Number.isFinite(n) ? n : null;
}
