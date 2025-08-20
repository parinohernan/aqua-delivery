// Componente para el modal de entrega de pedidos
class DeliveryModal {
  constructor() {
    this.pedidoData = null;
    this.pedidoItems = [];
    this.totalRetornables = 0;
    this.tiposPago = [];
    this.init();
  }

  // Helper simplificado para convertir aplicaSaldo
  convertirAplicaSaldo(aplicaSaldo) {
    // Si es Buffer (MySQL BIT), verificar el primer byte
    if (aplicaSaldo && typeof aplicaSaldo === 'object' && aplicaSaldo.type === 'Buffer') {
      return aplicaSaldo.data[0] === 1;
    }
    
    // Si es número, comparar con 1
    if (typeof aplicaSaldo === 'number') {
      return aplicaSaldo === 1;
    }
    
    // Si es string, convertir a número
    if (typeof aplicaSaldo === 'string') {
      return parseInt(aplicaSaldo) === 1;
    }
    
    // Si es boolean, retornar directamente
    if (typeof aplicaSaldo === 'boolean') {
      return aplicaSaldo;
    }
    
    // Por defecto, false
    return false;
  }

  async init() {
    this.createModal();
    this.attachEventListeners();
    await this.loadTiposPago();
  }

  async loadTiposPago() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tiposdepago', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        this.tiposPago = await response.json();
        console.log('💳 Tipos de pago cargados:', this.tiposPago.length);
      }
    } catch (error) {
      console.error('Error cargando tipos de pago:', error);
      this.tiposPago = [];
    }
  }

  createModal() {
    const modalHTML = `
      <div id="deliveryModal" class="hidden modal-overlay">
        <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h4 id="deliveryModalTitle" class="modal-title">🚚 Entregar Pedido</h4>
            <button onclick="deliveryModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <!-- Información del pedido -->
          <div id="pedidoInfo" style="margin-bottom: 1.5rem; padding: 1rem; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.375rem;">
            <!-- Se llenará dinámicamente -->
          </div>

          <form id="deliveryForm">
            <!-- Tipo de Pago -->
            <div class="form-group">
              <label class="form-label">Tipo de Pago *</label>
              <select id="tipoPago" name="tipoPago" required class="form-input">
                <option value="">Seleccionar tipo de pago...</option>
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">🏦 Transferencia</option>
                <option value="tarjeta">💳 Tarjeta</option>
                <option value="cuenta_corriente">📋 Cuenta Corriente</option>
              </select>
            </div>

            <!-- Monto cobrado (solo si no es cuenta corriente) -->
            <div id="montoGroup" class="form-group hidden">
              <label class="form-label">Monto Cobrado *</label>
              <div style="position: relative;">
                <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #6b7280;">$</span>
                <input type="number" id="montoCobrado" name="montoCobrado" step="0.01" 
                       class="form-input" style="padding-left: 2rem;" placeholder="0.00" />
              </div>
              <small style="color: #6b7280; font-size: 0.875rem;">
                Total del pedido: $<span id="totalPedido">0.00</span>. Puede cobrar más o menos del total (entrega por adelantado).
              </small>
            </div>

            <!-- Retornables (se muestra si hay productos retornables) -->
            <div id="retornablesGroup" class="form-group hidden">
              <label class="form-label">Retornables</label>
              <div style="padding: 1rem; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 0.375rem; margin-bottom: 1rem;">
                <p style="margin: 0; font-size: 0.875rem; color: #92400e;">
                  <strong>🔄 Este pedido incluye <span id="cantidadRetornables">0</span> productos retornables</strong>
                </p>
              </div>
              
              <label class="form-label">¿Cuántos retornables devuelve el cliente?</label>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="number" id="retornablesDevueltos" name="retornablesDevueltos" 
                       value="0" class="form-input" style="width: 120px;" />
                <span style="color: #6b7280; font-size: 0.875rem;">
                  de <span id="maxRetornables">0</span> retornables
                </span>
              </div>
              <small style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem; display: block;">
                Los retornables no devueltos se sumarán al saldo del cliente. Puede devolver más de los que debe (entrega por adelantado).
              </small>
            </div>



            <!-- Resumen de la entrega -->
            <div id="resumenEntrega" class="form-group" style="padding: 1rem; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
              <h5 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #111827;">📋 Resumen de Entrega</h5>
              <div id="resumenContent">
                <!-- Se llenará dinámicamente -->
              </div>
            </div>
            
            <div class="modal-buttons">
              <button type="button" onclick="deliveryModal.close()" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                <span id="deliverySubmitButtonText">🚚 Confirmar Entrega</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('deliveryModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    const form = document.getElementById('deliveryForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Cambio en tipo de pago
    const tipoPago = document.getElementById('tipoPago');
    if (tipoPago) {
      tipoPago.addEventListener('change', () => this.handleTipoPagoChange());
    }

    // Cambio en monto cobrado
    const montoCobrado = document.getElementById('montoCobrado');
    if (montoCobrado) {
      montoCobrado.addEventListener('input', () => this.updateResumen());
    }

    // Cambio en retornables devueltos
    const retornablesDevueltos = document.getElementById('retornablesDevueltos');
    if (retornablesDevueltos) {
      retornablesDevueltos.addEventListener('input', () => this.updateResumen());
    }

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('deliveryModal');
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

  async show(pedidoId) {
    const modal = document.getElementById('deliveryModal');
    const title = document.getElementById('deliveryModalTitle');
    
    console.log('🚚 Iniciando proceso de entrega para pedido:', pedidoId);
    
    try {
      // Cargar datos del pedido
      await this.loadPedidoData(pedidoId);
      
      // Cargar items del pedido
      await this.loadPedidoItems(pedidoId);
      
      // Pequeño delay para asegurar que los items se procesen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Configurar el modal
      this.setupModal();
      
      // Mostrar el modal (respetando estilos globales)
      modal.classList.remove('hidden');
      modal.classList.add('show');
      modal.style.zIndex = '10000';
      
      // Enfocar el primer campo
      setTimeout(() => {
        document.getElementById('tipoPago').focus();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error cargando datos del pedido:', error);
      alert('Error cargando datos del pedido: ' + error.message);
    }
  }

  async loadPedidoData(pedidoId) {
    console.log('📋 Cargando datos del pedido:', pedidoId);
    console.log('📋 window.currentPedidos disponible:', !!window.currentPedidos);
    console.log('📋 Cantidad de pedidos:', window.currentPedidos?.length || 0);

    // Buscar el pedido en los datos actuales
    if (window.currentPedidos && window.currentPedidos.length > 0) {
      console.log('🔍 Buscando pedido en currentPedidos...');
      this.pedidoData = window.currentPedidos.find(p => {
        const id = p.id || p.codigo;
        console.log('🔍 Comparando:', id, 'con', pedidoId, '- Match:', id == pedidoId);
        return id == pedidoId;
      });
    }

    // Si no se encuentra en currentPedidos, buscar en allPedidos
    if (!this.pedidoData && window.allPedidos && window.allPedidos.length > 0) {
      console.log('🔍 Buscando pedido en allPedidos...');
      this.pedidoData = window.allPedidos.find(p => {
        const id = p.id || p.codigo;
        console.log('🔍 Comparando en allPedidos:', id, 'con', pedidoId, '- Match:', id == pedidoId);
        return id == pedidoId;
      });
    }

    if (!this.pedidoData) {
      console.error('❌ Pedido no encontrado en ninguna lista');
      console.log('📋 currentPedidos:', window.currentPedidos);
      console.log('📋 allPedidos:', window.allPedidos);
      throw new Error('Pedido no encontrado');
    }

    console.log('✅ Datos del pedido cargados:', this.pedidoData);
  }

  async loadPedidoItems(pedidoId) {
    console.log('📦 Cargando items del pedido:', pedidoId);
    
    try {
      if (window.getPedidoItems) {
        console.log('🔍 Llamando a window.getPedidoItems...');
        this.pedidoItems = await window.getPedidoItems(pedidoId);
        console.log('📋 Items recibidos:', this.pedidoItems);
      } else {
        console.warn('⚠️ window.getPedidoItems no está disponible');
        this.pedidoItems = [];
      }
      
      // Calcular total de retornables usando ÚNICAMENTE el campo esRetornable de la BD
      this.totalRetornables = this.pedidoItems.reduce((total, item) => {
        // Verificar que el campo esRetornable esté disponible
        if (item.esRetornable === undefined || item.esRetornable === null) {
          console.error(`❌ Error: Campo esRetornable no disponible para producto ${item.codigoProducto} - ${item.nombreProducto}`);
          throw new Error(`Campo esRetornable no disponible para producto ${item.nombreProducto}`);
        }
        
        // Usar ÚNICAMENTE el campo esRetornable de la base de datos
        const esRetornable = item.esRetornable === 1 || item.esRetornable === true;
        
        return total + (esRetornable ? item.cantidad : 0);
      }, 0);
      
      console.log('✅ Items cargados:', this.pedidoItems.length, 'items');
      console.log('🔄 Total retornables:', this.totalRetornables);
      
      // Debug: mostrar cada item
      this.pedidoItems.forEach((item, index) => {
        console.log(`📦 Item ${index + 1}:`, {
          codigoProducto: item.codigoProducto,
          nombre: item.descripcion || item.nombreProducto,
          cantidad: item.cantidad,
          precio: item.precioUnitario || item.precio,
          esRetornable: item.esRetornable
        });
      });
      
    } catch (error) {
      console.error('❌ Error cargando items:', error);
      this.pedidoItems = [];
      this.totalRetornables = 0;
    }
  }

  setupModal() {
    // Mostrar información del pedido
    this.showPedidoInfo();
    
    // Configurar campos según los datos
    this.setupFields();
    
    // Actualizar resumen inicial
    this.updateResumen();
  }

  showPedidoInfo() {
    console.log('📋 Mostrando información del pedido...');
    console.log('📦 Items disponibles:', this.pedidoItems);
    console.log('📦 Cantidad de items:', this.pedidoItems.length);
    
    const container = document.getElementById('pedidoInfo');
    if (!container) {
      console.error('❌ Elemento pedidoInfo no encontrado');
      return;
    }
    
    const clienteNombre = this.pedidoData.cliente_nombre || this.pedidoData.nombre || 'Cliente sin nombre';
    const total = parseFloat(this.pedidoData.total || 0);
    const direccion = this.pedidoData.direccion || 'Sin dirección';
    const telefono = this.pedidoData.telefono || 'Sin teléfono';
    
    // Generar lista de items detallada
    let itemsHTML = '';
    if (this.pedidoItems.length > 0) {
      itemsHTML = '<div style="margin-top: 0.5rem; padding: 0.5rem; background: #f9fafb; border-radius: 0.25rem;">';
      this.pedidoItems.forEach(item => {
        const nombre = item.descripcion || item.nombreProducto || `Producto #${item.codigoProducto}`;
        const cantidad = item.cantidad || 0;
        const precio = parseFloat(item.precioUnitario || item.precio || 0);
        const subtotal = parseFloat(item.subtotal || (cantidad * precio));
        const esRetornable = item.esRetornable === 1;
        
        itemsHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; font-size: 0.875rem;">
            <div style="flex: 1;">
              <span style="font-weight: 500;">${nombre}</span>
              ${esRetornable ? ' <span style="color: #f59e0b;">🔄</span>' : ''}
            </div>
            <div style="text-align: right;">
              <span>${cantidad} x $${precio.toFixed(2)}</span>
              <span style="font-weight: 600; margin-left: 0.5rem;">$${subtotal.toFixed(2)}</span>
            </div>
          </div>
        `;
      });
      itemsHTML += '</div>';
    }

    container.innerHTML = `
      <div style="display: grid; gap: 0.5rem;">
        <div><strong>🧾 Pedido:</strong> #${this.pedidoData.id || this.pedidoData.codigo}</div>
        <div><strong>👤 Cliente:</strong> ${clienteNombre}</div>
        <div><strong>📞 Teléfono:</strong> ${telefono}</div>
        <div><strong>📍 Dirección:</strong> ${direccion}</div>
        <div><strong>💰 Total:</strong> $${total.toFixed(2)}</div>
        <div><strong>📦 Items:</strong> ${this.pedidoItems.length} productos</div>
        ${itemsHTML}
      </div>
    `;
  }

  setupFields() {
    // Configurar total del pedido
    const total = parseFloat(this.pedidoData.total || 0);
    document.getElementById('totalPedido').textContent = total.toFixed(2);
    document.getElementById('montoCobrado').value = total.toFixed(2);

    // Configurar opciones de tipo de pago
    this.setupTiposPago();
    
    // Configurar retornables si hay
    if (this.totalRetornables > 0) {
      document.getElementById('retornablesGroup').classList.remove('hidden');
      document.getElementById('cantidadRetornables').textContent = this.totalRetornables;
      document.getElementById('maxRetornables').textContent = this.totalRetornables;
      document.getElementById('retornablesDevueltos').value = this.totalRetornables; // Por defecto devuelve todos
    } else {
      document.getElementById('retornablesGroup').classList.add('hidden');
    }
  }

  setupTiposPago() {
    const tipoPagoSelect = document.getElementById('tipoPago');
    if (!tipoPagoSelect || this.tiposPago.length === 0) return;

    // Limpiar opciones existentes
    tipoPagoSelect.innerHTML = '<option value="">Seleccionar tipo de pago...</option>';

    // Agregar opciones dinámicas
    this.tiposPago.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.id;
      const aplicaSaldo = this.convertirAplicaSaldo(tipo.aplicaSaldo);
      option.textContent = `${tipo.pago}${aplicaSaldo ? ' (Aplica saldo)' : ''}`;
      tipoPagoSelect.appendChild(option);
    });
  }

  handleTipoPagoChange() {
    const tipoPagoId = document.getElementById('tipoPago').value;
    const montoGroup = document.getElementById('montoGroup');
    const montoCobrado = document.getElementById('montoCobrado');

    if (!tipoPagoId) {
      // Sin selección
      montoGroup.classList.add('hidden');
      montoCobrado.required = false;
      this.updateResumen();
      return;
    }

    // Buscar el tipo de pago seleccionado
    const tipoPago = this.tiposPago.find(t => t.id == tipoPagoId);
    const aplicaSaldo = tipoPago ? this.convertirAplicaSaldo(tipoPago.aplicaSaldo) : false;

    if (tipoPago && aplicaSaldo) {
      // Si aplica saldo, no se cobra dinero
      montoGroup.classList.add('hidden');
      montoCobrado.required = false;
      montoCobrado.value = '0';
    } else {
      // Para otros tipos de pago, mostrar campo de monto
      montoGroup.classList.remove('hidden');
      montoCobrado.required = true;
      const total = parseFloat(this.pedidoData.total || 0);
      montoCobrado.value = total.toFixed(2);
    }

    this.updateResumen();
  }

  updateResumen() {
    const tipoPago = document.getElementById('tipoPago').value;
    const montoCobrado = parseFloat(document.getElementById('montoCobrado').value || 0);
    const retornablesDevueltos = parseInt(document.getElementById('retornablesDevueltos').value || 0);
    const totalPedido = parseFloat(this.pedidoData.total || 0);
    
    const container = document.getElementById('resumenContent');
    
    if (!tipoPago) {
      container.innerHTML = '<p style="color: #6b7280; margin: 0;">Selecciona el tipo de pago para ver el resumen</p>';
      return;
    }
    
    let resumenHTML = '';
    
    // Información de pago
    if (tipoPago === 'cuenta_corriente') {
      resumenHTML += `
        <div style="margin-bottom: 0.5rem;">
          💳 <strong>Pago:</strong> Se aplicará a cuenta corriente
        </div>
        <div style="margin-bottom: 0.5rem;">
          💰 <strong>Monto:</strong> $${totalPedido.toFixed(2)} (se sumará al saldo del cliente)
        </div>
      `;
    } else {
      resumenHTML += `
        <div style="margin-bottom: 0.5rem;">
          💰 <strong>Pago:</strong> ${tipoPago} - $${montoCobrado.toFixed(2)}
        </div>
      `;
      
      if (montoCobrado !== totalPedido) {
        const diferencia = totalPedido - montoCobrado;
        resumenHTML += `
          <div style="margin-bottom: 0.5rem; color: ${diferencia > 0 ? '#dc2626' : '#059669'};">
            📊 <strong>Diferencia:</strong> $${Math.abs(diferencia).toFixed(2)} ${diferencia > 0 ? '(faltante)' : '(vuelto)'}
          </div>
        `;
      }
    }
    
    // Información de retornables
    if (this.totalRetornables > 0) {
      const retornablesNoDevueltos = this.totalRetornables - retornablesDevueltos;
      resumenHTML += `
        <div style="margin-bottom: 0.5rem;">
          🔄 <strong>Retornables devueltos:</strong> ${retornablesDevueltos} de ${this.totalRetornables}
        </div>
      `;
      
      if (retornablesNoDevueltos > 0) {
        resumenHTML += `
          <div style="margin-bottom: 0.5rem; color: #f59e0b;">
            ⚠️ <strong>Retornables pendientes:</strong> ${retornablesNoDevueltos} (se sumarán al saldo del cliente)
          </div>
        `;
      }
    }
    
    container.innerHTML = resumenHTML;
  }

  close() {
    const modal = document.getElementById('deliveryModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    
    // Limpiar datos
    this.pedidoData = null;
    this.pedidoItems = [];
    this.totalRetornables = 0;
    
    // Resetear formulario
    document.getElementById('deliveryForm').reset();
    document.getElementById('montoGroup').classList.add('hidden');
    document.getElementById('retornablesGroup').classList.add('hidden');
    
    console.log('🚚 Modal de entrega cerrado');
  }

  async handleSubmit(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('deliverySubmitButtonText');
    const originalText = submitButtonText.textContent;

    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = '🚚 Procesando entrega...';

    try {
      const formData = new FormData(e.target);
      const tipoPagoId = formData.get('tipoPago');
      const pedidoId = this.pedidoData.id || this.pedidoData.codigo;

      // Obtener información del tipo de pago seleccionado
      const tipoPago = this.tiposPago.find(t => t.id == tipoPagoId);
      const aplicaSaldo = tipoPago ? this.convertirAplicaSaldo(tipoPago.aplicaSaldo) : false;

      console.log('🚚 Procesando entrega:', { pedidoId, tipoPagoId, aplicaSaldo });
      console.log('💳 Tipo de pago encontrado:', tipoPago);
      console.log('💳 aplicaSaldo raw:', tipoPago?.aplicaSaldo);
      console.log('💳 aplicaSaldo convertido:', aplicaSaldo);

      // Preparar datos para el endpoint de entrega
      const montoCobrado = parseFloat(formData.get('montoCobrado') || 0);
      const retornablesDevueltos = parseInt(formData.get('retornablesDevueltos') || 0);
      const totalPedido = parseFloat(this.pedidoData.total || 0);

      const entregaData = {
        tipoPago: tipoPagoId,
        montoCobrado: aplicaSaldo ? 0 : montoCobrado,
        retornablesDevueltos: retornablesDevueltos,
        totalRetornables: this.totalRetornables,
        totalPedido: totalPedido
      };

      console.log('🚚 Datos de entrega:', entregaData);
      console.log('🔄 Total retornables en pedido:', this.totalRetornables);
      console.log('🔄 Retornables devueltos:', retornablesDevueltos);
      console.log('🔄 Retornables no devueltos:', this.totalRetornables - retornablesDevueltos);
      console.log('💳 Tipo de pago seleccionado:', tipoPagoId);
      console.log('💳 Aplica saldo:', aplicaSaldo);

      // Usar el endpoint de entrega que maneja retornables
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pedidos/${pedidoId}/entregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entregaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error procesando entrega');
      }

      const result = await response.json();
      console.log('✅ Entrega procesada:', result);

      // Éxito
      this.close();

      // Emitir evento de pedido actualizado para actualización reactiva
      if (window.eventBus && window.EVENTS) {
        window.eventBus.emit(window.EVENTS.PEDIDO_UPDATED, {
          pedidoId: pedidoId,
          nuevoEstado: 'entregad',
          tipoPago: tipoPagoId,
          aplicaSaldo: aplicaSaldo
        });
      }

      // Recargar la lista de pedidos (compatibilidad con index.astro)
      if (typeof loadPedidos === 'function') {
        await loadPedidos();
      }

      // Mostrar mensaje de éxito con información de retornables
      let mensaje = 'Pedido entregado correctamente.';
      
      if (aplicaSaldo) {
        mensaje += ' Saldo actualizado en cuenta corriente.';
      }
      
      if (result.retornablesNoDevueltos > 0) {
        mensaje += ` ${result.retornablesNoDevueltos} retornables agregados al saldo del cliente.`;
      }
      
      this.showSuccessMessage(mensaje);

    } catch (error) {
      console.error('❌ Error procesando entrega:', error);
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
window.deliveryModal = new DeliveryModal();
// Función global de conveniencia
window.startDelivery = function(pedidoId) { window.deliveryModal.show(pedidoId); }
