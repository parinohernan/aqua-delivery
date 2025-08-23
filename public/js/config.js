// config.js - Configuración del frontend con variables de entorno

// Función para cargar variables de entorno desde archivos
async function loadEnvVars() {
    // Detectar entorno - forzar producción si no es localhost:8000 o localhost:4321
    const isLocalDev = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
                       (window.location.port === '8000' || window.location.port === '4321' || window.location.port === '3000');
    
    const envFile = isLocalDev ? '/env.development' : '/env.production';
    
    console.log('🌍 Entorno detectado:', {
        hostname: window.location.hostname,
        port: window.location.port,
        isLocalDev,
        envFile
    });
    
    try {
        const response = await fetch(envFile);
        if (!response.ok) {
            throw new Error(`No se pudo cargar ${envFile}`);
        }
        
        const envText = await response.text();
        const envVars = {};
        
        // Parsear el archivo .env
        envText.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return envVars;
    } catch (error) {
        console.warn(`No se pudo cargar ${envFile}, usando valores por defecto:`, error);
        
        // Valores por defecto si no se puede cargar el archivo
        return {
            VITE_API_BASE_URL: isLocalDev ? 'http://localhost:8001' : 'https://back-adm.fly.dev',
            VITE_APP_NAME: 'AquaDelivery',
            VITE_APP_VERSION: '1.0.0',
            VITE_DEBUG_MODE: isLocalDev ? 'true' : 'false',
            VITE_LOG_API_CALLS: isLocalDev ? 'true' : 'false',
            VITE_NODE_ENV: isLocalDev ? 'development' : 'production'
        };
    }
}

// Variables de entorno cargadas
let ENV_VARS = {};

const CONFIG = {
    // URLs del backend
    API: {
        // Obtener URL base desde variables de entorno
        get BASE_URL() {
            return ENV_VARS.VITE_API_BASE_URL || 'https://back-adm.fly.dev';
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
        get NAME() {
            return ENV_VARS.VITE_APP_NAME || 'AquaDelivery';
        },
        get VERSION() {
            return ENV_VARS.VITE_APP_VERSION || '1.0.0';
        },
        DESCRIPTION: 'Sistema de gestión de delivery de agua'
    },

    // Configuración de desarrollo
    DEBUG: {
        get ENABLED() {
            return ENV_VARS.VITE_DEBUG_MODE === 'true';
        },
        get LOG_API_CALLS() {
            return ENV_VARS.VITE_LOG_API_CALLS === 'true';
        },
        LOG_ERRORS: true
    },

    // Variables de entorno
    ENV: {
        get NODE_ENV() {
            return ENV_VARS.VITE_NODE_ENV || 'development';
        },
        get IS_PRODUCTION() {
            return this.NODE_ENV === 'production';
        },
        get IS_DEVELOPMENT() {
            return this.NODE_ENV === 'development';
        }
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

// Función para inicializar la configuración
async function initConfig() {
    try {
        ENV_VARS = await loadEnvVars();
        
        // Log de configuración en desarrollo
        if (CONFIG.DEBUG.ENABLED) {
            console.log('🔧 Configuración de AquaDelivery:', {
                'Backend URL': CONFIG.API.BASE_URL,
                'Environment': CONFIG.ENV.NODE_ENV,
                'Debug Mode': CONFIG.DEBUG.ENABLED,
                'Variables cargadas': Object.keys(ENV_VARS).length
            });
        }
        
        return CONFIG;
    } catch (error) {
        console.error('Error inicializando configuración:', error);
        return CONFIG;
    }
}

// Función para obtener la configuración
function getConfig() {
    return CONFIG;
}

// Función para actualizar la URL del backend dinámicamente
function updateBackendURL(newURL) {
    ENV_VARS.VITE_API_BASE_URL = newURL;
    console.log(`Backend URL actualizada a: ${newURL}`);
}

// Función para recargar variables de entorno
async function reloadEnvVars() {
    ENV_VARS = await loadEnvVars();
    console.log('Variables de entorno recargadas');
    return ENV_VARS;
}

// Hacer disponible globalmente
window.CONFIG = CONFIG;
window.ENV_VARS = ENV_VARS;
window.getConfig = getConfig;
window.updateBackendURL = updateBackendURL;
window.reloadEnvVars = reloadEnvVars;
window.initConfig = initConfig;
