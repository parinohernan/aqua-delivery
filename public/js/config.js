// config.js - Configuración del frontend para producción

const CONFIG = {
    // URLs del backend
    API: {
        // IMPORTANTE: Reemplaza esta URL con la URL real de tu backend en Fly.io
        PRODUCTION: 'https://tu-app-name.fly.dev',  // ⚠️ CAMBIAR POR TU URL REAL
        DEVELOPMENT: 'http://localhost:8001',
        
        // Detectar automáticamente el entorno
        get BASE_URL() {
            // En Netlify, window.location.hostname será tu dominio de Netlify
            const isProduction = window.location.hostname !== 'localhost' && 
                                window.location.hostname !== '127.0.0.1';
            
            return isProduction ? this.PRODUCTION : this.DEVELOPMENT;
        },
        
        get ENDPOINTS() {
            return {
                AUTH: `${this.BASE_URL}/auth`,
                CLIENTES: `${this.BASE_URL}/api/clientes`,
                PRODUCTOS: `${this.BASE_URL}/api/productos`,
                PEDIDOS: `${this.BASE_URL}/api/pedidos`,
                PAGOS: `${this.BASE_URL}/api/pagos`,
                ZONAS: `${this.BASE_URL}/api/zonas`,
                TIPOS_PAGO: `${this.BASE_URL}/api/tiposdepago`,
                INFORMES: `${this.BASE_URL}/api/informes`,
                HEALTH: `${this.BASE_URL}/health`
            };
        }
    },

    // Configuración de la aplicación
    APP: {
        NAME: 'AquaDelivery',
        VERSION: '1.0.0',
        DESCRIPTION: 'Sistema de gestión de delivery de agua'
    },

    // Configuración de desarrollo
    DEBUG: {
        ENABLED: window.location.hostname === 'localhost',
        LOG_API_CALLS: true,
        LOG_ERRORS: true
    },

    // Configuración de autenticación
    AUTH: {
        TOKEN_KEY: 'aqua_delivery_token',
        USER_KEY: 'aqua_delivery_user',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 horas en millisegundos
    }
};

// Función para obtener la configuración
function getConfig() {
    return CONFIG;
}

// Función para actualizar la URL del backend (útil para configuración dinámica)
function updateBackendURL(newURL) {
    CONFIG.API.PRODUCTION = newURL;
    console.log(`Backend URL actualizada a: ${newURL}`);
}

// Log de configuración en desarrollo
if (CONFIG.DEBUG.ENABLED) {
    console.log('🔧 Configuración de AquaDelivery:', {
        'Backend URL': CONFIG.API.BASE_URL,
        'Environment': window.location.hostname === 'localhost' ? 'Development' : 'Production',
        'Debug Mode': CONFIG.DEBUG.ENABLED
    });
}

// Hacer disponible globalmente
window.CONFIG = CONFIG;
window.getConfig = getConfig;
window.updateBackendURL = updateBackendURL;
