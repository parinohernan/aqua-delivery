import type { ClienteConOrden } from '@/types/entities';

export type MoverModo = 'before' | 'after' | 'position';

/**
 * Reordena la lista moviendo un cliente según referencia o posición 1-based.
 */
export function reorderClientesRuta(
  clientes: ClienteConOrden[],
  movingCodigo: number,
  modo: MoverModo,
  refCodigo?: number,
  positionN?: number
): ClienteConOrden[] {
  const ids = clientes.map((c) => c.codigoCliente);
  const oldIndex = ids.indexOf(movingCodigo);
  if (oldIndex === -1) return clientes;

  const moving = ids[oldIndex];
  const without = ids.filter((id) => id !== moving);

  if (modo === 'position' && positionN != null && Number.isFinite(positionN)) {
    const n = Math.floor(positionN);
    const dest = Math.max(0, Math.min(without.length, n - 1));
    without.splice(dest, 0, moving);
  } else if (refCodigo != null && refCodigo !== moving) {
    const refIdx = without.indexOf(refCodigo);
    if (refIdx === -1) return clientes;
    if (modo === 'before') {
      without.splice(refIdx, 0, moving);
    } else {
      without.splice(refIdx + 1, 0, moving);
    }
  } else {
    return clientes;
  }

  const map = new Map(clientes.map((c) => [c.codigoCliente, c]));
  return without.map((id, i) => {
    const c = map.get(id)!;
    return { ...c, orden: i };
  });
}
