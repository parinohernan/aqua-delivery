/**
 * Constantes de la aplicación
 */

/**
 * Configuración de la aplicación
 */
/** Solo dígitos, para enlaces wa.me */
export const WHATSAPP_NUMBER_DIGITS =
  import.meta.env.VITE_WHATSAPP_NUMBER || '5492924406159';

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
  ALQUILERES: '/api/alquileres',
  EVENTOS_GPS: '/api/eventos-gps',
  VENDEDORES: '/api/vendedores',
  UPLOAD_PRODUCT_IMAGE: '/api/upload/product-image',
  EXPENSES: '/api/expenses',
  VEHICLES: '/api/vehicles',
  EXPENSE_TYPES: '/api/expense-types',
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
  GPS: '/gps',
  EXPENSES: '/expenses',
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

