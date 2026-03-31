import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import MobileNav from './MobileNav';
import SectionLoadingFallback from './SectionLoadingFallback';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import RutasOrdenLeaveDialog from '@/features/rutas/components/RutasOrdenLeaveDialog';
import { preloadAppSection } from '@/app/routePreloads';
import { ROUTES } from '@/utils/constants';

// Lazy loading para optimización
const PedidosSection = lazy(() => import('@/features/pedidos/components/PedidosSection'));
const ClientesSection = lazy(() => import('@/features/clientes/components/ClientesSection'));
const ProductosSection = lazy(() => import('@/features/productos/components/ProductosSection'));
const InformesSection = lazy(() => import('@/features/informes/components/InformesSection'));
const MapView = lazy(() => import('@/features/mapa/components/MapView'));
const RutasSection = lazy(() => import('@/features/rutas/components/RutasSection'));

/**
 * Layout principal de la aplicación
 * Contiene el header, navegación y el contenido principal
 */
function AppLayout() {
  useEffect(() => {
    preloadAppSection(ROUTES.PEDIDOS);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#050a14] mobile-solid-bg text-white pb-20 lg:pb-0">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        {/* Navegación Desktop */}
        <Navigation />
        
        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<SectionLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/pedidos" replace />} />
                <Route path="/pedidos" element={<PedidosSection />} />
                <Route path="/clientes" element={<ClientesSection />} />
                <Route path="/productos" element={<ProductosSection />} />
                <Route path="/informes" element={<InformesSection />} />
                <Route path="/mapa" element={<MapView />} />
                <Route path="/rutas" element={<RutasSection />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
      
      {/* Navegación Móvil */}
      <MobileNav />

      {/* Toast y Confirm globales */}
      <Toast />
      <ConfirmDialog />
      <RutasOrdenLeaveDialog />
    </div>
  );
}

export default AppLayout;
