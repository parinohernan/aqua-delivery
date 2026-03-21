import { ROUTES } from '@/utils/constants';

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
};

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
}
