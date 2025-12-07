/**
 * ClientesView - Capa de presentación para clientes
 * Responsabilidad: Renderizar la UI y manejar la presentación
 * Principio SOLID: Single Responsibility Principle (SRP)
 */
class ClientesView {
  constructor() {
    this.container = document.getElementById('clientesList');
  }

  /**
   * Renderiza la lista de clientes
   * @param {Array} clientes - Lista de clientes a renderizar
   */
  render(clientes) {
    if (!this.container) {
      console.error('❌ Contenedor de clientes no encontrado');
      return;
    }

    if (clientes.length === 0) {
      this.renderEmpty();
      return;
    }

    this.container.innerHTML = `
      <div class="products-list">
        ${clientes.map(cliente => this._renderClientCard(cliente)).join('')}
      </div>
    `;
  }

  /**
   * Renderiza una tarjeta de cliente
   * @private
   */
  _renderClientCard(cliente) {
    const id = cliente.id || cliente.codigo;
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido || ''}`.trim();
    const saldo = parseFloat(cliente.saldo || 0);
    const retornables = parseInt(cliente.retornables || 0);
    const saldoClass = saldo > 0 ? 'badge-inactive' : 'badge-active';
    const saldoText = saldo > 0 ? 'Debe' : saldo < 0 ? 'A favor' : 'Al día';

    return `
      <div class="product-card">
        <div class="product-image">
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            👤
          </div>
        </div>
        <div class="product-content">
          <div class="product-header">
            <h4 class="product-title">${nombreCompleto}</h4>
            <span class="product-badge ${saldoClass}">
              ${saldoText}
            </span>
          </div>
          <div class="product-info">
            <div class="info-item">
              <span class="info-icon">📞</span>
              <span class="info-value">${cliente.telefono || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">💰</span>
              <span class="info-value">$${saldo.toFixed(2)}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🔄</span>
              <span class="info-value">${retornables} ret.</span>
            </div>
          </div>
          <div class="product-actions">
            <button onclick="window.clientesController.editClient(${id})" class="btn-action btn-edit" title="Editar cliente">
              <span class="btn-icon">✏️</span>
              <span class="btn-text">Editar</span>
            </button>
            <button onclick="window.showClientPaymentModal(${id})" class="btn-action" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);" title="Cobrar">
              <span class="btn-icon">💳</span>
              <span class="btn-text">Cobrar</span>
            </button>
            <button onclick="window.clientesController.deleteClient(${id})" class="btn-action btn-delete" title="Eliminar cliente">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el estado vacío
   */
  renderEmpty() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h4>No se encontraron clientes</h4>
        <p>Intenta con otros filtros de búsqueda</p>
      </div>
    `;
  }

  /**
   * Renderiza el estado de carga
   */
  renderLoading() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="spinner"></div>
        <h4>Cargando clientes...</h4>
        <p>Preparando tu base de datos</p>
      </div>
    `;
  }

  /**
   * Renderiza un error
   * @param {string} message - Mensaje de error
   */
  renderError(message) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h4>Error cargando clientes</h4>
        <p>${message}</p>
      </div>
    `;
  }
}

// Exponer clase globalmente
window.ClientesView = ClientesView;

// Crear instancia global
window.clientesView = new ClientesView();
