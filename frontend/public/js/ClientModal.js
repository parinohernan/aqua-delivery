// Componente para el modal de clientes
class ClientModal {
  constructor() {
    this.editingClientId = null;
    this.currentClients = [];
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
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
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
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
      this.editingClientId = clientData.id || clientData.codigo;
      title.textContent = 'Editar Cliente';
      
      // Llenar el formulario con los datos existentes
      document.getElementById('clientName').value = clientData.nombre || '';
      document.getElementById('clientLastName').value = clientData.apellido || '';
      document.getElementById('clientPhone').value = clientData.telefono || '';
      document.getElementById('clientAddress').value = clientData.direccion || '';
      document.getElementById('clientBalance').value = clientData.saldo || 0;
      document.getElementById('clientReturnables').value = clientData.retornables || 0;
      
      document.getElementById('clientSubmitButtonText').textContent = 'Actualizar Cliente';
    } else {
      // Modo creación
      this.editingClientId = null;
      title.textContent = 'Nuevo Cliente';
      form.reset();
      // Establecer valores por defecto
      document.getElementById('clientBalance').value = '0';
      document.getElementById('clientReturnables').value = '0';
      document.getElementById('clientSubmitButtonText').textContent = 'Guardar Cliente';
    }
    
    modal.classList.remove('hidden');
    
    // Enfocar el primer campo
    setTimeout(() => {
      document.getElementById('clientName').focus();
    }, 100);
  }

  close() {
    const modal = document.getElementById('clientModal');
    modal.classList.add('hidden');
    this.editingClientId = null;
    
    // Limpiar formulario
    document.getElementById('clientForm').reset();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
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
        saldoDinero: parseFloat(formData.get('saldoDinero') || 0),
        saldoRetornables: parseInt(formData.get('saldoRetornables') || 0)
      };

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
        response = await fetch(`/api/clientes/${this.editingClientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(clientData)
        });
      } else {
        // Crear nuevo cliente
        response = await fetch('/api/clientes', {
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

      // Éxito
      this.close();
      
      // Recargar la lista de clientes
      if (typeof loadClientes === 'function') {
        await loadClientes();
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

  setCurrentClients(clients) {
    this.currentClients = clients;
  }
}

// Crear instancia global
window.clientModal = new ClientModal();
