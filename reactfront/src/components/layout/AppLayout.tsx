import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import MobileNav from './MobileNav';
import LoadingScreen from './LoadingScreen';

// Lazy loading para optimización
const PedidosSection = lazy(() => import('@/features/pedidos/components/PedidosSection'));
const ClientesSection = lazy(() => import('@/features/clientes/components/ClientesSection'));
const ProductosSection = lazy(() => import('@/features/productos/components/ProductosSection'));
const InformesSection = lazy(() => import('@/features/informes/components/InformesSection'));

/**
 * Layout principal de la aplicación
 * Contiene el header, navegación y el contenido principal
 */
function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] to-[#050a14] text-white pb-20 lg:pb-0">
      <Header />
      
      <div className="flex flex-col lg:flex-row">
        {/* Navegación Desktop */}
        <Navigation />
        
        {/* Contenido principal */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Navigate to="/clientes" replace />} />
                <Route path="/pedidos" element={<PedidosSection />} />
                <Route path="/clientes" element={<ClientesSection />} />
                <Route path="/productos" element={<ProductosSection />} />
                <Route path="/informes" element={<InformesSection />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
      
      {/* Navegación Móvil */}
      <MobileNav />
    </div>
  );
}

export default AppLayout;
