/**
 * OpenRouteService directions (opcional). Sin API key o ante error se usa solo línea recta en el mapa.
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/geojson/post
 */

const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

/** Máximo de tramos A→B para no disparar cuotas ni bloquear la UI */
export const MAX_OR_ROUTE_SEGMENTS = 25;

export type RoadRouteStatus = 'idle' | 'loading' | 'ready' | 'error';

async function fetchOrsSegment(
  from: [number, number],
  to: [number, number],
  apiKey: string,
  signal?: AbortSignal
): Promise<[number, number][] | null> {
  const res = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ coordinates: [from, to] }),
    signal,
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features?: { geometry?: { coordinates?: [number, number][] } }[];
  };
  const coords = data?.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  return coords;
}

/**
 * Devuelve coordenadas [lng,lat] siguiendo calles entre puntos consecutivos, o null si falla.
 */
export async function fetchRoadRouteCoordinates(
  points: [number, number][],
  apiKey: string | undefined,
  signal?: AbortSignal
): Promise<[number, number][] | null> {
  if (!apiKey?.trim() || points.length < 2) return null;
  const maxSegments = Math.min(points.length - 1, MAX_OR_ROUTE_SEGMENTS);
  const merged: [number, number][] = [];

  for (let i = 0; i < maxSegments; i++) {
    const from = points[i];
    const to = points[i + 1];
    const segment = await fetchOrsSegment(from, to, apiKey.trim(), signal);
    if (!segment) return null;
    if (merged.length === 0) {
      merged.push(...segment);
    } else {
      merged.push(...segment.slice(1));
    }
    if (i < maxSegments - 1) {
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  return merged.length >= 2 ? merged : null;
}
