const PagosComponent = {
    pagos: [],
    
    async render() {
        await this.loadPagos();
        
        return `
            <div class="section fade-in">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="credit-card"></i>
                        Gestión de Pagos
                    </h2>
                    <button class="btn btn-primary" onclick="PagosComponent.showForm()">
                        <i data-lucide="plus"></i>
                        Registrar Pago
                    </button>
                </div>
                
                <!-- Resumen de pagos -->
                <div class="grid grid-cols-3 mb-6">
                    ${this.renderResumen()}
                </div>
                
                <!-- Filtros -->
                <div class="grid grid-cols-3 mb-6">
                    <div class="form-group">
                        <label class="form-label">Método de pago</label>
                        <select id="filtro-metodo" class="form-select" onchange="PagosComponent.filtrar()">
                            <option value="">Todos los métodos</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Fecha desde</label>
                        <input type="date" id="filtro-fecha-desde" class="form-input" onchange="PagosComponent.filtrar()">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Fecha hasta</label>
                        <input type="date" id="filtro-fecha-hasta" class="form-input" onchange="PagosComponent.filtrar()">
                    </div>
                </div>
                
                <!-- Lista de pagos -->
                <div id="lista-pagos">
                    ${this.renderPagos()}
                </div>
            </div>
        `;
    },

    async loadPagos() {
        try {
            // Simular datos de pagos
            this.pagos = [
                {
                    codigo: 1,
                    pedidoId: 1,
                    numeroPedido: '001',
                    clienteNombre: 'Juan',
                    clienteApellido: 'Pérez',
                    monto: 2500,
                    metodoPago: 'efectivo',
                    fechaPago: new Date().toISOString(),
                    observaciones: 'Pago completo'
                },
                {
                    codigo: 2,
                    pedidoId: 2,
                    numeroPedido: '002',
                    clienteNombre: 'María',
                    clienteApellido: 'González',
                    monto: 1800,
                    metodoPago: 'transferencia',
                    fechaPago: new Date(Date.now() - 86400000).toISOString(),
                    observaciones: 'Transferencia bancaria'
                },
                {
                    codigo: 3,
                    pedidoId: 3,
                    numeroPedido: '003',
                    clienteNombre: 'Carlos',
                    clienteApellido: 'López',
                    monto: 3200,
                    metodoPago: 'tarjeta',
                    fechaPago: new Date(Date.now() - 172800000).toISOString(),
                    observaciones: 'Pago con tarjeta de débito'
                }
            ];
        } catch (error) {
            ui.showToast('Error cargando pagos: ' + error.message, 'error');
            this.pagos = [];
        }
    },

    renderResumen() {
        const totalPagos = this.pagos.reduce((sum, pago) => sum + pago.monto, 0);
        const pagosHoy = this.pagos.filter(pago => {
            const fechaPago = new Date(pago.fechaPago);
            const hoy = new Date();
            return fechaPago.toDateString() === hoy.toDateString();
        });
        const totalHoy = pagosHoy.reduce((sum, pago) => sum + pago.monto, 0);
        
        return `
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-primary-color">${this.pagos.length}</div>
                    <div class="text-sm text-gray-600">Total Pagos</div>
                </div>
            </div>
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-secondary-color">${ui.formatCurrency(totalHoy)}</div>
                    <div class="text-sm text-gray-600">Cobrado Hoy</div>
                </div>
            </div>
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-gray-900">${ui.formatCurrency(totalPagos)}</div>
                    <div class="text-sm text-gray-600">Total General</div>
                </div>
            </div>
        `;
    },

    renderPagos() {
        if (this.pagos.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="credit-card"></i>
                    </div>
                    <h3>No hay pagos registrados</h3>
                    <p>Los pagos aparecerán aquí una vez que los registres</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 gap-4">
                ${this.pagos.map(pago => `
                    <div class="card slide-up">
                        <div class="card-body">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-semibold">Pedido #${pago.numeroPedido}</h3>
                                    <p class="text-gray-600">${pago.clienteNombre} ${pago.clienteApellido}</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-secondary-color">${ui.formatCurrency(pago.monto)}</div>
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${this.getMetodoClass(pago.metodoPago)}">
                                        ${this.getMetodoTexto(pago.metodoPago)}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 mb-3">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="calendar" class="text-gray-500"></i>
                                    <span class="text-sm">${ui.formatDate(pago.fechaPago)}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="credit-card" class="text-gray-500"></i>
                                    <span class="text-sm">${this.getMetodoTexto(pago.metodoPago)}</span>
                                </div>
                            </div>
                            
                            ${pago.observaciones ? `
                                <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                                    <i data-lucide="message-circle" class="inline mr-1"></i>
                                    ${pago.observaciones}
                                </div>
                            ` : ''}
                            
                            <div class="flex justify-end gap-2 mt-4">
                                <button class="btn btn-secondary btn-sm" onclick="PagosComponent.verDetalle(${pago.codigo})">
                                    <i data-lucide="eye"></i>
                                    Ver
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="PagosComponent.editar(${pago.codigo})">
                                    <i data-lucide="edit"></i>
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getMetodoTexto(metodo) {
        const metodos = {
            efectivo: 'Efectivo',
            transferencia: 'Transferencia',
            tarjeta: 'Tarjeta'
        };
        return metodos[metodo] || metodo;
    },

    getMetodoClass(metodo) {
        const clases = {
            efectivo: 'bg-green-100 text-green-800',
            transferencia: 'bg-blue-100 text-blue-800',
            tarjeta: 'bg-purple-100 text-purple-800'
        };
        return clases[metodo] || 'bg-gray-100 text-gray-800';
    },

    showForm(pago = null) {
        const isEdit = pago !== null;
        const title = isEdit ? 'Editar Pago' : 'Registrar Nuevo Pago';
        
        const formContent = `
            <div class="form-group">
                <label class="form-label">Pedido</label>
                <select name="pedidoId" class="form-select" required ${isEdit ? 'disabled' : ''}>
                    <option value="">Seleccionar pedido</option>
                    <option value="1" ${isEdit && pago.pedidoId === 1 ? 'selected' : ''}>Pedido #001 - Juan Pérez</option>
                    <option value="2" ${isEdit && pago.pedidoId === 2 ? 'selected' : ''}>Pedido #002 - María González</option>
                    <option value="3" ${isEdit && pago.pedidoId === 3 ? 'selected' : ''}>Pedido #003 - Carlos López</option>
                </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                    <label class="form-label">Monto</label>
                    <input type="number" name="monto" class="form-input" required min="0" step="0.01"
                           value="${isEdit ? pago.monto : ''}" placeholder="0.00">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Método de pago</label>
                    <select name="metodoPago" class="form-select" required>
                        <option value="">Seleccionar método</option>
                        <option value="efectivo" ${isEdit && pago.metodoPago === 'efectivo' ? 'selected' : ''}>Efectivo</option>
                        <option value="transferencia" ${isEdit && pago.metodoPago === 'transferencia' ? 'selected' : ''}>Transferencia</option>
                        <option value="tarjeta" ${isEdit && pago.metodoPago === 'tarjeta' ? 'selected' : ''}>Tarjeta</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Observaciones</label>
                <textarea name="observaciones" class="form-textarea" 
                          placeholder="Información adicional sobre el pago...">${isEdit ? pago.observaciones || '' : ''}</textarea>
            </div>
        `;

        const actions = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            },
            {
                text: isEdit ? 'Actualizar' : 'Registrar Pago',
                class: 'btn-primary',
                icon: isEdit ? 'save' : 'plus',
                onclick: isEdit ? `PagosComponent.actualizar(${pago.codigo})` : 'PagosComponent.crear()'
            }
        ];

        ui.showModal(title, formContent, actions);
    },

    async crear() {
        try {
            const modal = document.getElementById('current-modal');
            const formData = new FormData();
            
            // Obtener datos del formulario
            const inputs = modal.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                formData.append(input.name, input.value);
            });

            const loading = ui.showLoading('Registrando pago...');
            
            // Simular creación
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Agregar a la lista local
            const nuevoPago = {
                codigo: this.pagos.length + 1,
                pedidoId: parseInt(formData.get('pedidoId')),
                numeroPedido: String(formData.get('pedidoId')).padStart(3, '0'),
                clienteNombre: 'Cliente',
                clienteApellido: 'Demo',
                monto: parseFloat(formData.get('monto')),
                metodoPago: formData.get('metodoPago'),
                fechaPago: new Date().toISOString(),
                observaciones: formData.get('observaciones')
            };
            
            this.pagos.unshift(nuevoPago); // Agregar al inicio
            
            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Pago registrado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al registrar pago: ' + error.message, 'error');
        }
    },

    async editar(id) {
        const pago = this.pagos.find(p => p.codigo === id);
        if (pago) {
            this.showForm(pago);
        }
    },

    async actualizar(id) {
        try {
            const modal = document.getElementById('current-modal');
            const formData = new FormData();
            
            // Obtener datos del formulario
            const inputs = modal.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                formData.append(input.name, input.value);
            });

            const loading = ui.showLoading('Actualizando pago...');
            
            // Simular actualización
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Actualizar en la lista local
            const pagoIndex = this.pagos.findIndex(p => p.codigo === id);
            if (pagoIndex !== -1) {
                this.pagos[pagoIndex] = {
                    ...this.pagos[pagoIndex],
                    monto: parseFloat(formData.get('monto')),
                    metodoPago: formData.get('metodoPago'),
                    observaciones: formData.get('observaciones')
                };
            }
            
            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Pago actualizado exitosamente', 'success');
            
            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al actualizar pago: ' + error.message, 'error');
        }
    },

    async verDetalle(id) {
        const pago = this.pagos.find(p => p.codigo === id);
        if (!pago) return;

        const detalleContent = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold mb-2">Información del Pago</h4>
                    <p><strong>Pedido:</strong> #${pago.numeroPedido}</p>
                    <p><strong>Cliente:</strong> ${pago.clienteNombre} ${pago.clienteApellido}</p>
                    <p><strong>Monto:</strong> ${ui.formatCurrency(pago.monto)}</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Detalles</h4>
                    <p><strong>Método:</strong> ${this.getMetodoTexto(pago.metodoPago)}</p>
                    <p><strong>Fecha:</strong> ${ui.formatDate(pago.fechaPago)}</p>
                    ${pago.observaciones ? `<p><strong>Observaciones:</strong> ${pago.observaciones}</p>` : ''}
                </div>
            </div>
        `;

        ui.showModal(`Pago #${pago.codigo}`, detalleContent, [
            {
                text: 'Cerrar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            }
        ]);
    },

    filtrar() {
        // Implementar filtrado por método y fechas
        this.refresh();
    },

    async refresh() {
        // Actualizar resumen
        const resumenContainer = document.querySelector('.grid.grid-cols-3');
        if (resumenContainer) {
            resumenContainer.innerHTML = this.renderResumen();
        }
        
        // Actualizar lista
        document.getElementById('lista-pagos').innerHTML = this.renderPagos();
        
        // Reinicializar iconos
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};
