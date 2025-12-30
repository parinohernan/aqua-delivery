import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG, API_ENDPOINTS } from '@/utils/constants';

/**
 * Cliente HTTP configurado con interceptores
 * Maneja autenticación, errores y configuración base
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: APP_CONFIG.API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configura los interceptores de request y response
   */
  private setupInterceptors(): void {
    // Interceptor de request: agrega token de autenticación
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de response: maneja errores globales
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene la instancia de axios
   */
  getInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(url: string, config?: unknown): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(url: string, data?: unknown, config?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(url: string, data?: unknown, config?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T>(url: string, data?: unknown, config?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(url: string, config?: unknown): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Exportar instancia singleton
export const apiClient = new ApiClient();
export default apiClient;

