import type { Pedido } from '@/types/entities';

export type MapRouteStop = {
  /** 1-based, orden de visita en el mapa */
  sequence: number;
  lng: number;
  lat: number;
  pedidos: Pedido[];
};

function parseCoord(value: number | string | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n : null;
}

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export function filterPedidosWithValidCoords(pedidos: Pedido[]): Pedido[] {
  return pedidos.filter((p) => {
    const lat = parseCoord(p.latitud);
    const lng = parseCoord(p.longitud);
    return lat != null && lng != null;
  });
}

/**
 * Agrupa pedidos con la misma coordenada en una sola parada (un marcador, popup múltiple).
 * Conserva el orden del array de entrada (p. ej. orden de reparto del backend).
 */
export function buildRouteStops(pedidosInOrder: Pedido[]): MapRouteStop[] {
  const withCoords = filterPedidosWithValidCoords(pedidosInOrder);
  const stops: MapRouteStop[] = [];

  for (const pedido of withCoords) {
    const lat = parseCoord(pedido.latitud)!;
    const lng = parseCoord(pedido.longitud)!;
    const key = coordKey(lat, lng);
    const last = stops[stops.length - 1];
    if (last && coordKey(last.lat, last.lng) === key) {
      last.pedidos.push(pedido);
    } else {
      stops.push({
        sequence: stops.length + 1,
        lng,
        lat,
        pedidos: [pedido],
      });
    }
  }

  stops.forEach((s, i) => {
    s.sequence = i + 1;
  });
  return stops;
}

export function stopsToLineStringCoordinates(stops: MapRouteStop[]): [number, number][] {
  return stops.map((s) => [s.lng, s.lat]);
}

function parseOrdenReparto(p: Pedido): number | null {
  const v = p.orden_reparto;
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(String(v)) : NaN;
  if (!Number.isFinite(n) || n >= 9999) return null;
  return n;
}

/** Menor orden de ruta entre los pedidos de la parada (solo valores reales, no 9999). */
export function stopDisplayOrdenReparto(stop: MapRouteStop): number | undefined {
  const vals = stop.pedidos.map(parseOrdenReparto).filter((x): x is number => x != null);
  if (vals.length === 0) return undefined;
  return Math.min(...vals);
}
