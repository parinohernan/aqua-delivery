import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import LoadingScreen from '@/components/layout/LoadingScreen';
import LoginPage from '@/features/auth/components/LoginPage';
import AppLayout from '@/components/layout/AppLayout';

// Lazy loading de componentes pesados para optimización
const LandingPage = lazy(() => import('@/features/landing/components/LandingPage'));

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
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/info" element={<LandingPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}

export default App;
