import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints';
import type { User, LoginParams, LoginResponse } from '@/types';

/**
 * Store de autenticación
 * Maneja el estado de autenticación del usuario
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLogoutModalOpen: boolean;
  
  // Actions
  login: (params: LoginParams) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  showLogoutModal: () => void;
  hideLogoutModal: () => void;
  performLogout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isLogoutModalOpen: false,

  /**
   * Inicia sesión con telegramId y codigoEmpresa
   */
  login: async (params: LoginParams) => {
    try {
      const response = await apiClient.post<LoginResponse>(endpoints.login(), params);
      
      const token = response.token;
      const user = response.user || response.vendedor || null;
      
      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        set({
          token,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Cierra sesión
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /**
   * Verifica si hay una sesión activa
   */
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const user = JSON.parse(userStr) as User;
      
      // Verificar que el token sea válido haciendo una petición
      try {
        await apiClient.get('/api/pedidos');
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Token inválido
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Establece el usuario actual
   */
  setUser: (user: User | null) => {
    set({ user });
  },

  /**
   * Establece el token
   */
  setToken: (token: string | null) => {
    set({ token });
  },

  /**
   * Muestra el modal de logout
   */
  showLogoutModal: () => {
    set({ isLogoutModalOpen: true });
  },

  /**
   * Oculta el modal de logout
   */
  hideLogoutModal: () => {
    set({ isLogoutModalOpen: false });
  },

  /**
   * Ejecuta el logout y cierra el modal
   */
  performLogout: () => {
    get().logout();
    get().hideLogoutModal();
    window.location.href = '/login';
  },
}));

