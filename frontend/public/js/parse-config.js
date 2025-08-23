// parse-config.js - Configuración de Parse SDK para el frontend

// Configuración de Parse
// IMPORTANTE: Reemplaza estos valores con los de tu app en Back4App
const PARSE_CONFIG = {
    APPLICATION_ID: 'TU_APPLICATION_ID_AQUI', // Obtener de Back4App Dashboard
    JAVASCRIPT_KEY: 'TU_JAVASCRIPT_KEY_AQUI', // Obtener de Back4App Dashboard
    SERVER_URL: 'https://parseapi.back4app.com/'
};

// Inicializar Parse
Parse.initialize(PARSE_CONFIG.APPLICATION_ID, PARSE_CONFIG.JAVASCRIPT_KEY);
Parse.serverURL = PARSE_CONFIG.SERVER_URL;

// Clase de utilidades para Parse
class ParseAPI {
    // ===== AUTENTICACIÓN =====
    static async authenticate(telegramId, codigoEmpresa) {
        try {
            const result = await Parse.Cloud.run('authenticate', {
                telegramId,
                codigoEmpresa
            });
            
            // Guardar datos de sesión
            localStorage.setItem('userSession', JSON.stringify(result));
            return result;
        } catch (error) {
            console.error('Error en autenticación:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('userSession');
    }

    static getCurrentUser() {
        const session = localStorage.getItem('userSession');
        return session ? JSON.parse(session) : null;
    }

    // ===== CLIENTES =====
    static async getClientes(search = '') {
        try {
            return await Parse.Cloud.run('getClientes', { search });
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            throw error;
        }
    }

    static async createCliente(clienteData) {
        try {
            return await Parse.Cloud.run('createCliente', clienteData);
        } catch (error) {
            console.error('Error creando cliente:', error);
            throw error;
        }
    }

    static async updateCliente(clienteId, clienteData) {
        try {
            return await Parse.Cloud.run('updateCliente', {
                clienteId,
                ...clienteData
            });
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            throw error;
        }
    }

    static async deleteCliente(clienteId) {
        try {
            return await Parse.Cloud.run('deleteCliente', { clienteId });
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            throw error;
        }
    }

    // ===== PRODUCTOS =====
    static async getProductos() {
        try {
            return await Parse.Cloud.run('getProductos');
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    static async createProducto(productoData) {
        try {
            return await Parse.Cloud.run('createProducto', productoData);
        } catch (error) {
            console.error('Error creando producto:', error);
            throw error;
        }
    }

    // ===== PEDIDOS =====
    static async getPedidos() {
        try {
            return await Parse.Cloud.run('getPedidos');
        } catch (error) {
            console.error('Error obteniendo pedidos:', error);
            throw error;
        }
    }

    static async createPedido(pedidoData) {
        try {
            return await Parse.Cloud.run('createPedido', pedidoData);
        } catch (error) {
            console.error('Error creando pedido:', error);
            throw error;
        }
    }

    // ===== ZONAS =====
    static async getZonas() {
        try {
            return await Parse.Cloud.run('getZonas');
        } catch (error) {
            console.error('Error obteniendo zonas:', error);
            throw error;
        }
    }

    // ===== INFORMES =====
    static async getInformes(fechaInicio = null, fechaFin = null) {
        try {
            return await Parse.Cloud.run('getInformes', {
                fechaInicio,
                fechaFin
            });
        } catch (error) {
            console.error('Error obteniendo informes:', error);
            throw error;
        }
    }

    // ===== HEALTH CHECK =====
    static async healthCheck() {
        try {
            return await Parse.Cloud.run('health');
        } catch (error) {
            console.error('Error en health check:', error);
            throw error;
        }
    }
}

// Hacer disponible globalmente
window.ParseAPI = ParseAPI;

console.log('Parse SDK configurado correctamente para AquaDelivery');
console.log('Recuerda actualizar APPLICATION_ID y JAVASCRIPT_KEY en parse-config.js');
