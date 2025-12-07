// Configuración de la API para el frontend
const API_CONFIG = {
  // URL base del backend - Auto-detecta entorno
  // En desarrollo: localhost
  // En producción: Koyeb backend
  BASE_URL: (() => {
    // Si estamos en el navegador
    if (typeof window !== 'undefined') {
      // Producción: cualquier dominio que NO sea localhost
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://dull-benny-hernanpa-b7cac3cd.koyeb.app'; // ✅ Backend en Koyeb
      }
    }
    // Desarrollo: localhost
    return 'http://localhost:8001';
  })(),

  // Endpoints
  ENDPOINTS: {
    AUTH: '/auth',
    PRODUCTOS: '/api/productos',
    CLIENTES: '/api/clientes',
    PEDIDOS: '/api/pedidos',
    PAGOS: '/api/pagos',
    ZONAS: '/api/zonas',
    TIPOSDEPAGO: '/api/tiposdepago',
    INFORMES: '/api/informes'
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
  },

  // Helper para debug
  isProduction: function () {
    if (typeof window !== 'undefined') {
      return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }
    return false;
  }
};

// Exportar para uso en módulos ES6
export default API_CONFIG;

// También hacer disponible globalmente para scripts inline
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}
