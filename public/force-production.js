// Script para forzar el uso de variables de producción localmente
// Útil para probar la conexión con el backend de producción desde localhost

console.log('🔧 Forzando configuración de producción...');

// Override de la función de detección de entorno
window.FORCE_PRODUCTION = true;

// Función personalizada para cargar variables de producción
async function loadProductionVars() {
    try {
        const response = await fetch('/env.production');
        if (!response.ok) {
            throw new Error('No se pudo cargar env.production');
        }
        
        const envText = await response.text();
        const envVars = {};
        
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
        console.error('Error cargando variables de producción:', error);
        return {
            VITE_API_BASE_URL: 'https://back-adm.fly.dev',
            VITE_APP_NAME: 'AquaDelivery',
            VITE_DEBUG_MODE: 'true',
            VITE_LOG_API_CALLS: 'true'
        };
    }
}

// Inicializar con variables de producción
window.initProductionConfig = async function() {
    window.ENV_VARS = await loadProductionVars();
    console.log('✅ Variables de producción cargadas:', window.ENV_VARS);
    console.log('🌐 Backend URL:', window.ENV_VARS.VITE_API_BASE_URL);
    return window.ENV_VARS;
};

console.log('📋 Para usar: await initProductionConfig() en la consola');
console.log('📋 Luego: location.reload() para recargar con nueva config');
