import { API_ENDPOINTS } from '@/utils/constants';

/**
 * Utilidades para construir URLs de endpoints
 */
export const endpoints = {
  // Autenticación
  login: () => API_ENDPOINTS.LOGIN,
  
  // Clientes
  clientes: () => API_ENDPOINTS.CLIENTES,
  cliente: (id: number) => `${API_ENDPOINTS.CLIENTES}/${id}`,
  
  // Productos
  productos: () => API_ENDPOINTS.PRODUCTOS,
  producto: (id: number) => `${API_ENDPOINTS.PRODUCTOS}/${id}`,
  
  // Pedidos
  pedidos: () => API_ENDPOINTS.PEDIDOS,
  pedido: (id: number) => `${API_ENDPOINTS.PEDIDOS}/${id}`,
  
  // Pagos
  pagos: () => API_ENDPOINTS.PAGOS,
  pago: (id: number) => `${API_ENDPOINTS.PAGOS}/${id}`,
  
  // Zonas
  zonas: () => API_ENDPOINTS.ZONAS,
  zona: (id: number) => `${API_ENDPOINTS.ZONAS}/${id}`,
  
  // Tipos de pago
  tiposPago: () => API_ENDPOINTS.TIPOS_PAGO,
  tipoPago: (id: number) => `${API_ENDPOINTS.TIPOS_PAGO}/${id}`,
  
  // Informes
  informes: () => API_ENDPOINTS.INFORMES,
} as const;

