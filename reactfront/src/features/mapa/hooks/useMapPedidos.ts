import { useMemo } from 'react';
import { usePedidosStore } from '@/features/pedidos/stores/pedidosStore';
import { buildRouteStops, type MapRouteStop } from '../utils/routeStops';

export type { MapRouteStop } from '../utils/routeStops';

/**
 * Paradas del mapa: pedidos filtrados del store, orden conservado, coords agrupadas.
 */
export function useMapRouteStops(): MapRouteStop[] {
  const filteredPedidos = usePedidosStore((s) => s.filteredPedidos);
  return useMemo(() => buildRouteStops(filteredPedidos), [filteredPedidos]);
}

/** @deprecated Usar useMapRouteStops; devuelve pedidos planos por compatibilidad. */
export function useMapPedidos() {
  const stops = useMapRouteStops();
  return useMemo(() => stops.flatMap((s) => s.pedidos), [stops]);
}
