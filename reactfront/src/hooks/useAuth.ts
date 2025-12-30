import { useAuthStore } from '@/stores/authStore';

/**
 * Hook personalizado para autenticación
 * Proporciona acceso fácil al store de autenticación
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}

