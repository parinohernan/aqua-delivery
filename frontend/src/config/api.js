// Configuración de la API para el frontend
const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'https://back-adm.fly.dev',
  
  // Endpoints
  ENDPOINTS: {
    LOGIN: '/auth/login',
    CLIENTES: '/api/clientes',
    PRODUCTOS: '/api/productos',
    PEDIDOS: '/api/pedidos',
    PAGOS: '/api/pagos',
    ZONAS: '/api/zonas',
    TIPOS_PAGO: '/api/tiposdepago',
    INFORMES: '/api/informes'
  },
  
  // Función para obtener URL completa
  getUrl: function(endpoint) {
    return this.BASE_URL + endpoint;
  },
  
  // Función para obtener URL de endpoint específico
  getEndpointUrl: function(endpointName) {
    const endpoint = this.ENDPOINTS[endpointName];
    if (!endpoint) {
      throw new Error(`Endpoint no encontrado: ${endpointName}`);
    }
    return this.getUrl(endpoint);
  }
};

// Exportar para uso en módulos ES6
export default API_CONFIG;

// También hacer disponible globalmente para scripts inline
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
