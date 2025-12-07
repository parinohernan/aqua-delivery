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
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; position: sticky; top: 0; background: white; padding-bottom: 1rem; border-bottom: 2px solid #e5e7eb;">
            <h3 style="margin: 0; color: #111827;">📍 Pedidos Cercanos</h3>
            <button onclick="window.closeNearbyResults()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>

          <div class="nearby-results-list">
            ${deliveries.map((delivery, index) => this.renderDeliveryItem(delivery, index)).join('')}
          </div>

          ${deliveries.length >= this.maxResults ? `
            <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
              Mostrando los ${this.maxResults} pedidos más cercanos
            </p>
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
      <div class="nearby-item ${isClosest ? 'closest' : ''}" style="
        background: ${isClosest ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : '#f9fafb'};
        border: 2px solid ${isClosest ? '#3b82f6' : '#e5e7eb'};
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 0.75rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.2s ease;
      " onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='translateX(0)'">
        
        <div class="distance-badge" style="
          background: ${isClosest ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #6b7280, #4b5563)'};
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.875rem;
          min-width: 60px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          ${distanceText}
        </div>

        <div class="delivery-info" style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <strong style="color: #111827; font-size: 1rem;">Pedido #${delivery.codigo || delivery.id}</strong>
            ${isClosest ? '<span style="background: #10b981; color: white; padding: 0.125rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">MÁS CERCANO</span>' : ''}
          </div>
          <p style="margin: 0.25rem 0; color: #374151; font-size: 0.875rem;">
            <strong>👤</strong> ${nombreCliente}
          </p>
          <p style="margin: 0.25rem 0; color: #6b7280; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <strong>📍</strong> ${direccion}
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <button onclick="window.navigateToDelivery(${delivery.codigo || delivery.id})" style="
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.875rem;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(16, 185, 129, 0.25)'">
            🗺️ Navegar
          </button>
          <button onclick="window.startDelivery(${delivery.codigo || delivery.id}); window.closeNearbyResults()" style="
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.875rem;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
            transition: all 0.2s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59, 130, 246, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59, 130, 246, 0.25)'">
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
