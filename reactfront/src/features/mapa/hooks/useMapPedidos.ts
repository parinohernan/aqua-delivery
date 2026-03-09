import { useMemo } from 'react';
import { usePedidosStore } from '@/features/pedidos/stores/pedidosStore';
import type { Pedido } from '@/types/entities';

/**
 * Hook que retorna pedidos con coordenadas válidas para mostrar en el mapa
 */
export function useMapPedidos(): Pedido[] {
  const filteredPedidos = usePedidosStore((s) => s.filteredPedidos);

  return useMemo(
    () =>
      filteredPedidos.filter(
        (p) =>
          p.latitud != null &&
          p.longitud != null &&
          p.latitud !== '' &&
          p.longitud !== ''
      ),
    [filteredPedidos]
  );
}
