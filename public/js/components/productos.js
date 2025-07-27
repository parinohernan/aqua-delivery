const ProductosComponent = {
    productos: [],
    
    async render() {
        await this.loadProductos();
        
        return `
            <div class="section fade-in">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="tag"></i>
                        Gestión de Productos
                    </h2>
                    <button class="btn btn-primary" onclick="ProductosComponent.showForm()">
                        <i data-lucide="plus"></i>
                        Nuevo Producto
                    </button>
                </div>
                
                <!-- Filtros -->
                <div class="grid grid-cols-2 mb-6">
                    <div class="form-group">
                        <label class="form-label">Buscar producto</label>
                        <input type="text" id="buscar-producto" class="form-input" 
                               placeholder="Buscar por nombre o descripción..."
                               oninput="ProductosComponent.buscar()">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Ordenar por</label>
                        <select id="ordenar-productos" class="form-select" onchange="ProductosComponent.ordenar()">
                            <option value="nombre">Nombre</option>
                            <option value="precio">Precio</option>
                            <option value="stock">Stock</option>
                        </select>
                    </div>
                </div>
                
                <!-- Lista de productos -->
                <div id="lista-productos">
                    ${this.renderProductos()}
                </div>
            </div>
        `;
    },

    async loadProductos() {
        try {
            // Simular datos de productos
            this.productos = [
                {
                    codigo: 1,
                    nombre: 'Bidón 20L',
                    descripcion: 'Bidón de agua purificada de 20 litros',
                    precio: 1500,
                    stock: 50,
                    activo: 1
                },
                {
                    codigo: 2,
                    nombre: 'Bidón 12L',
                    descripcion: 'Bidón de agua purificada de 12 litros',
                    precio: 1000,
                    stock: 30,
                    activo: 1
                },
                {
                    codigo: 3,
                    nombre: 'Botella 2L',
                    descripcion: 'Botella de agua mineral de 2 litros',
                    precio: 300,
                    stock: 100,
                    activo: 1
                },
                {
                    codigo: 4,
                    nombre: 'Botella 500ml',
                    descripcion: 'Botella de agua mineral de 500ml',
                    precio: 150,
                    stock: 200,
                    activo: 1
                }
            ];
        } catch (error) {
            ui.showToast('Error cargando productos: ' + error.message, 'error');
            this.productos = [];
        }
    },

    renderProductos() {
        if (this.productos.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="package"></i>
                    </div>
                    <h3>No hay productos registrados</h3>
                    <p>Comienza agregando tu primer producto</p>
                    <button class="btn btn-primary mt-4" onclick="ProductosComponent.showForm()">
                        <i data-lucide="plus"></i>
                        Agregar Producto
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-2 gap-4">
                ${this.productos.map(producto => `
                    <div class="card slide-up">
                        <div class="card-body">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-semibold">${producto.nombre}</h3>
                                    <p class="text-gray-600 text-sm">${producto.descripcion}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button class="btn btn-secondary btn-sm" onclick="ProductosComponent.editar(${producto.codigo})">
                                        <i data-lucide="edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="ProductosComponent.eliminar(${producto.codigo})">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="dollar-sign" class="text-gray-500"></i>
                                    <span class="font-bold text-lg">${ui.formatCurrency(producto.precio)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="package" class="text-gray-500"></i>
                                    <span class="text-sm ${producto.stock < 10 ? 'text-danger-color font-semibold' : ''}">${producto.stock} unidades</span>
                                </div>
                            </div>
                            
                            ${producto.stock < 10 ? `
                                <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                    <i data-lucide="alert-triangle" class="inline mr-1"></i>
                                    Stock bajo
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showForm(producto = null) {
        const isEdit = producto !== null;
        const title = isEdit ? 'Editar Producto' : 'Nuevo Producto';
        
        const formContent = `
            <div class="form-group">
                <label class="form-label">Nombre del producto</label>
                <input type="text" name="nombre" class="form-input" required 
                       value="${isEdit ? producto.nombre : ''}" placeholder="Ej: Bidón 20L">
            </div>
            
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea name="descripcion" class="form-textarea" required
                          placeholder="Descripción detallada del producto...">${isEdit ? producto.descripcion || '' : ''}</textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Precio</label>
                    <input type="number" name="precio" class="form-input" required min="0" step="0.01"
                           value="${isEdit ? producto.precio : ''}" placeholder="0.00">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Stock inicial</label>
                    <input type="number" name="stock" class="form-input" required min="0"
                           value="${isEdit ? producto.stock : ''}" placeholder="0">
                </div>
            </div>
        `;

        const actions = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            },
            {
                text: isEdit ? 'Actualizar' : 'Crear Producto',
                class: 'btn-primary',
                icon: isEdit ? 'save' : 'plus',
                onclick: isEdit ? `ProductosComponent.actualizar(${producto.codigo})` : 'ProductosComponent.crear()'
            }
        ];

        ui.showModal(title, formContent, actions);
    },

    async crear() {
        try {
            const modal = document.getElementById('current-modal');
            const formData = new FormData();
            
            // Obtener datos del formulario
            const inputs = modal.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                formData.append(input.name, input.value);
            });

            const loading = ui.showLoading('Creando producto...');
            
            // Simular creación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Agregar a la lista local
            const nuevoProducto = {
                codigo: this.productos.length + 1,
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion'),
                precio: parseFloat(formData.get('precio')),
                stock: parseInt(formData.get('stock')),
                activo: 1
            };
            
            this.productos.push(nuevoProducto);
            
            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Producto creado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al crear producto: ' + error.message, 'error');
        }
    },

    async editar(id) {
        const producto = this.productos.find(p => p.codigo === id);
        if (producto) {
            this.showForm(producto);
        }
    },

    async actualizar(id) {
        try {
            const modal = document.getElementById('current-modal');
            const formData = new FormData();
            
            // Obtener datos del formulario
            const inputs = modal.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                formData.append(input.name, input.value);
            });

            const loading = ui.showLoading('Actualizando producto...');
            
            // Simular actualización
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Actualizar en la lista local
            const productoIndex = this.productos.findIndex(p => p.codigo === id);
            if (productoIndex !== -1) {
                this.productos[productoIndex] = {
                    ...this.productos[productoIndex],
                    nombre: formData.get('nombre'),
                    descripcion: formData.get('descripcion'),
                    precio: parseFloat(formData.get('precio')),
                    stock: parseInt(formData.get('stock'))
                };
            }
            
            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Producto actualizado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al actualizar producto: ' + error.message, 'error');
        }
    },

    async eliminar(id) {
        const producto = this.productos.find(p => p.codigo === id);
        if (!producto) return;

        ui.showConfirm(
            'Eliminar Producto',
            `¿Está seguro que desea eliminar "${producto.nombre}"?`,
            `ProductosComponent.confirmarEliminacion(${id})`
        );
    },

    async confirmarEliminacion(id) {
        try {
            const loading = ui.showLoading('Eliminando producto...');
            
            // Simular eliminación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Eliminar de la lista local
            this.productos = this.productos.filter(p => p.codigo !== id);
            
            ui.hideLoading();
            ui.showToast('Producto eliminado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al eliminar producto: ' + error.message, 'error');
        }
    },

    buscar() {
        const termino = document.getElementById('buscar-producto').value.toLowerCase();
        this.renderFiltrados(termino);
    },

    ordenar() {
        const criterio = document.getElementById('ordenar-productos').value;
        
        const productosOrdenados = [...this.productos].sort((a, b) => {
            switch (criterio) {
                case 'precio':
                    return a.precio - b.precio;
                case 'stock':
                    return a.stock - b.stock;
                default: // nombre
                    return a.nombre.localeCompare(b.nombre);
            }
        });
        
        // Temporalmente cambiar la lista para el render
        const productosOriginales = this.productos;
        this.productos = productosOrdenados;
        document.getElementById('lista-productos').innerHTML = this.renderProductos();
        this.productos = productosOriginales;
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    renderFiltrados(termino = '') {
        let productosFiltrados = this.productos;
        
        if (termino) {
            productosFiltrados = this.productos.filter(producto => 
                producto.nombre.toLowerCase().includes(termino) ||
                producto.descripcion.toLowerCase().includes(termino)
            );
        }
        
        // Temporalmente cambiar la lista para el render
        const productosOriginales = this.productos;
        this.productos = productosFiltrados;
        document.getElementById('lista-productos').innerHTML = this.renderProductos();
        this.productos = productosOriginales;
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    async refresh() {
        document.getElementById('lista-productos').innerHTML = this.renderProductos();
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};
