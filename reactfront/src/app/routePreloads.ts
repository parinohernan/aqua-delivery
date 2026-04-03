import { ROUTES } from '@/utils/constants';
import { usePedidosStore } from '@/features/pedidos/stores/pedidosStore';
import { useClientesStore } from '@/features/clientes/stores/clientesStore';
import { useProductosStore } from '@/features/productos/stores/productosStore';

/**
 * Mismos imports dinámicos que AppLayout (lazy) para precargar chunks al hover/touch.
 */
const sectionLoaders: Record<string, () => Promise<unknown>> = {
  [ROUTES.PEDIDOS]: () => import('@/features/pedidos/components/PedidosSection'),
  [ROUTES.CLIENTES]: () => import('@/features/clientes/components/ClientesSection'),
  [ROUTES.PRODUCTOS]: () => import('@/features/productos/components/ProductosSection'),
  [ROUTES.INFORMES]: () => import('@/features/informes/components/InformesSection'),
  [ROUTES.MAPA]: () => import('@/features/mapa/components/MapView'),
  [ROUTES.RUTAS]: () => import('@/features/rutas/components/RutasSection'),
  [ROUTES.GPS]: () => import('@/features/gps/components/GpsSection'),
  [ROUTES.EXPENSES]: () => import('@/features/expenses/components/ExpensesSection'),
  [ROUTES.CAJA]: () => import('@/features/expenses/components/CajaSection'),
};

function preloadSectionData(path: string): void {
  switch (path) {
    case ROUTES.PEDIDOS:
      void usePedidosStore.getState().ensurePedidosLoaded({ maxAgeMs: 45000 }).catch(() => {});
      break;
    case ROUTES.CLIENTES:
      void useClientesStore.getState().ensureClientesLoaded().catch(() => {});
      break;
    case ROUTES.PRODUCTOS:
      void useProductosStore.getState().ensureProductosLoaded().catch(() => {});
      break;
    default:
      break;
  }
}

/**
 * Inicia la descarga del chunk de una sección (idempotente si ya está en caché).
 */
export function preloadAppSection(path: string): void {
  const load = sectionLoaders[path];
  if (load) {
    void load().catch(() => {
      /* la navegación volverá a intentar */
    });
  }
  preloadSectionData(path);
}
