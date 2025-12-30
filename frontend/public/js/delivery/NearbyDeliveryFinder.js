/**
 * NearbyDeliveryFinder - Búsqueda manual de pedidos cercanos
 * Responsabilidad: Encontrar y mostrar pedidos cercanos sin tracking continuo
 */
class NearbyDeliveryFinder {
    constructor() {
        this.maxResults = 10;
        this.currentResults = [];
    }

    /**
     * Encuentra pedidos cercanos a la ubicación actual
     * @param {number} maxDistance - Distancia máxima en metros (null = todos)
     * @returns {Promise<Array>} Lista de pedidos ordenados por proximidad
     */
    async findNearbyDeliveries(maxDistance = null) {
        console.log('🎯 Buscando pedidos cercanos...');

        try {
            // 1. Obtener ubicación actual
            const position = await window.GeoUtils.getCurrentPosition();
            console.log('📍 Ubicación actual:', position);

            // 2. Obtener pedidos pendientes
            const deliveries = this.getPendingDeliveries();
            console.log('📦 Pedidos pendientes:', deliveries.length);

            if (deliveries.length === 0) {
                this.showNoDeliveriesMessage();
                return [];
            }

            // 3. Calcular distancias
            const withDistances = deliveries
                .filter(d => d.latitud && d.longitud) // Solo con ubicación
                .map(d => ({
                    ...d,
                    distance: window.GeoUtils.calculateDistance(
                        position.lat,
                        position.lng,
                        parseFloat(d.latitud),
                        parseFloat(d.longitud)
                    )
                }));

            console.log('📏 Pedidos con distancias calculadas:', withDistances.length);

            // 4. Filtrar por distancia máxima (si se especifica)
            const filtered = maxDistance
                ? withDistances.filter(d => d.distance <= maxDistance)
                : withDistances;

            // 5. Ordenar por proximidad
            const sorted = filtered.sort((a, b) => a.distance - b.distance);

            // 6. Limitar resultados
            const limited = sorted.slice(0, this.maxResults);

            this.currentResults = limited;
            console.log(`✅ Encontrados ${limited.length} pedidos cercanos`);

            // 7. Mostrar resultados
            this.displayResults(limited, position);

            return limited;

        } catch (error) {
            console.error('❌ Error buscando pedidos cercanos:', error);
            this.showError(error.message);
            throw error;
        }
    }

    /**
     * Obtiene los pedidos pendientes
     * @returns {Array} Lista de pedidos pendientes
     */
    getPendingDeliveries() {
        // Obtener de las variables globales
        const allPedidos = window.allPedidos || window.currentPedidos || [];
        return allPedidos.filter(p => p.estado === 'pendient');
    }

    /**
     * Muestra los resultados en un modal
     * @param {Array} deliveries - Lista de pedidos con distancias
     * @param {Object} currentPosition - Posición actual del usuario
     */
    displayResults(deliveries, currentPosition) {
        if (deliveries.length === 0) {
            this.showNoResultsMessage();
            return;
        }

        const modalHTML = `
      <div id="nearbyResultsModal" class="modal-overlay show">
        <div class="modal-content nearby-modal-content">
          <div class="nearby-modal-header">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.5rem;">📍</span>
              <h3 style="margin: 0; color: #111827; font-size: 1.5rem; font-weight: 700;">Pedidos Cercanos</h3>
            </div>
            <button onclick="window.closeNearbyResults()" class="nearby-modal-close">
              ×
            </button>
          </div>

          <div class="nearby-results-list">
            ${deliveries.map((delivery, index) => this.renderDeliveryItem(delivery, index)).join('')}
          </div>

          ${deliveries.length >= this.maxResults ? `
            <div class="nearby-modal-footer">
              <p>Mostrando los ${this.maxResults} pedidos más cercanos</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;

        // Remover modal anterior si existe
        const existingModal = document.getElementById('nearbyResultsModal');
        if (existingModal) existingModal.remove();

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Renderiza un item de pedido
     * @param {Object} delivery - Pedido con distancia
     * @param {number} index - Índice en la lista
     * @returns {string} HTML del item
     */
    renderDeliveryItem(delivery, index) {
        const nombreCliente = delivery.cliente_nombre || `${delivery.nombre || ''} ${delivery.apellido || ''}`.trim();
        const direccion = delivery.direccion || 'Sin dirección';
        const distanceText = window.GeoUtils.formatDistance(delivery.distance);
        const isClosest = index === 0;

        return `
      <div class="nearby-item ${isClosest ? 'closest' : ''}">
        <div class="nearby-item-distance">
          <div class="distance-badge ${isClosest ? 'closest-badge' : ''}">
          ${distanceText}
          </div>
          ${isClosest ? '<div class="closest-label">MÁS CERCANO</div>' : ''}
        </div>

        <div class="nearby-item-content">
          <div class="nearby-item-header">
            <strong class="nearby-item-number">Pedido #${delivery.codigo || delivery.id}</strong>
          </div>
          <div class="nearby-item-info">
            <div class="info-row">
              <span class="info-icon">👤</span>
              <span class="info-text">${nombreCliente}</span>
            </div>
            <div class="info-row">
              <span class="info-icon">📍</span>
              <span class="info-text address-text">${direccion}</span>
            </div>
          </div>
        </div>

        <div class="nearby-item-actions">
          <button onclick="window.navigateToDelivery(${delivery.codigo || delivery.id})" class="btn-navigate">
            🗺️ Navegar
          </button>
          <button onclick="window.startDelivery(${delivery.codigo || delivery.id}); window.closeNearbyResults()" class="btn-deliver">
            🚚 Entregar
          </button>
        </div>
      </div>
    `;
    }

    /**
     * Muestra mensaje cuando no hay pedidos pendientes
     */
    showNoDeliveriesMessage() {
        if (window.showNotification) {
            window.showNotification('No hay pedidos pendientes con ubicación', 'info');
        } else {
            alert('No hay pedidos pendientes con ubicación');
        }
    }

    /**
     * Muestra mensaje cuando no hay resultados
     */
    showNoResultsMessage() {
        if (window.showNotification) {
            window.showNotification('No se encontraron pedidos cercanos', 'info');
        } else {
            alert('No se encontraron pedidos cercanos');
        }
    }

    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        if (window.showNotification) {
            window.showNotification(`Error: ${message}`, 'error');
        } else {
            alert(`Error: ${message}`);
        }
    }
}

// Funciones globales
window.closeNearbyResults = function () {
    const modal = document.getElementById('nearbyResultsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
};

window.navigateToDelivery = function (deliveryId) {
    const delivery = window.nearbyDeliveryFinder.currentResults.find(
        d => (d.codigo || d.id) == deliveryId
    );

    if (delivery && delivery.latitud && delivery.longitud) {
        // Abrir Google Maps o la app de mapas del dispositivo
        const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.latitud},${delivery.longitud}`;
        window.open(url, '_blank');
    }
};

// Crear instancia global
window.nearbyDeliveryFinder = new NearbyDeliveryFinder();
window.NearbyDeliveryFinder = NearbyDeliveryFinder;

console.log('✅ NearbyDeliveryFinder module loaded');
