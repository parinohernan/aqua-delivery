// Modal para registrar pagos directos de clientes
class ClientPaymentModal {
  constructor() {
    console.log('🏗️ Inicializando ClientPaymentModal...');
    this.clienteId = null;
    this.clienteData = null;
    this.tiposPago = [];
    this.init();
    console.log('✅ ClientPaymentModal inicializado');
  }

  async init() {
    this.createModal();
    this.attachEventListeners();
    await this.loadTiposPago();
  }

  async loadTiposPago() {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/tiposdepago`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allTipos = await response.json();
        // Solo tipos de pago que NO aplican saldo (para pagos inmediatos)
        this.tiposPago = allTipos.filter(tipo => {
          const aplicaSaldo = tipo.aplicaSaldo && 
            (tipo.aplicaSaldo[0] === 1 || tipo.aplicaSaldo === 1 || tipo.aplicaSaldo === true);
          return !aplicaSaldo;
        });
        console.log('💳 Tipos de pago cargados (sin saldo):', this.tiposPago.length);
      } else {
        console.warn('⚠️ No se pudieron cargar los tipos de pago');
        this.tiposPago = [];
      }
    } catch (error) {
      console.error('💥 Error cargando tipos de pago:', error);
      this.tiposPago = [];
    }
  }

  createModal() {
    const modalHTML = `
      <div id="clientPaymentModal" class="hidden modal-overlay">
        <div class="modal-content" style="max-width: 500px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h4 class="modal-title">💳 Registrar Cobro</h4>
            <button onclick="clientPaymentModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <div id="clientPaymentInfo" style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <!-- Información del cliente se cargará aquí -->
          </div>
          
          <form id="clientPaymentForm">
            <div class="form-group">
              <label class="form-label">Tipo de Pago *</label>
              <select id="paymentTipoPago" name="tipoPagoId" required class="form-input">
                <option value="">Cargando tipos de pago...</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Monto a Cobrar ($) *</label>
              <input type="number" id="paymentMonto" name="monto" step="0.01" min="0.01" required class="form-input" 
                     placeholder="0.00" />
              <p style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                Ingresa el monto que el cliente está pagando
              </p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Observaciones</label>
              <textarea id="paymentObservaciones" name="observaciones" class="form-input" rows="3"
                        placeholder="Observaciones opcionales sobre el pago..."></textarea>
            </div>
            
            <div id="paymentSummary" style="background: #ecfdf5; border: 1px solid #059669; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
              <!-- Resumen del pago se mostrará aquí -->
            </div>
            
            <div class="modal-buttons">
              <button type="button" onclick="clientPaymentModal.close()" class="btn-secondary" style="width: auto; padding: 0.5rem 1rem;">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                <span id="paymentSubmitButtonText">💳 Registrar Cobro</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('clientPaymentModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    const form = document.getElementById('clientPaymentForm');
    if (form) {
      // Remover event listeners previos
      form.removeEventListener('submit', this.boundHandleSubmit);
      
      // Crear función bound
      this.boundHandleSubmit = (e) => this.handleSubmit(e);
      
      form.addEventListener('submit', this.boundHandleSubmit);
    }

    // Actualizar resumen cuando cambie el monto o tipo de pago
    const montoInput = document.getElementById('paymentMonto');
    const tipoPagoSelect = document.getElementById('paymentTipoPago');
    
    if (montoInput) {
      montoInput.addEventListener('input', () => this.updateSummary());
    }
    
    if (tipoPagoSelect) {
      tipoPagoSelect.addEventListener('change', () => this.updateSummary());
    }
  }

  async show(clienteId) {
    this.clienteId = clienteId;
    
    // Cargar datos del cliente
    await this.loadClienteData(clienteId);
    
    if (!this.clienteData) {
      this.showErrorMessage('No se pudo cargar la información del cliente');
      return;
    }
    
    const modal = document.getElementById('clientPaymentModal');
    const form = document.getElementById('clientPaymentForm');
    
    // Resetear formulario
    form.reset();
    
    // Mostrar información del cliente
    this.renderClienteInfo();
    
    // Configurar tipos de pago
    this.setupTiposPago();
    
    // Limpiar resumen
    this.updateSummary();
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('show');
    modal.style.zIndex = '10000';
    
    // Reconfigurar event listeners
    this.attachEventListeners();
    
    // Focus en el campo de monto
    setTimeout(() => {
      const montoInput = document.getElementById('paymentMonto');
      if (montoInput) {
        // Si el cliente tiene saldo positivo (debe), sugerirlo como monto
        if (this.clienteData.saldo > 0) {
          montoInput.value = this.clienteData.saldo.toFixed(2);
          this.updateSummary();
        }
        montoInput.focus();
      }
    }, 100);
  }

  async loadClienteData(clienteId) {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      const response = await fetch(`${baseUrl}/api/clientes/${clienteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        this.clienteData = await response.json();
        console.log('👤 Datos del cliente cargados:', this.clienteData);
      } else {
        console.error('❌ Error cargando datos del cliente');
        this.clienteData = null;
      }
    } catch (error) {
      console.error('💥 Error cargando cliente:', error);
      this.clienteData = null;
    }
  }

  renderClienteInfo() {
    const container = document.getElementById('clientPaymentInfo');
    if (!container || !this.clienteData) return;

    const nombreCompleto = `${this.clienteData.nombre} ${this.clienteData.apellido || ''}`.trim();
    const saldo = parseFloat(this.clienteData.saldo || 0);
    const saldoClass = saldo > 0 ? 'text-red-600' : saldo < 0 ? 'text-green-600' : 'text-gray-600';
    const saldoText = saldo > 0 ? 'Debe' : saldo < 0 ? 'A favor' : 'Sin deuda';

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
          👤
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: #111827;">${nombreCompleto}</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">
            📞 ${this.clienteData.telefono || 'N/A'}
          </p>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem;">
            <span style="font-weight: 500;">Saldo actual:</span> 
            <span style="color: ${saldo > 0 ? '#dc2626' : saldo < 0 ? '#059669' : '#6b7280'}; font-weight: 600;">
              $${saldo.toFixed(2)} ${saldo > 0 ? '(Debe)' : saldo < 0 ? '(A favor)' : '(Sin deuda)'}
            </span>
          </p>
        </div>
      </div>
    `;
  }

  setupTiposPago() {
    const tipoPagoSelect = document.getElementById('paymentTipoPago');
    if (!tipoPagoSelect) return;

    // Limpiar opciones
    tipoPagoSelect.innerHTML = '<option value="">Seleccionar tipo de pago...</option>';

    // Si no hay tipos de pago, mostrar mensaje
    if (this.tiposPago.length === 0) {
      tipoPagoSelect.innerHTML = '<option value="">No hay tipos de pago disponibles</option>';
      console.error('❌ No hay tipos de pago disponibles para pagos inmediatos');
      return;
    }

    // Agregar opciones
    this.tiposPago.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.id;
      option.textContent = tipo.pago;
      tipoPagoSelect.appendChild(option);
    });
  }

