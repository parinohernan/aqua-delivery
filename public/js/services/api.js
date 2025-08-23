class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    // Obtener URL base dinámicamente desde la configuración
    get baseURL() {
        if (window.CONFIG && window.CONFIG.API && window.CONFIG.API.BASE_URL) {
            return window.CONFIG.API.BASE_URL;
        }
        
        // Fallback si no hay configuración cargada
        const isProduction = window.location.hostname !== 'localhost' && 
                            window.location.hostname !== '127.0.0.1';
        return isProduction ? 'https://back-adm.fly.dev' : 'http://localhost:8001';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        // Log de API calls si está habilitado
        if (window.CONFIG && window.CONFIG.DEBUG && window.CONFIG.DEBUG.LOG_API_CALLS) {
            console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`, {
                headers: config.headers,
                body: config.body
            });
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
                throw new Error(error.error || `Error HTTP ${response.status}`);
            }

            const result = await response.json();
            
            // Log de respuesta exitosa si está habilitado
            if (window.CONFIG && window.CONFIG.DEBUG && window.CONFIG.DEBUG.LOG_API_CALLS) {
                console.log(`✅ API Response: ${options.method || 'GET'} ${url}`, result);
            }
            
            return result;
        } catch (error) {
            // Log de error si está habilitado
            if (window.CONFIG && window.CONFIG.DEBUG && window.CONFIG.DEBUG.LOG_ERRORS) {
                console.error(`❌ API Error: ${options.method || 'GET'} ${url}`, error);
            }
            throw error;
        }
    }

    // Auth
    async login(telegramId, codigoEmpresa) {
        try {
            const response = await this.request('/auth/login', {
                method: 'POST',
                body: { telegramId, codigoEmpresa }
            });

            // Guardar token automáticamente si el login es exitoso
            if (response.token) {
                this.setToken(response.token);
                storage.setToken(response.token);
                storage.setVendedor(response.vendedor);
            }

            return response;
        } catch (error) {
            // Limpiar cualquier token existente en caso de error
            this.token = null;
            storage.removeToken();
            throw error;
        }
    }

    // Clientes
    async getClientes(search = '') {
        return this.request(`/clientes?search=${search}`);
    }

    async createCliente(cliente) {
        return this.request('/clientes', {
            method: 'POST',
            body: cliente
        });
    }

    async updateCliente(id, cliente) {
        return this.request(`/clientes/${id}`, {
            method: 'PUT',
            body: cliente
        });
    }

    // Pedidos
    async getPedidos(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/pedidos?${params}`);
    }

    async createPedido(pedido) {
        return this.request('/pedidos', {
            method: 'POST',
            body: pedido
        });
    }

    async updatePedidoEstado(id, estado, tipoPago = null) {
        return this.request(`/pedidos/${id}/estado`, {
            method: 'PUT',
            body: { estado, tipoPago }
        });
    }

    async updatePedidoZona(id, zona) {
        return this.request(`/pedidos/${id}/zona`, {
            method: 'PUT',
            body: { zona }
        });
    }

    // Productos
    async getProductos() {
        return this.request('/productos');
    }

    async createProducto(producto) {
        return this.request('/productos', {
            method: 'POST',
            body: producto
        });
    }

    async updateProducto(id, producto) {
        return this.request(`/productos/${id}`, {
            method: 'PUT',
            body: producto
        });
    }

    // Pagos
    async getPagos(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.request(`/pagos?${params}`);
    }

    async createPago(pago) {
        return this.request('/pagos', {
            method: 'POST',
            body: pago
        });
    }

    async updatePago(id, pago) {
        return this.request(`/pagos/${id}`, {
            method: 'PUT',
            body: pago
        });
    }

    // Zonas
    async getZonas() {
        return this.request('/zonas');
    }

    // Tipos de pago
    async getTiposPago() {
        return this.request('/tiposdepago');
    }
}

const api = new ApiService();