/**
 * ClientesFilters - Lógica de filtrado de clientes
 * Responsabilidad: Aplicar filtros a la lista de clientes
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class ClientesFilters {
    constructor() {
        this.filters = {
            search: '',
            saldo: 'todos',
            retornables: 'todos'
        };
    }

    /**
     * Actualiza un filtro específico
     * @param {string} filterName - Nombre del filtro
     * @param {any} value - Valor del filtro
     */
    setFilter(filterName, value) {
        this.filters[filterName] = value;
        console.log(`🔍 Filtro actualizado: ${filterName} = ${value}`);
    }

    /**
     * Limpia todos los filtros
     */
    clearAll() {
        this.filters = {
            search: '',
            saldo: 'todos',
            retornables: 'todos'
        };
        console.log('🔄 Filtros limpiados');
    }

    /**
     * Obtiene los filtros actuales
     * @returns {Object} Filtros actuales
     */
    getFilters() {
        return { ...this.filters };
    }

    /**
     * Aplica los filtros a una lista de clientes
     * @param {Array} clientes - Lista de clientes
     * @returns {Array} Lista filtrada
     */
    apply(clientes) {
        let filtered = [...clientes];

        // Filtro de búsqueda
        filtered = this._applySearchFilter(filtered);

        // Filtro de saldo
        filtered = this._applySaldoFilter(filtered);

        // Filtro de retornables
        filtered = this._applyRetornablesFilter(filtered);

        console.log(`✅ Filtros aplicados: ${clientes.length} → ${filtered.length} clientes`);
        return filtered;
    }

    /**
     * Aplica el filtro de búsqueda
     * @private
     */
    _applySearchFilter(clientes) {
        if (!this.filters.search) return clientes;

        const term = this.filters.search.toLowerCase();
        return clientes.filter(c =>
            (c.nombre || '').toLowerCase().includes(term) ||
            (c.apellido || '').toLowerCase().includes(term) ||
            (c.telefono || '').includes(term) ||
            (c.direccion || '').toLowerCase().includes(term)
        );
    }

    /**
     * Aplica el filtro de saldo
     * @private
     */
    _applySaldoFilter(clientes) {
        if (this.filters.saldo === 'todos') return clientes;

        return clientes.filter(c => {
            const saldo = parseFloat(c.saldo || 0);

            switch (this.filters.saldo) {
                case 'positivo':
                    return saldo > 0;
                case 'negativo':
                    return saldo < 0;
                case 'cero':
                    return saldo === 0;
                default:
                    return true;
            }
        });
    }

    /**
     * Aplica el filtro de retornables
     * @private
     */
    _applyRetornablesFilter(clientes) {
        if (this.filters.retornables === 'todos') return clientes;

        return clientes.filter(c => {
            const ret = parseInt(c.retornables || 0);
            return this.filters.retornables === 'con' ? ret > 0 : ret === 0;
        });
    }
}

// Exponer clase globalmente
window.ClientesFilters = ClientesFilters;

// Crear instancia global
window.clientesFilters = new ClientesFilters();
