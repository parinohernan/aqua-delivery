// Componente para el modal de pedidos
class OrderModal {
  constructor() {
    this.editingOrderId = null;
    this.selectedClient = null;
    this.originalClientId = null; // Guardar cliente original del pedido al editar
    this.orderItems = [];
    this.availableProducts = [];
    this.availableClients = [];
    this.availableZonas = [];
    this.searchClientsTimeout = null; // Para debounce de búsqueda
    this.currentOrderEstado = null; // Estado actual del pedido (pendient, entregad, anulado)
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      // Cargar productos, clientes y zonas disponibles
      await Promise.all([
        this.loadProducts(),
        this.loadClients(),
        this.loadZonas()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  }

  async loadProducts() {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/productos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        this.availableProducts = await response.json();
        console.log('📦 Productos cargados:', this.availableProducts.length);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  async loadClients() {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        this.availableClients = await response.json();
        console.log('👥 Clientes cargados:', this.availableClients.length);

        // Si el dropdown está visible, actualizarlo con los nuevos datos
        const dropdown = document.getElementById('clientDropdown');
        if (dropdown && !dropdown.classList.contains('hidden')) {
          console.log('🔄 Actualizando dropdown de clientes con nuevos datos...');
          this.refreshClientDropdown();
        }
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  async loadZonas() {
    const token = localStorage.getItem('token');
    try {
      const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/zonas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        this.availableZonas = await response.json();
        console.log('🗺️ Zonas cargadas:', this.availableZonas.length);
      }
    } catch (error) {
      console.error('Error cargando zonas:', error);
    }
  }

  createModal() {
    const modalHTML = `
      <div id="orderModal" class="modal-overlay hidden">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h4 id="orderModalTitle" class="modal-title">Nuevo Pedido</h4>
            <button onclick="orderModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <form id="orderForm">
            <!-- Selección de Cliente -->
            <div class="form-group">
              <label class="form-label">Cliente *</label>
              <div style="position: relative;">
                <input type="text" id="clientSearch" placeholder="Buscar cliente por nombre..." 
                       class="form-input" autocomplete="off" />
                <div id="clientDropdown" class="hidden" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #d1d5db; border-radius: 0.375rem; max-height: 200px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"></div>
              </div>
              <div id="selectedClient" class="hidden" style="margin-top: 0.5rem; padding: 0.75rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.375rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div style="flex: 1;">
                    <strong id="selectedClientName"></strong>
                    <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">
                      <span id="selectedClientPhone"></span> • <span id="selectedClientAddress"></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <label style="font-size: 0.875rem; font-weight: 500; color: #374151;">Zona:</label>
                      <select id="selectedClientZona" onchange="orderModal.updateClientZona()" style="padding: 0.25rem 0.5rem; border: 1px solid #d1d5db; border-radius: 0.25rem; font-size: 0.875rem;">
                        <option value="">Sin zona</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" onclick="orderModal.clearClient()" style="background: #ef4444; color: white; border: none; border-radius: 0.25rem; padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                    Cambiar
                  </button>
                </div>
              </div>
            </div>

            <!-- Productos del Pedido -->
            <div class="form-group">
              <label class="form-label">Productos del Pedido</label>
              
              <!-- Agregar Producto -->
              <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <select id="productSelect" class="form-input" style="flex: 1; min-width: 200px;">
                  <option value="">Seleccionar producto...</option>
                </select>
                <input type="number" id="productQuantity" placeholder="Cant." min="1" value="1" 
                       class="form-input" style="width: 80px;" />
                <button type="button" onclick="orderModal.addProduct()" 
                        class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                  + Agregar
                </button>
              </div>

              <!-- Lista de Productos Agregados -->
              <div id="orderItemsList" style="border: 1px solid #e5e7eb; border-radius: 0.5rem; min-height: 100px; background: #fafafa;">
                <div id="emptyOrderItems" style="padding: 2rem; text-align: center; color: #6b7280;">
                  <p>No hay productos agregados al pedido</p>
                  <p style="font-size: 0.875rem;">Selecciona productos arriba para agregarlos</p>
                </div>
              </div>

              <!-- Total del Pedido -->
              <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; font-size: 1.125rem; color: #111827;">Total del Pedido:</span>
                  <span id="orderTotal" style="font-weight: 700; font-size: 1.5rem; color: #059669;">$0.00</span>
                </div>
              </div>
            </div>

            <!-- Información del pedido -->
            <div class="form-group">
              <div style="padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.375rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #0369a1;">
                  <strong>📋 Información:</strong> El pedido se creará con estado "Pendient".
                  El tipo de pago se definirá durante la entrega. El stock de los productos se actualizará automáticamente.
                </p>
              </div>
            </div>
            
            <div class="modal-buttons">
              <button type="button" onclick="orderModal.close()" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                <span id="orderSubmitButtonText">Crear Pedido</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('orderModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    // Event listeners para productos
    if (window.eventBus && window.EVENTS) {
      // Escuchar cuando se crea un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_CREATED, (data) => {
        console.log('📦 Nuevo producto creado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts();
      });

      // Escuchar cuando se actualiza un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_UPDATED, (data) => {
        console.log('📦 Producto actualizado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts();
      });

      // Escuchar cuando se activa un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_ACTIVATED, (data) => {
        console.log('📦 Producto activado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts();
      });

      // Escuchar cuando se entrega un pedido (para actualizar stock)
      window.eventBus.on(window.EVENTS.PEDIDO_UPDATED, (data) => {
        if (data.estado === 'entregado') {
          console.log('📦 Pedido entregado, actualizando stock de productos en OrderModal...', data);
          this.loadProducts();
        }
      });

      // Escuchar cuando se crea un cliente
      window.eventBus.on(window.EVENTS.CLIENTE_CREATED, (data) => {
        console.log('👥 Nuevo cliente creado, actualizando lista de clientes en OrderModal...', data);
        this.loadClients();
      });

      // Escuchar cuando se actualiza un cliente
      window.eventBus.on(window.EVENTS.CLIENTE_UPDATED, (data) => {
        console.log('👥 Cliente actualizado, actualizando lista de clientes en OrderModal...', data);
        this.loadClients();
      });

      console.log('✅ Event listeners de productos configurados en OrderModal');
    }

    const form = document.getElementById('orderForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Búsqueda de clientes con debounce
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch) {
      clientSearch.addEventListener('input', (e) => {
        // Limpiar timeout anterior
        if (this.searchClientsTimeout) {
          clearTimeout(this.searchClientsTimeout);
        }
        // Aplicar debounce de 200ms
        this.searchClientsTimeout = setTimeout(() => {
          this.searchClients(e.target.value);
        }, 200);
      });
      clientSearch.addEventListener('focus', () => this.showClientDropdown());
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#clientSearch') && !e.target.closest('#clientDropdown')) {
        this.hideClientDropdown();
      }
    });

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('orderModal');
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

  async show(orderData = null) {
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('orderModalTitle');

    console.log('📦 Abriendo modal de pedido:', orderData ? 'edición' : 'nuevo');

    if (orderData) {
      // Modo edición / visualización
      const pedidoId = orderData.codigo || orderData.id;
      this.editingOrderId = pedidoId;
      title.textContent = 'Detalles del Pedido';
      console.log('📝 Visualizando pedido:', this.editingOrderId, orderData);

      // Cargar datos completos del pedido desde el backend
      try {
        console.log('🔄 Cargando datos completos del pedido desde el backend...');
        const token = localStorage.getItem('token');
        const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
        const response = await fetch(`${apiUrl}/api/pedidos/${pedidoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar datos del pedido');
        }

        orderData = await response.json();
        console.log('✅ Datos completos del pedido cargados:', orderData);
        // Guardar el estado del pedido
        this.currentOrderEstado = orderData.estado || null;
      } catch (error) {
        console.error('❌ Error cargando datos del pedido:', error);
        if (window.showError) {
          window.showError('Error al cargar los datos del pedido. Usando datos locales.');
        } else {
          alert('Error al cargar los datos del pedido. Usando datos locales.');
        }
        // Continuar con los datos locales si falla la carga
        this.currentOrderEstado = orderData?.estado || null;
      }

      // 1. Cargar Cliente
      // Intentar encontrar el cliente en la lista disponible
      const clienteId = orderData.cliente_id || orderData.codigoCliente || (orderData.cliente ? orderData.cliente.codigo : null);
      // Guardar el cliente original del pedido
      this.originalClientId = clienteId;
      let client = null;

      if (clienteId) {
        client = this.availableClients.find(c => c.codigo == clienteId);
      }

      // Si no se encuentra por ID, intentar construirlo con los datos del pedido
      if (!client) {
        console.warn('⚠️ Cliente no encontrado en lista local, usando datos del pedido');
        const c = orderData.cliente || {};
        client = {
          codigo: clienteId,
          nombre: c.nombre || orderData.cliente_nombre || orderData.nombre || '',
          apellido: c.apellido || orderData.cliente_apellido || orderData.apellido || '',
          telefono: c.telefono || orderData.telefono || orderData.cliente_telefono || '',
          direccion: c.direccion || orderData.direccion || orderData.cliente_direccion || '',
          zona: c.zona || orderData.zona || ''
        };
      }

      if (client) {
        this.selectedClient = client;
        this.showSelectedClient();

        // Asegurar que el dropdown y el input estén ocultos
        const dropdown = document.getElementById('clientDropdown');
        if (dropdown) dropdown.classList.add('hidden');

        const searchInput = document.getElementById('clientSearch');
        if (searchInput) searchInput.style.display = 'none';
      }

      // 2. Cargar Productos
      this.orderItems = [];
      const productos = orderData.productos || orderData.items || orderData.detalles || [];

      if (productos && productos.length > 0) {
        this.orderItems = productos.map(p => {
          // Normalizar datos del producto - usar los códigos reales del backend
          const productId = p.productoId || p.codigoProducto || p.producto_id || p.codigo || p.id;
          const cantidad = parseFloat(p.cantidad || 1);
          // El precio debe venir del pedido (precio_unitario o precio), no del producto actual
          const precio = parseFloat(p.precio || p.precio_unitario || 0);
          const nombre = p.descripcion || p.nombre || p.producto_nombre || `Producto #${productId}`;

          // Buscar stock real si es posible
          const realProduct = this.availableProducts.find(prod => prod.codigo == productId);
          const stock = realProduct ? parseInt(realProduct.stock || 0) : 999;

          console.log('📦 Item cargado:', {
            productId,
            nombre,
            cantidad,
            precio,
            subtotal: precio * cantidad
          });

          return {
            productId: productId,
            name: nombre,
            price: precio,
            quantity: cantidad,
            subtotal: precio * cantidad,
            stock: stock
          };
        });
      } else {
        console.warn('⚠️ No se encontraron productos en el pedido');
      }

      this.updateOrderItemsList();
      this.updateTotal();

      // Cambiar texto del botón
      const submitBtn = document.getElementById('orderSubmitButtonText');
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';

      // Ocultar controles de agregar producto si el pedido ya está entregado o anulado
      const addProductControls = document.querySelector('.form-group > div[style*="display: flex"]');
      if (addProductControls && this.currentOrderEstado && this.currentOrderEstado !== 'pendient') {
        addProductControls.style.display = 'none';
      } else if (addProductControls && this.currentOrderEstado === 'pendient') {
        addProductControls.style.display = 'flex';
      }

    } else {
      // Modo creación - limpiar completamente
      this.editingOrderId = null;
      this.originalClientId = null;
      title.textContent = 'Nuevo Pedido';
      console.log('🆕 Modo creación - limpiando formulario');

      // Limpiar inmediatamente antes de mostrar el modal
      this.resetForm();

      const submitBtn = document.getElementById('orderSubmitButtonText');
      if (submitBtn) submitBtn.textContent = 'Crear Pedido';
    }

    // Mostrar el modal
    modal.classList.remove('hidden');
    modal.classList.add('show');

    // Poblar select de productos después de mostrar el modal
    this.populateProductSelect();

    // Enfocar el primer campo SOLO si es nuevo pedido
    if (!orderData) {
      setTimeout(() => {
        const clientSearch = document.getElementById('clientSearch');
        if (clientSearch) {
          clientSearch.focus();
        }
      }, 100);
    }

    console.log('📦 Modal de pedido abierto correctamente');

    // Debug del estado final
    this.debugState();
  }

  // Función para verificar el estado del modal
  debugState() {
    console.log('🔍 DEBUG - Estado actual del modal:');
    console.log('   📦 orderItems:', this.orderItems);
    console.log('   📦 orderItems.length:', this.orderItems.length);
    console.log('   👤 selectedClient:', this.selectedClient);
    console.log('   📝 editingOrderId:', this.editingOrderId);

    const container = document.getElementById('orderItemsList');
    if (container) {
      console.log('   🎨 Contenedor HTML:', container.innerHTML.substring(0, 100) + '...');
    } else {
      console.log('   ❌ Contenedor no encontrado');
    }
  }

  resetForm() {
    console.log('🔄 Iniciando reset del formulario de pedido...');

    // Limpiar timeout de búsqueda
    if (this.searchClientsTimeout) {
      clearTimeout(this.searchClientsTimeout);
      this.searchClientsTimeout = null;
    }

    // Limpiar formulario
    const form = document.getElementById('orderForm');
    if (form) {
      form.reset();
    }

    // Limpiar estado interno
    this.selectedClient = null;
    this.orderItems = [];
    this.editingOrderId = null;
    this.originalClientId = null;
    this.currentOrderEstado = null;

    console.log('🔄 Estado interno limpiado, orderItems:', this.orderItems.length);

    // Limpiar UI
    this.hideSelectedClient();
    this.hideClientDropdown();

    // Limpiar campo de búsqueda de cliente
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch) {
      clientSearch.value = '';
    }

    // Forzar limpieza visual inmediata del contenedor de items
    const container = document.getElementById('orderItemsList');
    if (container) {
      console.log('🔄 Limpiando contenedor de items visualmente...');
      container.innerHTML = `
        <div id="emptyOrderItems" style="padding: 2rem; text-align: center; color: #6b7280;">
          <p>No hay productos agregados al pedido</p>
          <p style="font-size: 0.875rem;">Selecciona productos arriba para agregarlos</p>
        </div>
      `;
    }

    // Actualizar total
    this.updateTotal();

    console.log('🔄 Formulario de pedido reseteado completamente');
  }

