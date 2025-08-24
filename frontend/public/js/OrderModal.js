// Componente para el modal de pedidos
class OrderModal {
  constructor() {
    this.editingOrderId = null;
    this.selectedClient = null;
    this.orderItems = [];
    this.availableProducts = [];
    this.availableClients = [];
    this.availableZonas = [];
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
      const response = await fetch('https://back-adm.fly.dev/api/productos', {
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
      const response = await fetch('https://back-adm.fly.dev/api/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        this.availableClients = await response.json();
        console.log('👥 Clientes cargados:', this.availableClients.length);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  async loadZonas() {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://back-adm.fly.dev/api/zonas', {
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
              <div id="orderItemsList" style="border: 1px solid #e5e7eb; border-radius: 0.375rem; min-height: 100px;">
                <div id="emptyOrderItems" style="padding: 2rem; text-align: center; color: #6b7280;">
                  <p>No hay productos agregados al pedido</p>
                  <p style="font-size: 0.875rem;">Selecciona productos arriba para agregarlos</p>
                </div>
              </div>

              <!-- Total del Pedido -->
              <div style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.375rem;">
                <div style="display: flex; justify-content: between; align-items: center;">
                  <span style="font-weight: 600; font-size: 1.125rem;">Total del Pedido:</span>
                  <span id="orderTotal" style="font-weight: 700; font-size: 1.25rem; color: #059669;">$0.00</span>
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
    const form = document.getElementById('orderForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Búsqueda de clientes
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch) {
      clientSearch.addEventListener('input', (e) => this.searchClients(e.target.value));
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

    // Event listeners para actualización de productos
    if (window.eventBus && window.EVENTS) {
      // Escuchar cuando se crea un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_CREATED, (data) => {
        console.log('📦 Nuevo producto creado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts().then(() => {
          this.populateProductSelect();
        });
      });

      // Escuchar cuando se actualiza un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_UPDATED, (data) => {
        console.log('📦 Producto actualizado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts().then(() => {
          this.populateProductSelect();
        });
      });

      // Escuchar cuando se activa un producto
      window.eventBus.on(window.EVENTS.PRODUCTO_ACTIVATED, (data) => {
        console.log('📦 Producto activado, actualizando lista de productos en OrderModal...', data);
        this.loadProducts().then(() => {
          this.populateProductSelect();
        });
      });

      console.log('✅ Event listeners de productos configurados en OrderModal');
    }
  }

  show(orderData = null) {
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('orderModalTitle');
    
    console.log('📦 Abriendo modal de pedido:', orderData ? 'edición' : 'nuevo');
    
    if (orderData) {
      // Modo edición (por implementar)
      this.editingOrderId = orderData.id;
      title.textContent = 'Editar Pedido';
      console.log('📝 Modo edición para pedido:', orderData.id);
    } else {
      // Modo creación - limpiar completamente
      this.editingOrderId = null;
      title.textContent = 'Nuevo Pedido';
      console.log('🆕 Modo creación - limpiando formulario');
      
      // Limpiar inmediatamente antes de mostrar el modal
      this.resetForm();
    }
    
    // Mostrar el modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    
    // Poblar select de productos después de mostrar el modal
    this.populateProductSelect();
    
    // Enfocar el primer campo
    setTimeout(() => {
      const clientSearch = document.getElementById('clientSearch');
      if (clientSearch) {
        clientSearch.focus();
      }
    }, 100);
    
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
    
    // Limpiar formulario
    const form = document.getElementById('orderForm');
    if (form) {
      form.reset();
    }
    
    // Limpiar estado interno
    this.selectedClient = null;
    this.orderItems = [];
    this.editingOrderId = null;
    
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
    this.resetForm();
  }

  // ========== MANEJO DE CLIENTES ==========

  searchClients(searchTerm) {
    const dropdown = document.getElementById('clientDropdown');

    if (!searchTerm.trim()) {
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
    this.showClientDropdown();
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
      const response = await fetch(`https://back-adm.fly.dev/api/clientes/${this.selectedClient.codigo}`, {
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
    document.getElementById('clientDropdown').classList.remove('hidden');
  }

  hideClientDropdown() {
    document.getElementById('clientDropdown').classList.add('hidden');
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
      alert('Selecciona un producto');
      return;
    }

    const product = this.availableProducts.find(p => p.codigo == productId);
    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const availableStock = parseInt(product.stock || 0);
    if (quantity > availableStock) {
      alert(`Stock insuficiente. Disponible: ${availableStock}`);
      return;
    }

    // Verificar si el producto ya está en el pedido
    const existingItem = this.orderItems.find(item => item.productId == productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        alert(`Stock insuficiente. Ya tienes ${existingItem.quantity} en el pedido. Máximo total: ${availableStock}`);
        return;
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

    if (newQuantity > item.stock) {
      alert(`Stock insuficiente. Máximo: ${item.stock}`);
      return;
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

    const itemsHTML = this.orderItems.map(item => `
      <div style="padding: 1rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #111827;">${item.name}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">$${item.price.toFixed(2)} c/u</div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <button onclick="orderModal.updateProductQuantity(${item.productId}, ${item.quantity - 1})"
                    style="width: 24px; height: 24px; border: 1px solid #d1d5db; background: white; border-radius: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              -
            </button>
            <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
            <button onclick="orderModal.updateProductQuantity(${item.productId}, ${item.quantity + 1})"
                    style="width: 24px; height: 24px; border: 1px solid #d1d5db; background: white; border-radius: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              +
            </button>
          </div>

          <div style="min-width: 80px; text-align: right; font-weight: 600; color: #059669;">
            $${item.subtotal.toFixed(2)}
          </div>

          <button onclick="orderModal.removeProduct(${item.productId})"
                  style="width: 24px; height: 24px; background: #ef4444; color: white; border: none; border-radius: 0.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center;"
                  title="Eliminar producto">
            ×
          </button>
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

    if (!this.selectedClient) {
      alert('Selecciona un cliente para el pedido');
      return;
    }

    if (this.orderItems.length === 0) {
      alert('Agrega al menos un producto al pedido');
      return;
    }

    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('orderSubmitButtonText');
    const originalText = submitButtonText.textContent;

    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = 'Creando pedido...';

    try {
      const orderData = {
        clienteId: this.selectedClient.codigo,
        productos: this.orderItems.map(item => ({
          productoId: item.productId,
          cantidad: item.quantity,
          precio: item.price
        })),
        total: this.orderItems.reduce((sum, item) => sum + item.subtotal, 0)
      };

      console.log('📦 Creando pedido:', orderData);

      const token = localStorage.getItem('token');
      const response = await fetch('https://back-adm.fly.dev/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando pedido');
      }

      const result = await response.json();
      console.log('✅ Pedido creado:', result);

      // Guardar datos antes de cerrar el modal (porque close() los limpia)
      const clienteInfo = this.selectedClient ? { ...this.selectedClient } : null;
      const productosInfo = [...this.orderItems];
      const clientName = clienteInfo ? clienteInfo.nombre || 'Cliente' : 'Cliente';
      const productCount = productosInfo.length;

      // Éxito
      this.close();

      // Emitir evento de pedido creado para actualización reactiva
      if (window.eventBus && window.EVENTS) {
        window.eventBus.emit(window.EVENTS.PEDIDO_CREATED, {
          pedido: result,
          cliente: clienteInfo,
          productos: productosInfo
        });
      }

      // Recargar la lista de pedidos (compatibilidad con index.astro)
      if (typeof loadPedidos === 'function') {
        await loadPedidos();
      }

      // Mostrar mensaje de éxito
      this.showSuccessMessage(`Pedido creado para ${clientName} con ${productCount} producto${productCount > 1 ? 's' : ''}`);

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
