/**
 * ClientesController - Controlador principal de la sección de clientes
 * Responsabilidad: Coordinar entre Service, View y Filters
 * Principio SOLID: Dependency Inversion Principle (DIP) - Depende de abstracciones
 */
class ClientesController {
    constructor() {
        this.service = window.clientesService;
        this.view = window.clientesView;
        this.filters = window.clientesFilters;
        this.clientes = [];
        this.searchTimeout = null;
    }

    /**
     * Inicializa el controlador
     */
    async init() {
        console.log('🎮 Inicializando ClientesController...');

        this._setupEventListeners();
        await this.loadClientes();

        console.log('✅ ClientesController inicializado');
    }

    /**
     * Carga los clientes desde el servicio
     */
    async loadClientes() {
        try {
            this.view.renderLoading();

            this.clientes = await this.service.getAll();

            // Exponer para compatibilidad con ClientModal
            window.currentClients = this.clientes;

            this._applyFiltersAndRender();

        } catch (error) {
            console.error('❌ Error cargando clientes:', error);
            this.view.renderError(error.message);
        }
    }

    /**
     * Configura los event listeners
     * @private
     */
    _setupEventListeners() {
        // Búsqueda con debounce
        const searchInput = document.getElementById('searchClients');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.filters.setFilter('search', e.target.value);
                    this._applyFiltersAndRender();
                }, 300);
            });
        }

        // Filtro de saldo
        const saldoFilter = document.getElementById('filterClientesSaldo');
        if (saldoFilter) {
            saldoFilter.addEventListener('change', (e) => {
                this.filters.setFilter('saldo', e.target.value);
                this._applyFiltersAndRender();
            });
        }

        // Filtro de retornables
        const retornablesFilter = document.getElementById('filterClientesRetornables');
        if (retornablesFilter) {
            retornablesFilter.addEventListener('change', (e) => {
                this.filters.setFilter('retornables', e.target.value);
                this._applyFiltersAndRender();
            });
        }

        console.log('✅ Event listeners configurados');
    }

    /**
     * Aplica filtros y renderiza
     * @private
     */
    _applyFiltersAndRender() {
        const filtered = this.filters.apply(this.clientes);
        this.view.render(filtered);
    }

    /**
     * Limpia todos los filtros
     */
    clearFilters() {
        console.log('🔄 Limpiando filtros...');

        this.filters.clearAll();

        // Limpiar UI
        const searchInput = document.getElementById('searchClients');
        if (searchInput) searchInput.value = '';

        const saldoFilter = document.getElementById('filterClientesSaldo');
        if (saldoFilter) saldoFilter.value = 'todos';

        const retornablesFilter = document.getElementById('filterClientesRetornables');
        if (retornablesFilter) retornablesFilter.value = 'todos';

        this._applyFiltersAndRender();
    }

    /**
     * Edita un cliente
     * @param {number} id - ID del cliente
     */
    editClient(id) {
        const cliente = this.clientes.find(c => (c.id || c.codigo) == id);

        if (!cliente) {
            console.error('❌ Cliente no encontrado:', id);
            return;
        }

        if (window.clientModal) {
            window.clientModal.show(cliente);
        } else {
            alert('Modal de cliente no disponible');
        }
    }

    /**
     * Elimina un cliente
     * @param {number} id - ID del cliente
     */
    async deleteClient(id) {
        if (!confirm('¿Estás seguro de eliminar este cliente?')) {
            return;
        }

        try {
            await this.service.delete(id);
            alert('Cliente eliminado correctamente');
            await this.loadClientes();
        } catch (error) {
            alert('Error eliminando cliente: ' + error.message);
        }
    }

    /**
     * Muestra el modal de nuevo cliente
     */
    showCreateModal() {
        if (window.clientModal) {
            window.clientModal.show();
        } else {
            alert('Modal de cliente no disponible');
        }
    }
}

// Exponer clase globalmente
window.ClientesController = ClientesController;

// Funciones globales para compatibilidad
window.clearClientesFilters = function () {
    if (window.clientesController) {
        window.clientesController.clearFilters();
    }
};

window.showCreateClientModal = function () {
    if (window.clientesController) {
        window.clientesController.showCreateModal();
    }
};

window.loadClientesData = async function () {
    if (window.clientesController) {
        await window.clientesController.loadClientes();
    }
};

console.log('✅ ClientesController definido');
