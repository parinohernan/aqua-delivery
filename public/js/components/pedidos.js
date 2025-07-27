const PedidosComponent = {
    pedidos: [],
    filtros: { estado: '', fecha: '' },

    async render() {
        await this.loadPedidos();

        return `
            <div class="section fade-in">
                <div class="section-header">
                    <h2 class="section-title">
                        <i data-lucide="package"></i>
                        Gestión de Pedidos
                    </h2>
                    <button class="btn btn-primary" onclick="PedidosComponent.showForm()">
                        <i data-lucide="plus"></i>
                        Nuevo Pedido
                    </button>
                </div>

                <!-- Filtros modernos -->
                <div class="grid grid-cols-2 mb-6">
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select id="filtro-estado" class="form-select" onchange="PedidosComponent.filtrar()">
                            <option value="">Todos los estados</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="preparacion">En Preparación</option>
                            <option value="entregado">Entregados</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Fecha</label>
                        <input type="date" id="filtro-fecha" class="form-input" onchange="PedidosComponent.filtrar()" />
                    </div>
                </div>

                <!-- Estadísticas rápidas -->
                <div class="grid grid-cols-3 mb-6">
                    ${this.renderEstadisticas()}
                </div>

                <!-- Lista de pedidos -->
                <div id="lista-pedidos">
                    ${this.renderPedidos()}
                </div>
            </div>
        `;
    },

    async loadPedidos() {
        try {
            // Usar API real para cargar pedidos
            this.pedidos = await api.getPedidos(this.filtros);

        } catch (error) {
            ui.showToast('Error cargando pedidos: ' + error.message, 'error');
            this.pedidos = [];
        }
    },

    renderEstadisticas() {
        const pendientes = this.pedidos.filter(p => p.estado === 'pendiente').length;
        const preparacion = this.pedidos.filter(p => p.estado === 'preparacion').length;
        const entregados = this.pedidos.filter(p => p.estado === 'entregado').length;

        return `
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-warning-color">${pendientes}</div>
                    <div class="text-sm text-gray-600">Pendientes</div>
                </div>
            </div>
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-primary-color">${preparacion}</div>
                    <div class="text-sm text-gray-600">En Preparación</div>
                </div>
            </div>
            <div class="card text-center">
                <div class="card-body">
                    <div class="text-2xl font-bold text-secondary-color">${entregados}</div>
                    <div class="text-sm text-gray-600">Entregados</div>
                </div>
            </div>
        `;
    },

    renderPedidos() {
        let pedidos = this.pedidos;

        // Aplicar filtros
        if (this.filtros.estado) {
            pedidos = pedidos.filter(p => p.estado === this.filtros.estado);
        }

        if (this.filtros.fecha) {
            pedidos = pedidos.filter(p =>
                new Date(p.FechaPedido).toDateString() === new Date(this.filtros.fecha).toDateString()
            );
        }

        if (pedidos.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i data-lucide="package-x"></i>
                    </div>
                    <h3>No hay pedidos para mostrar</h3>
                    <p>No se encontraron pedidos con los filtros aplicados</p>
                </div>
            `;
        }

        return pedidos.map(pedido => `
            <div class="pedido-card ${this.mapEstadoClass(pedido.estado)} slide-up">
                <div class="pedido-card-header">
                    <div class="pedido-numero">#${pedido.codigo}</div>
                    <span class="pedido-estado ${this.mapEstadoClass(pedido.estado)}">
                        ${this.getEstadoTexto(pedido.estado)}
                    </span>
                </div>
                <div class="pedido-card-body">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="user" class="text-gray-500"></i>
                                <span class="font-semibold">${pedido.nombre} ${pedido.apellido}</span>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="map-pin" class="text-gray-500"></i>
                                <span class="text-sm text-gray-600">${pedido.direccion}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <i data-lucide="calendar" class="text-gray-500"></i>
                                <span class="text-sm text-gray-600">${ui.formatDate(pedido.FechaPedido)}</span>
                            </div>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="dollar-sign" class="text-gray-500"></i>
                                <span class="font-bold text-lg">${ui.formatCurrency(pedido.total)}</span>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <i data-lucide="credit-card" class="text-gray-500"></i>
                                <span class="text-sm text-gray-600">${this.getTipoPagoTexto(pedido.tipoPago)}</span>
                            </div>
                            ${pedido.zona ? `
                                <div class="flex items-center gap-2">
                                    <i data-lucide="map" class="text-gray-500"></i>
                                    <span class="text-sm text-gray-600">${pedido.zona}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="pedido-card-footer">
                    ${this.renderAcciones(pedido)}
                </div>
            </div>
        `).join('');
    },

    getEstadoTexto(estado) {
        const estados = {
            pendient: 'Pendiente',
            proceso: 'En Preparación',
            entregad: 'Entregado',
            pendiente: 'Pendiente',
            preparacion: 'En Preparación',
            entregado: 'Entregado'
        };
        return estados[estado] || estado;
    },

    mapEstadoClass(estado) {
        const mapping = {
            pendient: 'pendiente',
            proceso: 'preparacion',
            entregad: 'entregado'
        };
        return mapping[estado] || estado;
    },

    getTipoPagoTexto(tipo) {
        const tipos = {
            efectivo: 'Efectivo',
            cuenta_corriente: 'Cuenta Corriente',
            tarjeta: 'Tarjeta'
        };
        return tipos[tipo] || tipo;
    },

    renderAcciones(pedido) {
        const estado = pedido.estado;

        if (estado === 'pendient' || estado === 'pendiente') {
            return `
                <div class="flex gap-2">
                    <button class="btn btn-primary btn-sm" onclick="PedidosComponent.cambiarEstado(${pedido.codigo}, 'proceso')">
                        <i data-lucide="play"></i>
                        Preparar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="PedidosComponent.verDetalle(${pedido.codigo})">
                        <i data-lucide="eye"></i>
                        Ver
                    </button>
                </div>
            `;
        } else if (estado === 'proceso' || estado === 'preparacion') {
            return `
                <div class="flex gap-2">
                    <button class="btn btn-success btn-sm" onclick="PedidosComponent.entregar(${pedido.codigo})">
                        <i data-lucide="check"></i>
                        Entregar
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="PedidosComponent.verDetalle(${pedido.codigo})">
                        <i data-lucide="eye"></i>
                        Ver
                    </button>
                </div>
            `;
        } else {
            return `
                <button class="btn btn-secondary btn-sm" onclick="PedidosComponent.verDetalle(${pedido.codigo})">
                    <i data-lucide="eye"></i>
                    Ver Detalle
                </button>
            `;
        }
    },

    showForm() {
        const formContent = `
            <div class="form-group">
                <label class="form-label">Cliente</label>
                <select name="clienteId" class="form-select" required>
                    <option value="">Seleccionar cliente</option>
                    <option value="1">Juan Pérez</option>
                    <option value="2">María González</option>
                    <option value="3">Carlos López</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Tipo de Pago</label>
                <select name="tipoPago" class="form-select" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="cuenta_corriente">Cuenta Corriente</option>
                    <option value="tarjeta">Tarjeta</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Observaciones</label>
                <textarea name="observaciones" class="form-textarea" placeholder="Observaciones adicionales..."></textarea>
            </div>
        `;

        const actions = [
            {
                text: 'Cancelar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            },
            {
                text: 'Crear Pedido',
                class: 'btn-primary',
                icon: 'plus',
                onclick: 'PedidosComponent.crear()'
            }
        ];

        ui.showModal('Nuevo Pedido', formContent, actions);
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

            ui.showLoading('Creando pedido...');

            // Crear pedido usando la API real
            const nuevoPedido = {
                clienteId: parseInt(formData.get('clienteId')),
                tipoPago: formData.get('tipoPago'),
                observaciones: formData.get('observaciones') || ''
            };

            await api.createPedido(nuevoPedido);

            ui.hideLoading();
            ui.closeModal();
            ui.showToast('Pedido creado exitosamente', 'success');

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al crear pedido: ' + error.message, 'error');
        }
    },

    async cambiarEstado(id, nuevoEstado) {
        try {
            ui.showLoading('Actualizando estado...');

            // Actualizar estado usando la API real
            await api.updatePedidoEstado(id, nuevoEstado);

            ui.hideLoading();
            ui.showToast('Estado actualizado correctamente', 'success');

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al cambiar estado: ' + error.message, 'error');
        }
    },

    async entregar(id) {
        ui.showConfirm(
            'Confirmar Entrega',
            '¿Está seguro que desea marcar este pedido como entregado?',
            `PedidosComponent.cambiarEstado(${id}, 'entregad')`
        );
    },

    async verDetalle(id) {
        const pedido = this.pedidos.find(p => p.codigo === id);
        if (!pedido) return;

        const detalleContent = `
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <h4 class="font-semibold mb-2">Información del Cliente</h4>
                    <p><strong>Nombre:</strong> ${pedido.nombre} ${pedido.apellido}</p>
                    <p><strong>Dirección:</strong> ${pedido.direccion}</p>
                    ${pedido.zona ? `<p><strong>Zona:</strong> ${pedido.zona}</p>` : ''}
                </div>
                <div>
                    <h4 class="font-semibold mb-2">Información del Pedido</h4>
                    <p><strong>Fecha:</strong> ${ui.formatDate(pedido.FechaPedido)}</p>
                    <p><strong>Total:</strong> ${ui.formatCurrency(pedido.total)}</p>
                    <p><strong>Pago:</strong> ${this.getTipoPagoTexto(pedido.tipoPago)}</p>
                    <p><strong>Estado:</strong> <span class="pedido-estado ${pedido.estado}">${this.getEstadoTexto(pedido.estado)}</span></p>
                </div>
            </div>
        `;

        ui.showModal(`Pedido #${pedido.codigo}`, detalleContent, [
            {
                text: 'Cerrar',
                class: 'btn-secondary',
                onclick: 'ui.closeModal()'
            }
        ]);
    },

    async filtrar() {
        this.filtros.estado = document.getElementById('filtro-estado').value;
        this.filtros.fecha = document.getElementById('filtro-fecha').value;

        document.getElementById('lista-pedidos').innerHTML = this.renderPedidos();

        // Reinicializar iconos después de actualizar el DOM
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    async refresh() {
        await this.loadPedidos();
        document.getElementById('lista-pedidos').innerHTML = this.renderPedidos();

        // Reinicializar iconos después de actualizar el DOM
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};
