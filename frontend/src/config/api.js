// Configuración de la API para el frontend
const API_CONFIG = {
  // URL base del backend - CAMBIAR A PRODUCCIÓN ANTES DE DEPLOY
  BASE_URL: 'http://localhost:8001', // Usar 'https://back-adm.fly.dev' para producción

  // Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    PRODUCTOS: '/api/productos',
    CLIENTES: '/api/clientes',
    PEDIDOS: '/api/pedidos'
  },

  // Función para obtener URL completa
  getUrl: function (endpoint) {
    return this.BASE_URL + endpoint;
  },

  // Función para obtener URL de endpoint específico
  getEndpointUrl: function (endpointName) {
    const endpoint = this.ENDPOINTS[endpointName];
    if (!endpoint) {
      throw new Error(`Endpoint no encontrado: ${endpointName} `);
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
