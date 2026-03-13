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
  RUTAS: '/api/rutas',
  TIPOS_PAGO: '/api/tiposdepago',
  INFORMES: '/api/informes',
} as const;

/**
 * Estados de pedidos
 */
export const PEDIDO_ESTADOS = {
  PENDIENTE: 'pendient',
  EN_PROCESO: 'proceso',
  ENTREGADO: 'entregad',
  ANULADO: 'anulado',
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
  MAPA: '/mapa',
  RUTAS: '/rutas',
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

