// Componente para el modal del mapa de pedidos
class MapModal {
  constructor() {
    this.map = null;
    this.markers = [];
    this.pedidosPendientes = [];
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="mapModal" class="hidden modal-overlay">
        <div class="modal-content" style="max-width: 95vw; max-height: 95vh; width: 1200px; height: 800px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 class="modal-title">🗺️ Mapa de Pedidos Pendientes</h4>
            <button onclick="mapModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <!-- Información del mapa -->
          <div style="margin-bottom: 1rem; padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.375rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <p style="margin: 0; font-size: 0.875rem; color: #0369a1;">
                  <strong>📍 Leyenda:</strong> 
                  <span style="color: #dc2626;">🔴 Clientes con pedidos pendientes</span> • 
                  <span style="color: #059669;">🟢 Tu ubicación actual</span>
                </p>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button onclick="mapModal.centerOnUser()" style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                  📍 Mi Ubicación
                </button>
                <button onclick="mapModal.fitAllMarkers()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                  🔍 Ver Todos
                </button>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div id="mapStats" style="margin-bottom: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <!-- Se llenará dinámicamente -->
          </div>
          
          <!-- Contenedor del mapa -->
          <div id="mapContainer" style="width: 100%; height: 600px; border: 1px solid #e5e7eb; border-radius: 0.375rem; background: #f9fafb;">
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
              <div style="text-align: center;">
                <div class="spinner" style="margin: 0 auto 1rem;"></div>
                <p>Cargando mapa...</p>
              </div>
            </div>
          </div>
          
          <!-- Lista de clientes sin geolocalización -->
          <div id="clientesSinGeo" style="margin-top: 1rem; display: none;">
            <details style="border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem;">
              <summary style="cursor: pointer; font-weight: 600; color: #dc2626;">
                ⚠️ Clientes sin geolocalización (<span id="countSinGeo">0</span>)
              </summary>
              <div id="listaSinGeo" style="margin-top: 1rem; max-height: 200px; overflow-y: auto;">
                <!-- Se llenará dinámicamente -->
              </div>
            </details>
          </div>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('mapModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('mapModal');
      if (e.target === modal) {
        this.close();
      }
    });

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  async show() {
    const modal = document.getElementById('mapModal');
    console.log('🗺️ Abriendo mapa de pedidos pendientes...');
    console.log('🔍 Modal element encontrado:', !!modal);
    
    // Verificar si el modal ya está abierto
    if (modal && modal.classList.contains('show')) {
      console.log('⚠️ Modal ya está abierto, cerrando primero...');
      this.close();
      // Esperar un momento para que se complete el cierre
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('show');
      
      console.log('🔍 Clases del modal después de show:', modal.className);
      
      // Verificar estilos computados
      setTimeout(() => {
        const styles = window.getComputedStyle(modal);
        console.log('🔍 Estilos computados del MapModal:', {
          display: styles.display,
          opacity: styles.opacity,
          visibility: styles.visibility,
          position: styles.position,
          zIndex: styles.zIndex
        });
      }, 100);
    } else {
      console.error('❌ Modal element no encontrado');
      return;
    }
    
    try {
      // Cargar pedidos pendientes con datos de clientes
      await this.loadPedidosPendientes();
      
      // Esperar un momento para que el modal sea visible antes de inicializar el mapa
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Inicializar el mapa
      await this.initializeMap();
      
      // Agregar marcadores
      this.addMarkers();
      
      // Mostrar estadísticas
      this.showStats();
      
      // Forzar que Leaflet recalcule el tamaño del mapa
      if (this.map) {
        setTimeout(() => {
          this.map.invalidateSize();
          console.log('🗺️ Tamaño del mapa recalculado');
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Error cargando mapa:', error);
      this.showError('Error cargando el mapa: ' + error.message);
    }
  }

  async loadPedidosPendientes() {
    console.log('📋 Cargando pedidos pendientes...');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('https://back-adm.fly.dev/api/pedidos?estado=pendient', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      this.pedidosPendientes = await response.json();
      console.log('✅ Pedidos pendientes cargados:', this.pedidosPendientes.length);
      
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      throw error;
    }
  }

  async initializeMap() {
    console.log('🗺️ Inicializando mapa...');
    
    // Limpiar mapa existente si existe
    if (this.map) {
      console.log('🧹 Limpiando mapa existente...');
      try {
        this.map.remove();
      } catch (e) {
        console.warn('⚠️ Error al remover mapa anterior:', e);
      }
      this.map = null;
    }
    
    // Verificar que el contenedor esté disponible
    const container = document.getElementById('mapContainer');
    if (!container) {
      throw new Error('Contenedor del mapa no encontrado');
    }
    
    // Limpieza más robusta del contenedor
    console.log('🧹 Limpiando contenedor del mapa...');
    
    // Destruir cualquier instancia de Leaflet
    if (container._leaflet_id) {
      console.log('🗑️ Destruyendo instancia Leaflet anterior...');
      try {
        // Intentar encontrar y destruir el mapa de Leaflet
        const leafletMap = L.DomUtil.get(container._leaflet_id);
        if (leafletMap && leafletMap._leaflet_id) {
          leafletMap.remove();
        }
      } catch (e) {
        console.warn('⚠️ Error al destruir instancia Leaflet:', e);
      }
      container._leaflet_id = null;
    }
    
    // Limpiar completamente el contenido del contenedor
    container.innerHTML = '';
    
    // Remover cualquier clase de Leaflet que pueda quedar
    container.className = container.className.replace(/leaflet-\S+/g, '').trim();
    
    // Agregar clase base para el contenedor
    container.className += ' map-container';
    
    // Esperar un momento para asegurar que la limpieza se complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ubicación por defecto (Buenos Aires)
    const defaultLocation = [-34.6037, -58.3816];
    
    try {
      // Inicializar mapa con configuración PWA (esperar resultado)
      this.map = await initMapPWA('mapContainer', {
        center: defaultLocation,
        zoom: 12
      });
      
      if (!this.map) {
        console.error('❌ No se pudo inicializar el mapa');
        return;
      }
    } catch (error) {
      console.error('💥 Error inicializando mapa:', error);
      return;
    }
    
    // Intentar obtener ubicación del usuario
    this.addUserLocation();
    
    console.log('✅ Mapa inicializado');
  }

  addUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          console.log('📍 Ubicación del usuario obtenida:', userLat, userLng);
          
          // Agregar marcador del usuario
          const userIcon = L.divIcon({
            html: `
              <div style="
                width: 20px; 
                height: 20px; 
                background: #059669; 
                border: 3px solid white; 
                border-radius: 50%; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
              "></div>
            `,
            className: 'user-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          this.userMarker = L.marker([userLat, userLng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup(`
              <div style="text-align: center;">
                <strong>📍 Tu ubicación</strong><br>
                <small>${userLat.toFixed(6)}, ${userLng.toFixed(6)}</small>
              </div>
            `);
          
          // Centrar el mapa en la ubicación del usuario si no hay pedidos
          if (this.pedidosPendientes.length === 0) {
            this.map.setView([userLat, userLng], 15);
          }
        },
        (error) => {
          console.log('⚠️ No se pudo obtener la ubicación del usuario:', error.message);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }

  addMarkers() {
    console.log('📍 Agregando marcadores de clientes...');
    
    // Limpiar marcadores anteriores
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
    
    const clientesConGeo = [];
    const clientesSinGeo = [];
    
    this.pedidosPendientes.forEach(pedido => {
      const cliente = {
        nombre: pedido.cliente_nombre || pedido.nombre || 'Cliente sin nombre',
        direccion: pedido.direccion || 'Sin dirección',
        telefono: pedido.telefono || 'Sin teléfono',
        lat: parseFloat(pedido.latitud),
        lng: parseFloat(pedido.longitud),
        pedidoId: pedido.id || pedido.codigo,
        total: parseFloat(pedido.total || 0)
      };
      
      if (cliente.lat && cliente.lng && !isNaN(cliente.lat) && !isNaN(cliente.lng)) {
        clientesConGeo.push(cliente);
      } else {
        clientesSinGeo.push(cliente);
      }
    });
    
    // Agregar marcadores para clientes con geolocalización
    clientesConGeo.forEach(cliente => {
      const icon = L.divIcon({
        html: `
          <div style="
            width: 16px; 
            height: 16px; 
            background: #dc2626; 
            border: 2px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'client-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const marker = L.marker([cliente.lat, cliente.lng], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width: 200px;">
            <strong style="color: #dc2626;">🧾 Pedido #${cliente.pedidoId}</strong><br>
            <strong>👤 ${cliente.nombre}</strong><br>
            📞 ${cliente.telefono}<br>
            📍 ${cliente.direccion}<br>
            💰 Total: $${cliente.total.toFixed(2)}<br>
            <small style="color: #6b7280;">📍 ${cliente.lat.toFixed(6)}, ${cliente.lng.toFixed(6)}</small>
          </div>
        `);
      
      this.markers.push(marker);
    });
    
    // Mostrar clientes sin geolocalización
    this.showClientesSinGeo(clientesSinGeo);
    
    // Ajustar vista para mostrar todos los marcadores
    if (clientesConGeo.length > 0) {
      this.fitAllMarkers();
    }
    
    console.log(`✅ Marcadores agregados: ${clientesConGeo.length} con geo, ${clientesSinGeo.length} sin geo`);
  }

  showClientesSinGeo(clientesSinGeo) {
    const container = document.getElementById('clientesSinGeo');
    const count = document.getElementById('countSinGeo');
    const lista = document.getElementById('listaSinGeo');
    
    if (clientesSinGeo.length > 0) {
      count.textContent = clientesSinGeo.length;
      
      lista.innerHTML = clientesSinGeo.map(cliente => `
        <div style="padding: 0.75rem; border: 1px solid #f3f4f6; border-radius: 0.375rem; margin-bottom: 0.5rem; background: white;">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <strong>🧾 Pedido #${cliente.pedidoId}</strong><br>
              <strong>👤 ${cliente.nombre}</strong><br>
              📞 ${cliente.telefono}<br>
              📍 ${cliente.direccion}<br>
              💰 Total: $${cliente.total.toFixed(2)}
            </div>
            <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
              Sin GPS
            </span>
          </div>
        </div>
      `).join('');
      
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  showStats() {
    const container = document.getElementById('mapStats');
    const totalPedidos = this.pedidosPendientes.length;
    const totalMonto = this.pedidosPendientes.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    const conGeo = this.markers.length;
    const sinGeo = totalPedidos - conGeo;
    
    container.innerHTML = `
      <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${totalPedidos}</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Pedidos Pendientes</div>
      </div>
      
      <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">$${totalMonto.toFixed(2)}</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Monto Total</div>
      </div>
      
      <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #dc2626;">${conGeo}</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Con Geolocalización</div>
      </div>
      
      <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.375rem; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">${sinGeo}</div>
        <div style="font-size: 0.875rem; color: #6b7280;">Sin Geolocalización</div>
      </div>
    `;
  }

  centerOnUser() {
    if (this.userMarker) {
      this.map.setView(this.userMarker.getLatLng(), 15);
      this.userMarker.openPopup();
    } else {
      alert('No se pudo obtener tu ubicación');
    }
  }

  fitAllMarkers() {
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  showError(message) {
    const container = document.getElementById('mapContainer');
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #dc2626;">
        <div style="text-align: center;">
          <p style="font-size: 1.125rem; margin-bottom: 1rem;">❌ ${message}</p>
          <button onclick="mapModal.close()" class="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    `;
  }

  close() {
    console.log('🗺️ Cerrando mapa...');
    
    const modal = document.getElementById('mapModal');
    if (modal) {
      modal.classList.remove('show');
      modal.classList.add('hidden');
    }
    
    // Limpiar el mapa completamente
    if (this.map) {
      console.log('🧹 Limpiando mapa al cerrar...');
      try {
        this.map.remove();
      } catch (e) {
        console.warn('⚠️ Error al remover mapa:', e);
      }
      this.map = null;
    }
    
    // Limpiar el contenedor de Leaflet de forma más robusta
    const container = document.getElementById('mapContainer');
    if (container) {
      console.log('🧹 Limpiando contenedor...');
      
      // Destruir cualquier instancia de Leaflet
      if (container._leaflet_id) {
        try {
          const leafletMap = L.DomUtil.get(container._leaflet_id);
          if (leafletMap && leafletMap._leaflet_id) {
            leafletMap.remove();
          }
        } catch (e) {
          console.warn('⚠️ Error al destruir instancia Leaflet:', e);
        }
        container._leaflet_id = null;
      }
      
      // Limpiar contenido y clases
      container.innerHTML = '';
      container.className = container.className.replace(/leaflet-\S+/g, '').trim();
      
      // Restaurar el contenido original del contenedor
      container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
          <div style="text-align: center;">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            <p>Cargando mapa...</p>
          </div>
        </div>
      `;
    }
    
    // Limpiar marcadores y datos
    this.markers = [];
    this.pedidosPendientes = [];
    this.userMarker = null;
    
    console.log('🗺️ Mapa cerrado y limpiado completamente');
  }
}

// Crear instancia global
window.mapModal = new MapModal();