  updateSummary() {
    const container = document.getElementById('paymentSummary');
    if (!container || !this.clienteData) return;

    const monto = parseFloat(document.getElementById('paymentMonto').value) || 0;
    const tipoPagoId = document.getElementById('paymentTipoPago').value;

    if (monto <= 0 || !tipoPagoId) {
      container.innerHTML = '<p style="color: #6b7280; margin: 0; text-align: center;">Completa los campos para ver el resumen</p>';
      return;
    }

    const tipoPago = this.tiposPago.find(t => t.id == tipoPagoId);
    const saldoActual = parseFloat(this.clienteData.saldo || 0);
    const nuevoSaldo = saldoActual - monto;

    container.innerHTML = `
      <div style="font-size: 0.875rem;">
        <h5 style="margin: 0 0 0.75rem 0; font-weight: 600; color: #059669;">📋 Resumen del Cobro</h5>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: #6b7280;">Tipo de pago:</span>
          <span style="font-weight: 500;">${tipoPago ? tipoPago.pago : 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span style="color: #6b7280;">Monto a cobrar:</span>
          <span style="font-weight: 500; color: #059669;">$${monto.toFixed(2)}</span>
        </div>
        <div style="border-top: 1px solid #d1fae5; margin: 0.5rem 0; padding-top: 0.5rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span style="color: #6b7280;">Saldo actual:</span>
            <span style="font-weight: 500; color: ${saldoActual > 0 ? '#dc2626' : saldoActual < 0 ? '#059669' : '#6b7280'};">
              $${saldoActual.toFixed(2)}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Nuevo saldo:</span>
            <span style="font-weight: 600; font-size: 1rem; color: ${nuevoSaldo > 0 ? '#dc2626' : nuevoSaldo < 0 ? '#059669' : '#059669'};">
              $${nuevoSaldo.toFixed(2)}
            </span>
          </div>
        </div>
        ${nuevoSaldo < 0 ? `
          <div style="margin-top: 0.5rem; padding: 0.5rem; background: #fef3c7; border-radius: 0.25rem; font-size: 0.75rem; color: #92400e;">
            ⚠️ El cliente quedará con saldo a favor de $${Math.abs(nuevoSaldo).toFixed(2)}
          </div>
        ` : ''}
        ${nuevoSaldo > 0 ? `
          <div style="margin-top: 0.5rem; padding: 0.5rem; background: #fee2e2; border-radius: 0.25rem; font-size: 0.75rem; color: #991b1b;">
            ℹ️ El cliente aún deberá $${nuevoSaldo.toFixed(2)}
          </div>
        ` : ''}
        ${nuevoSaldo === 0 ? `
          <div style="margin-top: 0.5rem; padding: 0.5rem; background: #d1fae5; border-radius: 0.25rem; font-size: 0.75rem; color: #065f46;">
            ✅ El cliente quedará sin deuda
          </div>
        ` : ''}
      </div>
    `;
  }

