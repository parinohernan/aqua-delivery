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
  clienteToggleStatus: (id: number) => `${API_ENDPOINTS.CLIENTES}/${id}/toggle-status`,
  
  // Productos
  productos: () => API_ENDPOINTS.PRODUCTOS,
  producto: (id: number) => `${API_ENDPOINTS.PRODUCTOS}/${id}`,
  uploadProductImage: () => API_ENDPOINTS.UPLOAD_PRODUCT_IMAGE,
  
  // Pedidos
  pedidos: () => API_ENDPOINTS.PEDIDOS,
  pedido: (id: number) => `${API_ENDPOINTS.PEDIDOS}/${id}`,
  
  // Pagos
  pagos: () => API_ENDPOINTS.PAGOS,
  pago: (id: number) => `${API_ENDPOINTS.PAGOS}/${id}`,
  
  // Zonas
  zonas: () => API_ENDPOINTS.ZONAS,
  zona: (id: number) => `${API_ENDPOINTS.ZONAS}/${id}`,
  
  // Rutas de reparto
  rutas: () => API_ENDPOINTS.RUTAS,
  rutasByZona: (zona: string) => `${API_ENDPOINTS.RUTAS}?zona=${encodeURIComponent(zona)}`,
  rutasClientes: (zona: string) => `${API_ENDPOINTS.RUTAS}/clientes?zona=${encodeURIComponent(zona)}`,
  
  // Tipos de pago
  tiposPago: () => API_ENDPOINTS.TIPOS_PAGO,
  tipoPago: (id: number) => `${API_ENDPOINTS.TIPOS_PAGO}/${id}`,
  
  // Informes
  informes: () => API_ENDPOINTS.INFORMES,

  // Alquileres
  alquileres: () => API_ENDPOINTS.ALQUILERES,
  alquiler: (id: number) => `${API_ENDPOINTS.ALQUILERES}/${id}`,
  alquilerCancelar: (id: number) => `${API_ENDPOINTS.ALQUILERES}/${id}/cancelar`,
  alquileresCobrosEjecutar: () => `${API_ENDPOINTS.ALQUILERES}/cobros/ejecutar`,
  clienteAlquileres: (id: number) => `${API_ENDPOINTS.CLIENTES}/${id}/alquileres`,
  clienteEstadoCuenta: (id: number) => `${API_ENDPOINTS.CLIENTES}/${id}/estado-cuenta`,
} as const;

