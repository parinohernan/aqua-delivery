const ClientesComponent = {
    clientes: [],
    
    async render() {
        await this.loadClientes();
        
        return `
            <div class="section fade-in">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="users"></i>
                        Gestión de Clientes
                    </h2>
                    <button class="btn btn-primary" onclick="ClientesComponent.showForm()">
                        <i data-lucide="user-plus"></i>
                        Nuevo Cliente
                    </button>
                </div>
                
                <!-- Buscador -->
                <div class="mb-6">
                    <div class="form-group">
                        <label class="form-label">Buscar cliente</label>
                        <input type="text" id="buscar-cliente" class="form-input" 
                               placeholder="Buscar por nombre, apellido o teléfono..."
                               oninput="ClientesComponent.buscar()">
                    </div>
                </div>
                
                <!-- Lista de clientes -->
                <div id="lista-clientes">
                    ${this.renderClientes()}
                </div>
            </div>
        `;
    },

    async loadClientes() {
        try {
            // Cargar clientes desde la API real
            this.clientes = await api.getClientes();
        } catch (error) {
            ui.showToast('Error cargando clientes: ' + error.message, 'error');
            this.clientes = [];
        }
    },

    renderClientes() {
        if (this.clientes.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="users"></i>
                    </div>
                    <h3>No hay clientes registrados</h3>
                    <p>Comienza agregando tu primer cliente</p>
                    <button class="btn btn-primary mt-4" onclick="ClientesComponent.showForm()">
                        <i data-lucide="user-plus"></i>
                        Agregar Cliente
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 gap-4">
                ${this.clientes.map(cliente => `
                    <div class="card slide-up">
                        <div class="card-body">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-semibold">${cliente.nombre} ${cliente.apellido}</h3>
                                    <p class="text-gray-600">${cliente.descripcion || 'Sin descripción'}</p>
                                </div>
                                <div class="flex gap-2">
                                    <button class="btn btn-secondary btn-sm" onclick="ClientesComponent.editar(${cliente.codigo})">
                                        <i data-lucide="edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="ClientesComponent.eliminar(${cliente.codigo})">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="phone" class="text-gray-500"></i>
                                    <span class="text-sm">${cliente.telefono}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="map-pin" class="text-gray-500"></i>
                                    <span class="text-sm">${cliente.direccion}</span>
                                </div>
                                ${cliente.zona ? `
                                <div class="flex items-center gap-2">
                                    <i data-lucide="map" class="text-gray-500"></i>
                                    <span class="text-sm">Zona: ${cliente.zona}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    showForm(cliente = null) {
        const isEdit = cliente !== null;
        const title = isEdit ? 'Editar Cliente' : 'Nuevo Cliente';
        
        const formContent = `
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" name="nombre" class="form-input" required 
                       value="${isEdit ? cliente.nombre : ''}" placeholder="Nombre del cliente">
            </div>
            
            <div class="form-group">
                <label class="form-label">Apellido</label>
                <input type="text" name="apellido" class="form-input" required 
                       value="${isEdit ? cliente.apellido : ''}" placeholder="Apellido del cliente">
            </div>
            
            <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" name="telefono" class="form-input" required 
                       value="${isEdit ? cliente.telefono : ''}" placeholder="+54 9 11 1234-5678">
            </div>
            
            <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" name="direccion" class="form-input" required 
                       value="${isEdit ? cliente.direccion : ''}" placeholder="Dirección completa">
            </div>
            
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea name="descripcion" class="form-textarea" 
                          placeholder="Información adicional del cliente...">${isEdit ? cliente.descripcion || '' : ''}</textarea>
            </div>
        `;

        const actions = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            },
            {
                text: isEdit ? 'Actualizar' : 'Crear Cliente',
                class: 'btn-primary',
                icon: isEdit ? 'save' : 'user-plus',
                onclick: isEdit ? `ClientesComponent.actualizar(${cliente.codigo})` : 'ClientesComponent.crear()'
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

            ui.showLoading('Creando cliente...');

            // Crear cliente usando la API real
            const nuevoCliente = {
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                telefono: formData.get('telefono'),
                direccion: formData.get('direccion'),
                descripcion: formData.get('descripcion')
            };

            await api.createCliente(nuevoCliente);

            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Cliente creado exitosamente', 'success');

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al crear cliente: ' + error.message, 'error');
        }
    },

    async editar(id) {
        const cliente = this.clientes.find(c => c.codigo === id);
        if (cliente) {
            this.showForm(cliente);
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

            ui.showLoading('Actualizando cliente...');

            // Actualizar cliente usando la API real
            const clienteActualizado = {
                nombre: formData.get('nombre'),
                apellido: formData.get('apellido'),
                telefono: formData.get('telefono'),
                direccion: formData.get('direccion'),
                descripcion: formData.get('descripcion')
            };

            await api.updateCliente(id, clienteActualizado);

            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Cliente actualizado exitosamente', 'success');

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al actualizar cliente: ' + error.message, 'error');
        }
    },

    async eliminar(id) {
        const cliente = this.clientes.find(c => c.codigo === id);
        if (!cliente) return;

        ui.showConfirm(
            'Eliminar Cliente',
            `¿Está seguro que desea eliminar a ${cliente.nombre} ${cliente.apellido}?`,
            `ClientesComponent.confirmarEliminacion(${id})`
        );
    },

    async confirmarEliminacion(id) {
        try {
            const loading = ui.showLoading('Eliminando cliente...');
            
            // Simular eliminación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Eliminar de la lista local
            this.clientes = this.clientes.filter(c => c.codigo !== id);
            
            ui.hideLoading();
            ui.showToast('Cliente eliminado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al eliminar cliente: ' + error.message, 'error');
        }
    },

    buscar() {
        const termino = document.getElementById('buscar-cliente').value.toLowerCase();
        
        if (!termino) {
            document.getElementById('lista-clientes').innerHTML = this.renderClientes();
        } else {
            const clientesFiltrados = this.clientes.filter(cliente => 
                cliente.nombre.toLowerCase().includes(termino) ||
                cliente.apellido.toLowerCase().includes(termino) ||
                cliente.telefono.toLowerCase().includes(termino) ||
                cliente.direccion.toLowerCase().includes(termino)
            );
            
            // Temporalmente cambiar la lista para el render
            const clientesOriginales = this.clientes;
            this.clientes = clientesFiltrados;
            document.getElementById('lista-clientes').innerHTML = this.renderClientes();
            this.clientes = clientesOriginales;
        }
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    async refresh() {
        document.getElementById('lista-clientes').innerHTML = this.renderClientes();
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};
