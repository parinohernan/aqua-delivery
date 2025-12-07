// Configuración de la API para el frontend
// Usa variables de entorno de Astro (PUBLIC_API_URL)

// Obtener URL del backend desde variable de entorno o usar fallback
const getBackendUrl = () => {
  // En build time (Astro), usar import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.PUBLIC_API_URL;
    if (envUrl) {
      console.log('✅ Usando backend desde PUBLIC_API_URL:', envUrl);
      return envUrl;
    }
  }

  // Fallback para desarrollo
  const fallbackUrl = 'http://localhost:8001';
  console.log('⚠️ PUBLIC_API_URL no definida, usando fallback:', fallbackUrl);
  return fallbackUrl;
};

const API_CONFIG = {
  // URL base del backend desde variable de entorno
  BASE_URL: getBackendUrl(),

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
