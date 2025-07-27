// Componente para el modal de pedidos
class OrderModal {
  constructor() {
    this.editingOrderId = null;
    this.selectedClient = null;
    this.orderItems = [];
    this.availableProducts = [];
    this.availableClients = [];
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
    this.loadInitialData();
  }

  async loadInitialData() {
    try {
      // Cargar productos y clientes disponibles
      await Promise.all([
        this.loadProducts(),
        this.loadClients()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  }

  async loadProducts() {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/productos', {
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
      const response = await fetch('/api/clientes', {
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

  createModal() {
    const modalHTML = `
      <div id="orderModal" class="hidden modal-overlay">
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
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong id="selectedClientName"></strong>
                    <div style="font-size: 0.875rem; color: #6b7280;">
                      <span id="selectedClientPhone"></span> • <span id="selectedClientAddress"></span>
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
  }

  show(orderData = null) {
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('orderModalTitle');
    
    if (orderData) {
      // Modo edición (por implementar)
      this.editingOrderId = orderData.id;
      title.textContent = 'Editar Pedido';
    } else {
      // Modo creación
      this.editingOrderId = null;
      title.textContent = 'Nuevo Pedido';
      this.resetForm();
    }
    
    modal.classList.remove('hidden');
    this.populateProductSelect();
    
    // Enfocar el primer campo
    setTimeout(() => {
      document.getElementById('clientSearch').focus();
    }, 100);
  }

  resetForm() {
    document.getElementById('orderForm').reset();
    this.selectedClient = null;
    this.orderItems = [];
    this.hideSelectedClient();
    this.updateOrderItemsList();
    this.updateTotal();
  }

  close() {
    const modal = document.getElementById('orderModal');
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

    document.getElementById('selectedClient').classList.remove('hidden');
    document.getElementById('clientSearch').style.display = 'none';
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

    this.availableProducts.forEach(product => {
      const name = product.descripcion || `Producto #${product.codigo}`;
      const price = parseFloat(product.precio || 0);
      const stock = parseInt(product.stock || 0);

      select.innerHTML += `
        <option value="${product.codigo}" data-price="${price}" data-stock="${stock}">
          ${name} - $${price.toFixed(2)} (Stock: ${stock})
        </option>
      `;
    });
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

    if (this.orderItems.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

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

    container.innerHTML = `${itemsHTML}${emptyState.outerHTML}`;
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
      const response = await fetch('/api/pedidos', {
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

      // Éxito
      this.close();

      // Recargar la lista de pedidos
      if (typeof loadPedidos === 'function') {
        await loadPedidos();
      }

      // Mostrar mensaje de éxito
      const clientName = this.selectedClient.nombre || 'Cliente';
      const productCount = this.orderItems.length;
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
}

// Crear instancia global
window.orderModal = new OrderModal();
