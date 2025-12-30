/**
 * Declaraciones de tipos globales
 */

declare global {
  interface Window {
    // Configuración de API
    API_CONFIG?: {
      BASE_URL: string;
      ENDPOINTS: {
        LOGIN: string;
        CLIENTES: string;
        PRODUCTOS: string;
        PEDIDOS: string;
        PAGOS: string;
        ZONAS: string;
        TIPOS_PAGO: string;
        INFORMES: string;
      };
      getUrl: (endpoint: string) => string;
      getEndpointUrl: (endpointName: string) => string;
    };
  }
}

export {};