  close() {
    console.log('🗺️ Cerrando ClientPaymentModal...');
    
    const modal = document.getElementById('clientPaymentModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    
    this.clienteId = null;
    this.clienteData = null;
    
    // Limpiar formulario
    document.getElementById('clientPaymentForm').reset();
    
    console.log('🗺️ ClientPaymentModal cerrado');
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    console.log('📝 ClientPaymentModal.handleSubmit ejecutándose');

    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('paymentSubmitButtonText');
    const originalText = submitButtonText.textContent;

    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = 'Procesando...';

    try {
      const formData = new FormData(e.target);
      const paymentData = {
        clienteId: this.clienteId,
        tipoPagoId: parseInt(formData.get('tipoPagoId')),
        monto: parseFloat(formData.get('monto')),
        observaciones: formData.get('observaciones')?.trim() || ''
      };

      console.log('📋 Datos del pago a enviar:', paymentData);

      // Validaciones
      if (!paymentData.clienteId) {
        throw new Error('ID de cliente no válido');
      }
      if (!paymentData.tipoPagoId) {
        throw new Error('Por favor selecciona un tipo de pago');
      }
      if (!paymentData.monto || paymentData.monto <= 0) {
        throw new Error('Por favor ingresa un monto válido mayor a 0');
      }

      const token = localStorage.getItem('token');
      const baseUrl = window.API_CONFIG?.BASE_URL || 'http://localhost:8001';
      
      const response = await fetch(`${baseUrl}/api/pagos/cliente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error registrando el cobro');
      }

      const result = await response.json();
      console.log('✅ Cobro registrado:', result);

      // Cerrar modal
      this.close();

      // Refrescar lista de clientes
      try {
        if (window.clientesController) {
          await window.clientesController.loadClientes();
        }
      } catch (e) {
        console.warn('⚠️ Error refrescando clientes:', e);
      }

      // Mostrar mensaje de éxito
      this.showSuccessMessage(result);

    } catch (error) {
      console.error('Error:', error);
      this.showErrorMessage(error.message);
    } finally {
      // Restaurar botón
      submitButton.disabled = false;
      submitButtonText.textContent = originalText;
    }
  }

  showSuccessMessage(result) {
    const message = `
      Cobro registrado correctamente
      ${result.clienteNombre ? `\n${result.clienteNombre}` : ''}
      ${result.monto ? `\nMonto: $${result.monto.toFixed(2)}` : ''}
      ${result.nuevoSaldo !== undefined ? `\nNuevo saldo: $${result.nuevoSaldo.toFixed(2)}` : ''}
    `;
    this.showNotification(message, 'success');
  }

  showErrorMessage(errorText) {
    this.showNotification(`Error: ${errorText}`, 'error');
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
      z-index: 10001;
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      white-space: pre-line;
      line-height: 1.5;
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

    if (!document.querySelector('#payment-notification-styles')) {
      style.id = 'payment-notification-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remover después de 4 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }
}

// Crear instancia global
console.log('🏗️ Creando instancia global de ClientPaymentModal...');
window.clientPaymentModal = new ClientPaymentModal();
console.log('✅ window.clientPaymentModal creado:', !!window.clientPaymentModal);

// Función global para abrir el modal
window.showClientPaymentModal = function(clienteId) {
  console.log('💳 Abriendo modal de cobro para cliente:', clienteId);
  if (window.clientPaymentModal) {
    window.clientPaymentModal.show(clienteId);
  } else {
    console.error('❌ ClientPaymentModal no está disponible');
  }
};
