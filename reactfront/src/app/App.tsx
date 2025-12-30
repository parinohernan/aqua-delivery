import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import LoadingScreen from '@/components/layout/LoadingScreen';
import LoginPage from '@/features/auth/components/LoginPage';
import AppLayout from '@/components/layout/AppLayout';

// Lazy loading de componentes pesados para optimización
const ClientesSection = lazy(() => import('@/features/clientes/components/ClientesSection'));
const PedidosSection = lazy(() => import('@/features/pedidos/components/PedidosSection'));
const ProductosSection = lazy(() => import('@/features/productos/components/ProductosSection'));
const InformesSection = lazy(() => import('@/features/informes/components/InformesSection'));

/**
 * Componente raíz de la aplicación
 * Maneja el routing y la autenticación global
 */
function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Verificar autenticación al cargar la app
    checkAuth();
  }, [checkAuth]);

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