  close() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    this.editingOrderId = null;
    // Limpiar timeout de búsqueda
    if (this.searchClientsTimeout) {
      clearTimeout(this.searchClientsTimeout);
      this.searchClientsTimeout = null;
    }
    this.resetForm();
  }

  // ========== MANEJO DE CLIENTES ==========

  searchClients(searchTerm) {
    const dropdown = document.getElementById('clientDropdown');
    if (!dropdown) return;

    if (!searchTerm || !searchTerm.trim()) {
      this.hideClientDropdown();
      return;
    }

    const filteredClients = this.availableClients.filter(client => {
      const fullName = `${client.nombre || ''} ${client.apellido || ''}`.toLowerCase();
      const phone = (client.telefono || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      return fullName.includes(search) || phone.includes(search);
    });

    this.renderClientDropdown(filteredClients);
    // Solo mostrar el dropdown, no llamar a showClientDropdown() para evitar bucle infinito
    dropdown.classList.remove('hidden');
  }

  renderClientDropdown(clients) {
    const dropdown = document.getElementById('clientDropdown');

    if (clients.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: #6b7280;">
          No se encontraron clientes
        </div>
      `;
      return;
    }

    dropdown.innerHTML = clients.map(client => {
      const fullName = `${client.nombre || ''} ${client.apellido || ''}`.trim();
      const phone = client.telefono || 'Sin teléfono';
      const address = client.direccion || 'Sin dirección';

      return `
        <div onclick="orderModal.selectClient(${client.codigo})"
             style="padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; hover:background: #f9fafb;"
             onmouseover="this.style.background='#f9fafb'"
             onmouseout="this.style.background='white'">
          <div style="font-weight: 600; color: #111827;">${fullName}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">${phone} • ${address}</div>
        </div>
      `;
    }).join('');
  }

  selectClient(clientId) {
    const client = this.availableClients.find(c => c.codigo === clientId);
    if (!client) return;

    this.selectedClient = client;
    this.showSelectedClient();
    this.hideClientDropdown();

    // Limpiar campo de búsqueda
    document.getElementById('clientSearch').value = '';
  }

  showSelectedClient() {
    const fullName = `${this.selectedClient.nombre || ''} ${this.selectedClient.apellido || ''}`.trim();

    document.getElementById('selectedClientName').textContent = fullName;
    document.getElementById('selectedClientPhone').textContent = this.selectedClient.telefono || 'Sin teléfono';
    document.getElementById('selectedClientAddress').textContent = this.selectedClient.direccion || 'Sin dirección';

    // Configurar selector de zona
    this.updateZonaSelector();
    document.getElementById('selectedClientZona').value = this.selectedClient.zona || '';

    document.getElementById('selectedClient').classList.remove('hidden');
    document.getElementById('clientSearch').style.display = 'none';
  }

  updateZonaSelector() {
    const zonaSelect = document.getElementById('selectedClientZona');
    if (zonaSelect && this.availableZonas.length > 0) {
      zonaSelect.innerHTML = '<option value="">Sin zona</option>' +
        this.availableZonas.map(zona => `<option value="${zona.zona}">${zona.zona}</option>`).join('');
    }
  }

  async updateClientZona() {
    if (!this.selectedClient) return;

    const newZona = document.getElementById('selectedClientZona').value;
    const oldZona = this.selectedClient.zona;

    if (newZona === oldZona) return;

    try {
      // Actualizar la zona del cliente en el backend
      const token = localStorage.getItem('token');
      const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${apiUrl}/api/clientes/${this.selectedClient.codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...this.selectedClient,
          zona: newZona || null
        })
      });

      if (response.ok) {
        // Actualizar el cliente local
        this.selectedClient.zona = newZona;
        console.log('✅ Zona del cliente actualizada:', newZona);
        this.showTempMessage(`Zona actualizada: ${newZona || 'Sin zona'}`, 'success');
      } else {
        throw new Error('Error actualizando zona del cliente');
      }
    } catch (error) {
      console.error('❌ Error actualizando zona:', error);
      // Revertir el cambio en el selector
      document.getElementById('selectedClientZona').value = oldZona || '';
      this.showTempMessage('Error actualizando zona del cliente', 'error');
    }
  }

  hideSelectedClient() {
    document.getElementById('selectedClient').classList.add('hidden');
    document.getElementById('clientSearch').style.display = 'block';
  }

  clearClient() {
    this.selectedClient = null;
    this.hideSelectedClient();
    document.getElementById('clientSearch').value = '';
    document.getElementById('clientSearch').focus();
  }

  showClientDropdown() {
    const dropdown = document.getElementById('clientDropdown');
    if (!dropdown) return;

    // Si hay un término de búsqueda, mostrar resultados filtrados sin llamar a searchClients
    // para evitar bucle infinito
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch && clientSearch.value.trim()) {
      const searchTerm = clientSearch.value.trim();
      const filteredClients = this.availableClients.filter(client => {
        const fullName = `${client.nombre || ''} ${client.apellido || ''}`.toLowerCase();
        const phone = (client.telefono || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || phone.includes(search);
      });
      this.renderClientDropdown(filteredClients);
    } else {
      // Si no hay término de búsqueda, mostrar todos los clientes
      this.renderClientDropdown(this.availableClients);
    }

    dropdown.classList.remove('hidden');
  }

  hideClientDropdown() {
    const dropdown = document.getElementById('clientDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  // Función para refrescar el dropdown con los datos más recientes
  refreshClientDropdown() {
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch && clientSearch.value.trim()) {
      this.searchClients(clientSearch.value);
    } else {
      this.renderClientDropdown(this.availableClients);
    }
  }

  // ========== MANEJO DE PRODUCTOS ==========

  populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">Seleccionar producto...</option>';

    // Filtrar solo productos activos
    const activeProducts = this.availableProducts.filter(product => product.activo === 1);

    activeProducts.forEach(product => {
      const name = product.descripcion || `Producto #${product.codigo}`;
      const price = parseFloat(product.precio || 0);
      const stock = parseInt(product.stock || 0);

      select.innerHTML += `
        <option value="${product.codigo}" data-price="${price}" data-stock="${stock}">
          ${name} - $${price.toFixed(2)} (Stock: ${stock})
        </option>
      `;
    });

    console.log('📦 Productos activos disponibles para pedidos:', activeProducts.length);
  }

  addProduct() {
    const select = document.getElementById('productSelect');
    const quantityInput = document.getElementById('productQuantity');

    const productId = select.value;
    const quantity = parseInt(quantityInput.value) || 1;

    if (!productId) {
      if (window.showError) {
        window.showError('Selecciona un producto');
      } else {
        alert('Selecciona un producto');
      }
      return;
    }

    const product = this.availableProducts.find(p => p.codigo == productId);
    if (!product) {
      if (window.showError) {
        window.showError('Producto no encontrado');
      } else {
        alert('Producto no encontrado');
      }
      return;
    }

    const availableStock = parseInt(product.stock || 0);
    // Mostrar advertencia si el stock es insuficiente, pero permitir continuar
    if (quantity > availableStock) {
      console.log(`⚠️ Stock insuficiente. Disponible: ${availableStock}, Solicitado: ${quantity}. Continuando con stock negativo.`);
    }

    // Verificar si el producto ya está en el pedido
    const existingItem = this.orderItems.find(item => item.productId == productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      // Mostrar advertencia si el stock es insuficiente, pero permitir continuar
      if (newQuantity > availableStock) {
        console.log(`⚠️ Stock insuficiente. Ya tienes ${existingItem.quantity} en el pedido. Total solicitado: ${newQuantity}, Disponible: ${availableStock}. Continuando con stock negativo.`);
      }
      existingItem.quantity = newQuantity;
      existingItem.subtotal = existingItem.price * newQuantity;
    } else {
      // Agregar nuevo producto
      this.orderItems.push({
        productId: product.codigo,
        name: product.descripcion || `Producto #${product.codigo}`,
        price: parseFloat(product.precio || 0),
        quantity: quantity,
        subtotal: parseFloat(product.precio || 0) * quantity,
        stock: availableStock
      });
    }

    // Limpiar selección
    select.value = '';
    quantityInput.value = '1';

    this.updateOrderItemsList();
    this.updateTotal();
  }

  removeProduct(productId) {
    this.orderItems = this.orderItems.filter(item => item.productId != productId);
    this.updateOrderItemsList();
    this.updateTotal();
  }

  updateProductQuantity(productId, newQuantity) {
    const item = this.orderItems.find(item => item.productId == productId);
    if (!item) return;

    if (newQuantity <= 0) {
      this.removeProduct(productId);
      return;
    }

    // Mostrar advertencia si el stock es insuficiente, pero permitir continuar
    if (newQuantity > item.stock) {
      console.log(`⚠️ Stock insuficiente. Máximo disponible: ${item.stock}, Solicitado: ${newQuantity}. Continuando con stock negativo.`);
    }

    item.quantity = newQuantity;
    item.subtotal = item.price * newQuantity;

    this.updateOrderItemsList();
    this.updateTotal();
  }

  updateOrderItemsList() {
    const container = document.getElementById('orderItemsList');
    const emptyState = document.getElementById('emptyOrderItems');

    if (!container) {
      console.error('❌ Contenedor orderItemsList no encontrado');
      return;
    }

    if (this.orderItems.length === 0) {
      // Si no hay items, mostrar estado vacío
      if (emptyState) {
        emptyState.style.display = 'block';
      } else {
        // Si no existe el elemento emptyState, crearlo
        container.innerHTML = `
          <div id="emptyOrderItems" style="padding: 2rem; text-align: center; color: #6b7280;">
            <p>No hay productos agregados al pedido</p>
            <p style="font-size: 0.875rem;">Selecciona productos arriba para agregarlos</p>
          </div>
        `;
      }
      return;
    }

    // Si hay items, ocultar estado vacío y mostrar items
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Solo permitir edición si el pedido está pendiente
    const canEdit = !!this.editingOrderId && this.currentOrderEstado === 'pendient';
    const itemsHTML = this.orderItems.map(item => `
      <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: white;">
        <!-- Línea 1: Descripción y Precio Unitario -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="font-weight: 600; color: #111827; font-size: 1rem; flex: 1;">${item.name}</div>
          <div style="font-size: 0.875rem; color: #6b7280; margin-left: 1rem;">$${item.price.toFixed(2)} c/u</div>
        </div>
        
        <!-- Línea 2: Cantidad y Total -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${canEdit ? `
            ${item.quantity === 1 ? `
            <button onclick="orderModal.removeProduct(${item.productId})"
                    style="width: 28px; height: 28px; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1.125rem; font-weight: 600;"
                    title="Eliminar producto">
              ×
            </button>
            ` : `
            <button onclick="orderModal.updateProductQuantity(${item.productId}, ${item.quantity - 1})"
                    style="width: 28px; height: 28px; border: 1px solid #d1d5db; background: white; border-radius: 0.25rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; color: #374151;">
              -
            </button>
            `}
            <span style="min-width: 40px; text-align: center; font-weight: 600; font-size: 1rem; color: #111827;">${item.quantity}</span>
            <button onclick="orderModal.updateProductQuantity(${item.productId}, ${item.quantity + 1})"
                    style="width: 28px; height: 28px; border: 1px solid #d1d5db; background: white; border-radius: 0.25rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; color: #374151;">
              +
            </button>
            ` : `
            <span style="min-width: 40px; text-align: center; font-weight: 600; font-size: 1rem; color: #111827; padding: 0.375rem 0.5rem; background: #f3f4f6; border-radius: 0.25rem;">${item.quantity}</span>
            `}
          </div>
          <div style="font-weight: 700; font-size: 1.125rem; color: #059669;">
            $${item.subtotal.toFixed(2)}
          </div>
        </div>
      </div>
    `).join('');

    // Agregar el estado vacío al final para que esté disponible cuando se necesite
    const finalHTML = `
      ${itemsHTML}
      <div id="emptyOrderItems" style="padding: 2rem; text-align: center; color: #6b7280; display: none;">
        <p>No hay productos agregados al pedido</p>
        <p style="font-size: 0.875rem;">Selecciona productos arriba para agregarlos</p>
      </div>
    `;

    container.innerHTML = finalHTML;
  }

  updateTotal() {
    const total = this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
  }

  // ========== ENVÍO DEL FORMULARIO ==========

  async handleSubmit(e) {
    e.preventDefault();

    const isEditing = !!this.editingOrderId;
    
    // Si estamos editando y no hay cliente seleccionado, usar el cliente original
    let clienteIdToUse = null;
    if (isEditing && !this.selectedClient && this.originalClientId) {
      clienteIdToUse = this.originalClientId;
      console.log('📝 Usando cliente original del pedido:', clienteIdToUse);
    } else if (this.selectedClient) {
      clienteIdToUse = this.selectedClient.codigo;
    }

    // Validar cliente solo si no estamos editando o si no hay cliente original
    if (!clienteIdToUse) {
      if (window.showError) {
        window.showError('Selecciona un cliente para el pedido');
      } else {
        alert('Selecciona un cliente para el pedido');
      }
      return;
    }

    if (this.orderItems.length === 0) {
      if (window.showError) {
        window.showError('Agrega al menos un producto al pedido');
      } else {
        alert('Agrega al menos un producto al pedido');
      }
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('orderSubmitButtonText');
    const originalText = submitButtonText.textContent;

    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = isEditing ? 'Actualizando pedido...' : 'Creando pedido...';

    try {
      const orderData = {
        clienteId: clienteIdToUse,
        productos: this.orderItems.map(item => ({
          productoId: item.productId,
          cantidad: item.quantity,
          precio: item.price
        })),
        total: this.orderItems.reduce((sum, item) => sum + item.subtotal, 0)
      };

      const token = localStorage.getItem('token');
      const apiUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      
      // Determinar URL y método según si es edición o creación
      const url = isEditing 
        ? `${apiUrl}/api/pedidos/${this.editingOrderId}`
        : `${apiUrl}/api/pedidos`;
      const method = isEditing ? 'PUT' : 'POST';

      console.log(isEditing ? '📝 Actualizando pedido:' : '📦 Creando pedido:', orderData);
      console.log('🔗 URL:', url);
      console.log('📤 Método:', method);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isEditing ? 'Error actualizando pedido' : 'Error creando pedido'));
      }

      const result = await response.json();
      console.log(isEditing ? '✅ Pedido actualizado:' : '✅ Pedido creado:', result);

      // Guardar datos antes de cerrar el modal (porque close() los limpia)
      const clienteInfo = this.selectedClient ? { ...this.selectedClient } : (isEditing && this.originalClientId ? { codigo: this.originalClientId } : null);
      const productosInfo = [...this.orderItems];
      const clientName = clienteInfo ? clienteInfo.nombre || 'Cliente' : 'Cliente';
      const productCount = productosInfo.length;

      // Éxito
      this.close();

      // Emitir evento según si es creación o actualización
      if (window.eventBus && window.EVENTS) {
        if (isEditing) {
          window.eventBus.emit(window.EVENTS.PEDIDO_UPDATED, {
            pedido: result,
            pedidoId: this.editingOrderId,
            cliente: clienteInfo,
            productos: productosInfo
          });
        } else {
          window.eventBus.emit(window.EVENTS.PEDIDO_CREATED, {
            pedido: result,
            cliente: clienteInfo,
            productos: productosInfo
          });
        }
      }

      // Recargar la lista de pedidos (compatibilidad con index.astro)
      if (typeof window.loadPedidosData === 'function') {
        await window.loadPedidosData();
      } else if (typeof window.loadPedidos === 'function') {
        await window.loadPedidos();
      }

      // Mostrar mensaje de éxito
      const successMessage = isEditing 
        ? `Pedido actualizado correctamente`
        : `Pedido creado correctamente para ${clientName} con ${productCount} producto${productCount !== 1 ? 's' : ''}`;
      this.showSuccessMessage(successMessage);

    } catch (error) {
      console.error('Error:', error);
      this.showErrorMessage(error.message);
    } finally {
      // Restaurar botón
      submitButton.disabled = false;
      submitButtonText.textContent = originalText;
    }
  }

  showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
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
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  showErrorMessage(errorText) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
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
    messageDiv.textContent = `Error: ${errorText}`;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
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
}

// Crear instancia global
window.orderModal = new OrderModal();

// Exponer función global para compatibilidad
window.showCreateOrderModal = function () {
  if (window.orderModal) {
    window.orderModal.show();
  } else {
    console.error('❌ OrderModal no está disponible');
  }
};

console.log('✅ OrderModal loaded and ready');
