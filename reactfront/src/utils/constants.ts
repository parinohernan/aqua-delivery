/**
 * Constantes de la aplicación
 */

/**
 * Configuración de la aplicación
 */
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'AquaDelivery',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
} as const;

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  AUTH: '/auth',
  LOGIN: '/auth/login',
  CLIENTES: '/api/clientes',
  PRODUCTOS: '/api/productos',
  PEDIDOS: '/api/pedidos',
  PAGOS: '/api/pagos',
  ZONAS: '/api/zonas',
  TIPOS_PAGO: '/api/tiposdepago',
  INFORMES: '/api/informes',
} as const;

/**
 * Estados de pedidos
 */
export const PEDIDO_ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_ENTREGA: 'en_entrega',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
} as const;

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  PEDIDOS: '/pedidos',
  CLIENTES: '/clientes',
  PRODUCTOS: '/productos',
  INFORMES: '/informes',
} as const;

/**
 * Nombres de stores de IndexedDB
 */
export const DB_STORES = {
  CLIENTES: 'clientes',
  PEDIDOS: 'pedidos',
  PRODUCTOS: 'productos',
  PAGOS: 'pagos',
  ZONAS: 'zonas',
  TIPOS_PAGO: 'tiposPago',
} as const;

/**
 * Configuración de IndexedDB
 */
export const DB_CONFIG = {
  NAME: 'AquaDeliveryDB',
  VERSION: 1,
} as const;

