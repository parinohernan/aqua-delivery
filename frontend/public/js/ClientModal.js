// Componente para el modal de clientes
class ClientModal {
  constructor() {
    console.log('🏗️ Inicializando ClientModal...');
    this.editingClientId = null;
    this.currentClients = [];
    this.availableZonas = [];
    this.map = null;
    this.marker = null;
    this.defaultLocation = [-34.6037, -58.3816]; // Buenos Aires por defecto
    this.init();
    console.log('✅ ClientModal inicializado');
  }

  async init() {
    this.createModal();
    this.attachEventListeners();
    await this.loadZonas();
  }

  async loadZonas() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://back-adm.fly.dev/api/zonas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.availableZonas = await response.json();
        this.updateZonaSelector();
      } else {
        console.warn('⚠️ No se pudieron cargar las zonas');
        this.availableZonas = [];
      }
    } catch (error) {
      console.error('💥 Error cargando zonas:', error);
      this.availableZonas = [];
    }
  }

  updateZonaSelector() {
    const zonaSelect = document.getElementById('clientZona');
    if (zonaSelect && this.availableZonas.length > 0) {
      zonaSelect.innerHTML = '<option value="">Seleccionar zona...</option>' +
        this.availableZonas.map(zona => `<option value="${zona.zona}">${zona.zona}</option>`).join('');
    }
  }

  createModal() {
    const modalHTML = `
      <div id="clientModal" class="hidden modal-overlay">
        <div class="modal-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h4 id="clientModalTitle" class="modal-title">Nuevo Cliente</h4>
            <button onclick="clientModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <form id="clientForm">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" id="clientName" name="nombre" required class="form-input" 
                       placeholder="Ej: Juan" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Apellido</label>
                <input type="text" id="clientLastName" name="apellido" class="form-input" 
                       placeholder="Ej: Pérez" />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Teléfono *</label>
              <input type="tel" id="clientPhone" name="telefono" required class="form-input" 
                     placeholder="Ej: +54 9 11 1234-5678" />
            </div>
            
            <div class="form-group">
              <label class="form-label">Dirección *</label>
              <textarea id="clientAddress" name="direccion" required class="form-input" rows="2"
                        placeholder="Ej: Av. Corrientes 1234, CABA"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Zona/Ruta</label>
              <select id="clientZona" name="zona" class="form-input">
                <option value="">Seleccionar zona...</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Ubicación en el Mapa</label>
              <div style="margin-bottom: 0.5rem;">
                <button type="button" onclick="clientModal.getCurrentLocation()"
                        style="padding: 0.5rem 1rem; background: #059669; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; margin-right: 0.5rem;">
                  📍 Usar Mi Ubicación
                </button>
                <button type="button" onclick="clientModal.clearLocation()"
                        style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;">
                  🗑️ Limpiar
                </button>
              </div>
              <div id="clientModalMap" style="height: 300px; border: 1px solid #d1d5db; border-radius: 0.375rem; margin-bottom: 0.5rem;"></div>
              <div class="grid-2">
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">Latitud</label>
                  <input type="number" id="clientLatitude" name="latitud" step="any" class="form-input"
                         placeholder="-34.6037" style="font-size: 0.875rem;" />
                </div>
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">Longitud</label>
                  <input type="number" id="clientLongitude" name="longitud" step="any" class="form-input"
                         placeholder="-58.3816" style="font-size: 0.875rem;" />
                </div>
              </div>
              <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                Haz clic en el mapa para seleccionar la ubicación del cliente o ingresa las coordenadas manualmente
              </p>
            </div>
            
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Saldo Inicial ($)</label>
                <input type="number" id="clientBalance" name="saldoDinero" step="0.01" class="form-input" 
                       placeholder="0.00" value="0" />
                <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                  Positivo: cliente debe dinero | Negativo: cliente tiene crédito
                </p>
              </div>
              
              <div class="form-group">
                <label class="form-label">Retornables Iniciales</label>
                <input type="number" id="clientReturnables" name="saldoRetornables" min="0" class="form-input" 
                       placeholder="0" value="0" />
                <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                  Cantidad de productos retornables que debe devolver
                </p>
              </div>
            </div>
            
            <div class="modal-buttons">
              <button type="button" onclick="clientModal.close()" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                <span id="clientSubmitButtonText">Guardar Cliente</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('clientModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    const form = document.getElementById('clientForm');
    console.log('🔧 ClientModal attachEventListeners - form encontrado:', !!form);
    if (form) {
      // Remover event listeners previos para evitar duplicados
      form.removeEventListener('submit', this.boundHandleSubmit);
      
      // Crear una función bound para poder removerla después
      this.boundHandleSubmit = (e) => this.handleSubmit(e);
      
      console.log('🔧 Configurando event listener en ClientModal.handleSubmit');
      form.addEventListener('submit', this.boundHandleSubmit, { capture: true });
    } else {
      console.error('❌ Formulario clientForm no encontrado para ClientModal');
    }

    // Event listeners para actualizar el mapa cuando se cambien las coordenadas manualmente
    const latInput = document.getElementById('clientLatitude');
    const lngInput = document.getElementById('clientLongitude');
    
    if (latInput && lngInput) {
      const updateMapFromCoordinates = () => {
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);
        
        if (!isNaN(lat) && !isNaN(lng) && this.map) {
          console.log('📍 Actualizando mapa desde coordenadas manuales:', lat, lng);
          
          // Actualizar vista del mapa
          this.map.setView([lat, lng], 15);
          
          // Actualizar marcador
          if (this.marker) {
            this.marker.setLatLng([lat, lng]);
          } else {
            this.marker = L.marker([lat, lng], { draggable: true }).addTo(this.map);
            
            // Event listener para cuando se mueva el marcador
            this.marker.on('dragend', (e) => {
              const position = e.target.getLatLng();
              document.getElementById('clientLatitude').value = position.lat.toFixed(6);
              document.getElementById('clientLongitude').value = position.lng.toFixed(6);
            });
          }
        }
      };
      
      latInput.addEventListener('input', updateMapFromCoordinates);
      lngInput.addEventListener('input', updateMapFromCoordinates);
    }

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('clientModal');
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

  show(clientData = null) {
    const modal = document.getElementById('clientModal');
    const title = document.getElementById('clientModalTitle');
    const form = document.getElementById('clientForm');

    if (clientData) {
      // Modo edición
      const clientId = clientData.id || clientData.codigo;
      this.editingClientId = clientId;
      console.log('🔧 ClientModal - Editando cliente ID:', this.editingClientId);
      
      if (!this.editingClientId) {
        console.error('❌ Error: No se puede determinar el ID del cliente');
        alert('Error: No se puede determinar el ID del cliente para editar');
        return;
      }
      
      title.textContent = 'Editar Cliente';

      // Llenar el formulario con los datos existentes (scoped al modal para evitar IDs duplicados)
      modal.querySelector('#clientName').value = clientData.nombre || '';
      modal.querySelector('#clientLastName').value = clientData.apellido || '';
      modal.querySelector('#clientPhone').value = clientData.telefono || '';
      modal.querySelector('#clientAddress').value = clientData.direccion || '';
      modal.querySelector('#clientZona').value = clientData.zona || '';
      modal.querySelector('#clientBalance').value = clientData.saldo || 0;
      modal.querySelector('#clientReturnables').value = clientData.retornables || 0;

      // Cargar coordenadas si existen
      const lat = clientData.latitud || clientData.latitude;
      const lng = clientData.longitud || clientData.longitude;
      if (lat && lng) {
        modal.querySelector('#clientLatitude').value = lat;
        modal.querySelector('#clientLongitude').value = lng;
      }

      modal.querySelector('#clientSubmitButtonText').textContent = 'Actualizar Cliente';
    } else {
      // Modo creación
      this.editingClientId = null;
      title.textContent = 'Nuevo Cliente';
      form.reset();
      // Establecer valores por defecto
      modal.querySelector('#clientBalance').value = '0';
      modal.querySelector('#clientReturnables').value = '0';
      modal.querySelector('#clientSubmitButtonText').textContent = 'Guardar Cliente';
    }

    // Asegurar visibilidad del modal según estilos globales (.hidden y .modal-overlay.show)
    modal.classList.remove('hidden');
    modal.classList.add('show');
    // Forzar z-index alto por si hay overlays de otras secciones
    modal.style.zIndex = '10000';

    // Configurar event listeners cada vez que se abre (importante para asegurar prioridad)
    this.attachEventListeners();
    
    // Inicializar el mapa después de que el modal sea visible
    setTimeout(() => {
      this.initMap(clientData);
      modal.querySelector('#clientName').focus();
      // Invalidate size una vez visible para que Leaflet calcule bien el tamaño
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 150);
    }, 100);
  }

  async initMap(clientData = null) {
    const mapContainer = document.getElementById('clientModalMap');
    if (!mapContainer) return;

    // Asegurar que Leaflet esté cargado
    if (typeof window.L === 'undefined') {
      console.warn('⚠️ Leaflet aún no está disponible. Reintentando en 200ms...');
      setTimeout(() => this.initMap(clientData), 200);
      return;
    }

    // Destruir mapa existente si existe
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }

    // Limpiar posibles residuos de Leaflet si el contenedor fue reutilizado
    try {
      if (mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null;
      }
      mapContainer.className = (mapContainer.className || '').replace(/leaflet-\S+/g, '').trim();
    } catch (_) {}

    // Determinar la ubicación inicial del mapa
    const modal = document.getElementById('clientModal');
    const savedLat = parseFloat((modal.querySelector('#clientLatitude')?.value) || '');
    const savedLng = parseFloat((modal.querySelector('#clientLongitude')?.value) || '');

    if (savedLat && savedLng) {
      // Si el cliente tiene coordenadas guardadas, usar esas
      console.log('📍 Usando ubicación guardada del cliente:', savedLat, savedLng);
              await this.createMapAtLocation(savedLat, savedLng, 15, true);
    } else if (clientData && !savedLat && !savedLng) {
      // Si estamos editando pero no hay coordenadas, intentar obtener ubicación actual
      console.log('🎯 Cliente sin ubicación, intentando obtener ubicación actual...');
      await this.initMapWithCurrentLocation();
    } else {
      // Nuevo cliente o sin geolocalización, usar ubicación por defecto
      console.log('🗺️ Usando ubicación por defecto');
      await this.createMapAtLocation(this.defaultLocation[0], this.defaultLocation[1], 13, false);
    }
  }

  async createMapAtLocation(lat, lng, zoom, addMarker) {
    // Crear el mapa asegurando que el contenedor sea visible
    const create = async () => {
      try {
        // Inicializar mapa con configuración PWA (esperar resultado)
        this.map = await initMapPWA('clientModalMap', {
          center: [lat, lng],
          zoom: zoom
        });
        
        if (!this.map) {
          console.error('❌ No se pudo inicializar el mapa');
          return;
        }
      } catch (error) {
        console.error('💥 Error inicializando mapa:', error);
        return;
      }

      // Asegurar que el mapa re-calcula su tamaño tras crearse en modal
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 0);

      // Agregar marcador si se especifica
      if (addMarker) {
        this.addMarker(lat, lng);
      }

      // Manejar clics en el mapa
      this.map.on('click', (e) => {
        this.addMarker(e.latlng.lat, e.latlng.lng);
        this.updateCoordinates(e.latlng.lat, e.latlng.lng);
      });
    };

    // Si el contenedor no es visible aún, esperar un frame
    const container = document.getElementById('clientModalMap');
    const isVisible = container && container.offsetParent !== null && container.offsetWidth > 0 && container.offsetHeight > 0;
    if (!isVisible) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          create();
        });
      });
    } else {
      create();
    }
  }

  async initMapWithCurrentLocation() {
    if (!navigator.geolocation) {
      console.log('⚠️ Geolocalización no disponible, usando ubicación por defecto');
      await this.createMapAtLocation(this.defaultLocation[0], this.defaultLocation[1], 13, false);
      return;
    }

    // Crear mapa con ubicación por defecto primero
    await this.createMapAtLocation(this.defaultLocation[0], this.defaultLocation[1], 13, false);

    // Intentar obtener ubicación actual en segundo plano
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('✅ Ubicación actual obtenida:', lat, lng);

        // Centrar el mapa en la ubicación actual
        this.map.setView([lat, lng], 15);

        // Mostrar un marcador temporal de ubicación actual (diferente color)
        const currentLocationIcon = L.divIcon({
          className: 'current-location-marker',
          html: '<div style="background: #10b981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const currentLocationMarker = L.marker([lat, lng], { icon: currentLocationIcon }).addTo(this.map);
        currentLocationMarker.bindPopup('📍 Tu ubicación actual<br><small>Haz clic en el mapa para seleccionar la ubicación del cliente</small>').openPopup();
      },
      (error) => {
        console.log('⚠️ No se pudo obtener ubicación actual:', error.message);
        // El mapa ya está creado con la ubicación por defecto
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000
      }
    );
  }

  addMarker(lat, lng) {
    // Remover marcador de cliente existente
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Remover todos los marcadores de ubicación actual (si existen)
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options.icon && layer.options.icon.options.className === 'current-location-marker') {
        this.map.removeLayer(layer);
      }
    });

    // Crear icono personalizado para el cliente
    const clientIcon = L.divIcon({
      className: 'client-location-marker',
      html: '<div style="background: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    // Agregar nuevo marcador del cliente
    this.marker = L.marker([lat, lng], { icon: clientIcon }).addTo(this.map);
    this.marker.bindPopup('📍 Ubicación del cliente<br><small>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6) + '</small>').openPopup();
  }

  updateCoordinates(lat, lng) {
    document.getElementById('clientLatitude').value = lat.toFixed(6);
    document.getElementById('clientLongitude').value = lng.toFixed(6);
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador.');
      return;
    }

    // Mostrar indicador de carga
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '🔄 Obteniendo...';
    button.disabled = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log('✅ Ubicación actual obtenida para cliente:', lat, lng);

        // Centrar el mapa en la ubicación actual
        this.map.setView([lat, lng], 16);

        // Agregar marcador del cliente en la ubicación actual
        this.addMarker(lat, lng);
        this.updateCoordinates(lat, lng);

        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;

        // Mostrar mensaje de éxito
        this.showTempMessage('✅ Ubicación actual establecida como ubicación del cliente', 'success');
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);

        let errorMessage = 'No se pudo obtener la ubicación actual.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados. Habilita la geolocalización en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
        }

        alert(errorMessage);

        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }

  clearLocation() {
    // Limpiar coordenadas
    document.getElementById('clientLatitude').value = '';
    document.getElementById('clientLongitude').value = '';

    // Remover marcador
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }

    // Volver a la ubicación por defecto
    this.map.setView(this.defaultLocation, 13);
  }

  close() {
    const modal = document.getElementById('clientModal');
    // Ocultar modal respetando los estilos globales
    modal.classList.remove('show');
    modal.classList.add('hidden');
    this.editingClientId = null;

    // Limpiar mapa
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }

    // Limpiar formulario
    document.getElementById('clientForm').reset();
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation(); // Evitar que se ejecuten otros handlers
    e.stopImmediatePropagation(); // Evitar que se ejecuten otros handlers en el mismo elemento
    
    console.log('📝 ClientModal.handleSubmit ejecutándose');
    console.log('🔍 Formulario:', e.target.id);
    console.log('🔍 editingClientId (ClientModal):', this.editingClientId);
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('clientSubmitButtonText');
    const originalText = submitButtonText.textContent;
    
    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = 'Guardando...';
    
    try {
      const formData = new FormData(e.target);
      const clientData = {
        nombre: formData.get('nombre').trim(),
        apellido: formData.get('apellido').trim(),
        telefono: formData.get('telefono').trim(),
        direccion: formData.get('direccion').trim(),
        zona: formData.get('zona') || null,
        saldoDinero: parseFloat(formData.get('saldoDinero') || 0),
        saldoRetornables: parseInt(formData.get('saldoRetornables') || 0),
        latitud: formData.get('latitud') ? parseFloat(formData.get('latitud')) : null,
        longitud: formData.get('longitud') ? parseFloat(formData.get('longitud')) : null
      };

      console.log('📋 Datos del cliente a enviar:', clientData);
      console.log('📍 Coordenadas:', { latitud: clientData.latitud, longitud: clientData.longitud });

      // Validaciones
      if (!clientData.nombre) {
        throw new Error('El nombre del cliente es requerido');
      }
      if (!clientData.telefono) {
        throw new Error('El teléfono del cliente es requerido');
      }
      if (!clientData.direccion) {
        throw new Error('La dirección del cliente es requerida');
      }

      const token = localStorage.getItem('token');
      let response;

      if (this.editingClientId) {
        // Actualizar cliente existente
        console.log('🔄 Actualizando cliente ID:', this.editingClientId);
        response = await fetch(`https://back-adm.fly.dev/api/clientes/${this.editingClientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(clientData)
        });
      } else {
        // Crear nuevo cliente
        response = await fetch('https://back-adm.fly.dev/api/clientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(clientData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error guardando cliente');
      }

      // Éxito: cerrar y refrescar sección reactiva
      this.close();
      try {
        if (window.loadClientesSection) {
          await window.loadClientesSection();
        } else if (window.loadClientesData) {
          await window.loadClientesData();
        } else if (typeof loadClientes === 'function') {
          await loadClientes();
        } else if (window.loadClientes) {
          await window.loadClientes();
        } else {
          console.log('⚠️ Función de recarga de clientes no encontrada, recarga manual necesaria');
        }
      } catch (e) {
        console.warn('⚠️ Error intentando refrescar sección de clientes:', e);
      }
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage(this.editingClientId ? 'actualizado' : 'creado');
      
    } catch (error) {
      console.error('Error:', error);
      this.showErrorMessage(error.message);
    } finally {
      // Restaurar botón
      submitButton.disabled = false;
      submitButtonText.textContent = originalText;
    }
  }

  showSuccessMessage(action) {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-weight: 500;
    `;
    message.textContent = `Cliente ${action} correctamente`;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  showErrorMessage(errorText) {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-weight: 500;
    `;
    message.textContent = `Error: ${errorText}`;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  showTempMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';

    messageDiv.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10001;
      font-size: 0.875rem;
      max-width: 300px;
    `;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  setCurrentClients(clients) {
    this.currentClients = clients;
  }

  showSuccessMessage(action) {
    const message = `Cliente ${action} exitosamente`;
    console.log('✅', message);
    
    // Mostrar notificación visual
    this.showNotification(message, 'success');
  }

  showErrorMessage(message) {
    console.error('❌ Error:', message);
    
    // Mostrar notificación visual
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    // Colores según el tipo
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#059669';
        notification.innerHTML = `✅ ${message}`;
        break;
      case 'error':
        notification.style.backgroundColor = '#dc2626';
        notification.innerHTML = `❌ ${message}`;
        break;
      default:
        notification.style.backgroundColor = '#3b82f6';
        notification.innerHTML = `ℹ️ ${message}`;
    }
    
    // Agregar estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    
    if (!document.querySelector('#notification-styles')) {
      style.id = 'notification-styles';
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Crear instancia global
console.log('🏗️ Creando instancia global de ClientModal...');
window.clientModal = new ClientModal();
console.log('✅ window.clientModal creado:', !!window.clientModal);
