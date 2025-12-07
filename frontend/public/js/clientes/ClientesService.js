/**
 * ClientesService - Capa de servicio para manejar operaciones de datos de clientes
 * Responsabilidad: Comunicación con la API y manejo de datos
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class ClientesService {
    constructor() {
        this.baseUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
        this.endpoint = '/api/clientes';
    }

    /**
     * Obtiene el token de autenticación
     * @private
     */
    _getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Obtiene todos los clientes
     * @returns {Promise<Array>} Lista de clientes
     */
    async getAll() {
        try {
            console.log('📡 Obteniendo clientes desde:', `${this.baseUrl}${this.endpoint}`);

            const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
                headers: this._getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }

            const clientes = await response.json();
            console.log('✅ Clientes obtenidos:', clientes.length);
            return clientes;

        } catch (error) {
            console.error('❌ Error obteniendo clientes:', error);
            throw error;
        }
    }

    /**
     * Elimina un cliente
     * @param {number} id - ID del cliente
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(id) {
        try {
            console.log('🗑️ Eliminando cliente:', id);

            const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
                method: 'DELETE',
                headers: this._getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            console.log('✅ Cliente eliminado');
            return true;

        } catch (error) {
            console.error('❌ Error eliminando cliente:', error);
            throw error;
        }
    }

    /**
     * Actualiza un cliente
     * @param {number} id - ID del cliente
     * @param {Object} data - Datos del cliente
     * @returns {Promise<Object>} Cliente actualizado
     */
    async update(id, data) {
        try {
            console.log('📝 Actualizando cliente:', id);

            const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
                method: 'PUT',
                headers: this._getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const cliente = await response.json();
            console.log('✅ Cliente actualizado');
            return cliente;

        } catch (error) {
            console.error('❌ Error actualizando cliente:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo cliente
     * @param {Object} data - Datos del cliente
     * @returns {Promise<Object>} Cliente creado
     */
    async create(data) {
        try {
            console.log('➕ Creando cliente');

            const response = await fetch(`${this.baseUrl}${this.endpoint}`, {
                method: 'POST',
                headers: this._getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const cliente = await response.json();
            console.log('✅ Cliente creado');
            return cliente;

        } catch (error) {
            console.error('❌ Error creando cliente:', error);
            throw error;
        }
    }
}

// Exponer clase globalmente
window.ClientesService = ClientesService;

// Crear instancia global
window.clientesService = new ClientesService();
