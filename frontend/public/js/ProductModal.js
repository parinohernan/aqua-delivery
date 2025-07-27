// Componente para el modal de productos
class ProductModal {
  constructor() {
    this.editingProductId = null;
    this.currentProducts = [];
    this.init();
  }

  init() {
    this.createModal();
    this.attachEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div id="productModal" class="hidden modal-overlay">
        <div class="modal-content">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h4 id="modalTitle" class="modal-title">Nuevo Producto</h4>
            <button onclick="productModal.close()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">
              ×
            </button>
          </div>
          
          <form id="productForm">
            <div class="form-group">
              <label class="form-label">Descripción del Producto *</label>
              <textarea id="productDescription" name="descripcion" required class="form-input" rows="2"
                        placeholder="Ej: Bidón de agua 20L"></textarea>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" id="productRetornable" name="esRetornable" class="form-checkbox" />
                <span class="form-label" style="margin: 0;">Producto Retornable</span>
              </label>
              <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">
                Marcar si el producto debe ser devuelto (ej: bidones, envases)
              </p>
            </div>
            
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Precio *</label>
                <input type="number" id="productPrice" name="precio" step="0.01" min="0" required class="form-input" 
                       placeholder="0.00" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Stock *</label>
                <input type="number" id="productStock" name="stock" min="0" required class="form-input" 
                       placeholder="0" />
              </div>
            </div>
            
            <div class="modal-buttons">
              <button type="button" onclick="productModal.close()" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" style="width: auto; padding: 0.5rem 1rem;">
                <span id="submitButtonText">Guardar Producto</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Agregar el modal al body si no existe
    if (!document.getElementById('productModal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  attachEventListeners() {
    const form = document.getElementById('productForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('productModal');
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

  show(productData = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (productData) {
      // Modo edición
      this.editingProductId = productData.id || productData.codigo;
      title.textContent = 'Editar Producto';
      
      // Llenar el formulario con los datos existentes
      document.getElementById('productDescription').value = productData.descripcion || productData.description || '';
      document.getElementById('productPrice').value = productData.precio || productData.price || '';
      document.getElementById('productStock').value = productData.stock || productData.cantidad || '';
      document.getElementById('productRetornable').checked = productData.esRetornable == 1;
      
      document.getElementById('submitButtonText').textContent = 'Actualizar Producto';
    } else {
      // Modo creación
      this.editingProductId = null;
      title.textContent = 'Nuevo Producto';
      form.reset();
      document.getElementById('submitButtonText').textContent = 'Guardar Producto';
    }
    
    modal.classList.remove('hidden');
    
    // Enfocar el primer campo
    setTimeout(() => {
      document.getElementById('productDescription').focus();
    }, 100);
  }

  close() {
    const modal = document.getElementById('productModal');
    modal.classList.add('hidden');
    this.editingProductId = null;
    
    // Limpiar formulario
    document.getElementById('productForm').reset();
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const submitButtonText = document.getElementById('submitButtonText');
    const originalText = submitButtonText.textContent;
    
    // Mostrar loading
    submitButton.disabled = true;
    submitButtonText.textContent = 'Guardando...';
    
    try {
      const formData = new FormData(e.target);
      const productData = {
        descripcion: formData.get('descripcion').trim(),
        precio: parseFloat(formData.get('precio')),
        stock: parseInt(formData.get('stock')),
        esRetornable: formData.get('esRetornable') === 'on' ? 1 : 0
      };

      // Validaciones
      if (!productData.descripcion) {
        throw new Error('La descripción del producto es requerida');
      }
      if (productData.precio < 0) {
        throw new Error('El precio no puede ser negativo');
      }
      if (productData.stock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      const token = localStorage.getItem('token');
      let response;

      if (this.editingProductId) {
        // Actualizar producto existente
        response = await fetch(`/api/productos/${this.editingProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Crear nuevo producto
        response = await fetch('/api/productos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error guardando producto');
      }

      // Éxito
      this.close();
      
      // Recargar la lista de productos
      if (typeof loadProductos === 'function') {
        await loadProductos();
      }
      
      // Mostrar mensaje de éxito
      this.showSuccessMessage(this.editingProductId ? 'actualizado' : 'creado');
      
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
    message.textContent = `Producto ${action} correctamente`;
    
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

  setCurrentProducts(products) {
    this.currentProducts = products;
  }
}

// Crear instancia global
window.productModal = new ProductModal();
