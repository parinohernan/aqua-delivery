const PedidosComponent = {
    pedidos: [],
    zonas: [],
    tiposPago: [],
    filtros: { fecha: '', zona: '', search: '' },

    // Helper para convertir el campo aplicaSaldo de MySQL bit(1)
    convertirAplicaSaldo(aplicaSaldo) {
        return aplicaSaldo === 1 || aplicaSaldo === true ||
               (aplicaSaldo && aplicaSaldo[0] === 1);
    },

    // Configurar listeners de eventos para actualización reactiva
    setupEventListeners() {
        if (window.eventBus && window.EVENTS) {
            // Escuchar cuando se crea un nuevo pedido
            window.eventBus.on(window.EVENTS.PEDIDO_CREATED, (data) => {
                console.log('📦 Nuevo pedido creado, actualizando lista...', data);
                this.handlePedidoCreated(data);
            });

            // Escuchar cuando se actualiza un pedido
            window.eventBus.on(window.EVENTS.PEDIDO_UPDATED, (data) => {
                console.log('📦 Pedido actualizado, actualizando lista...', data);
                this.handlePedidoUpdated(data);
            });

            console.log('📡 Event listeners configurados para PedidosComponent');
        }
    },

    // Manejar creación de nuevo pedido
    async handlePedidoCreated(data) {
        try {
            console.log('🔄 Iniciando actualización de lista de pedidos...', data);

            // Recargar la lista completa para asegurar consistencia
            await this.loadPedidos();
            console.log('✅ Pedidos recargados, total:', this.pedidos.length);

            // Actualizar la vista
            const listContainer = document.getElementById('lista-pedidos');
            console.log('📋 Contenedor lista-pedidos:', listContainer ? 'encontrado' : 'NO ENCONTRADO');

            if (listContainer) {
                const newHTML = this.renderPedidos();
                listContainer.innerHTML = newHTML;
                console.log('🎨 Vista actualizada con nuevo HTML');

                // Reinicializar iconos
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                    console.log('🎯 Iconos reinicializados');
                }
            } else {
                console.warn('⚠️ No se encontró el contenedor lista-pedidos, intentando actualizar toda la vista...');
                // Si no encuentra el contenedor específico, intentar actualizar toda la vista
                await this.refresh();
            }

            // Mostrar notificación
            if (typeof ui !== 'undefined' && data.cliente) {
                ui.showToast(`Nuevo pedido creado para ${data.cliente.nombre}`, 'success');
            }
        } catch (error) {
            console.error('❌ Error actualizando lista de pedidos:', error);
        }
    },

    // Manejar actualización de pedido
    async handlePedidoUpdated(data) {
        try {
            // Recargar la lista completa
            await this.loadPedidos();

            // Actualizar la vista
            const listContainer = document.getElementById('lista-pedidos');
            if (listContainer) {
                listContainer.innerHTML = this.renderPedidos();

                // Reinicializar iconos
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        } catch (error) {
            console.error('Error actualizando lista de pedidos:', error);
        }
    },

    async render() {
        await this.loadZonas();
        await this.loadTiposPago();
        await this.loadPedidos();

        // Configurar listeners de eventos para actualización reactiva
        this.setupEventListeners();

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
                <div class="bg-white p-4 rounded-lg shadow-sm border mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800">Filtros de Búsqueda - Pedidos Pendientes</h3>
                        <button class="btn btn-secondary btn-sm" onclick="PedidosComponent.limpiarFiltros()">
                            <i data-lucide="x"></i>
                            Limpiar Filtros
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <input type="date" id="filtro-fecha" class="form-input" onchange="PedidosComponent.filtrar()" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Zona/Ruta</label>
                            <select id="filtro-zona" class="form-select" onchange="PedidosComponent.filtrar()">
                                <option value="">Todas las zonas</option>
                                ${this.zonas.map(zona => `<option value="${zona.zona || zona.nombre}">${zona.zona || zona.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Buscar Cliente</label>
                            <input type="text" id="filtro-search" class="form-input" placeholder="Nombre o apellido..." onchange="PedidosComponent.filtrar()" oninput="PedidosComponent.debounceSearch()" />
                        </div>
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

    async loadZonas() {
        try {
            this.zonas = await api.getZonas();
        } catch (error) {
            console.error('Error cargando zonas:', error);
            this.zonas = [];
        }
    },

    async loadTiposPago() {
        try {
            this.tiposPago = await api.getTiposPago();
        } catch (error) {
            console.error('Error cargando tipos de pago:', error);
            this.tiposPago = [];
        }
    },

    async loadPedidos() {
        try {
            // Filtrar parámetros vacíos antes de enviar al backend
            const filtrosLimpios = {};
            Object.keys(this.filtros).forEach(key => {
                if (this.filtros[key] && this.filtros[key].trim() !== '') {
                    filtrosLimpios[key] = this.filtros[key];
                }
            });

            // Usar API real para cargar pedidos con filtros del backend
            this.pedidos = await api.getPedidos(filtrosLimpios);

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
        const pedidos = this.pedidos;

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

            // Emitir evento de pedido actualizado
            if (window.eventBus && window.EVENTS) {
                window.eventBus.emit(window.EVENTS.PEDIDO_UPDATED, {
                    pedidoId: id,
                    nuevoEstado: nuevoEstado
                });
            }

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al cambiar estado: ' + error.message, 'error');
        }
    },

    async entregar(id) {
        // Mostrar modal de entrega para capturar tipo de pago
        this.mostrarModalEntrega(id);
    },

    mostrarModalEntrega(id) {
        const pedido = this.pedidos.find(p => p.id === id || p.codigo === id);
        if (!pedido) return;

        // Generar opciones de tipos de pago
        const opcionesTipoPago = this.tiposPago.map(tipo => {
            const aplicaSaldo = this.convertirAplicaSaldo(tipo.aplicaSaldo);
            return `<option value="${tipo.id}">${tipo.pago}${aplicaSaldo ? ' (Aplica saldo)' : ''}</option>`;
        }).join('');

        const modalContent = `
            <form id="entregaForm" onsubmit="PedidosComponent.procesarEntrega(event, ${id})">
                <div class="form-group">
                    <label class="form-label">Tipo de Pago *</label>
                    <select id="tipoPagoSelect" name="tipoPago" required class="form-select" onchange="PedidosComponent.actualizarInfoTipoPago()">
                        <option value="">Seleccionar tipo de pago...</option>
                        ${opcionesTipoPago}
                    </select>
                </div>

                <div id="infoTipoPago" class="bg-blue-50 p-3 rounded-lg mb-4" style="display: none;">
                    <p class="text-sm text-blue-800">
                        <strong>Nota:</strong> <span id="textoInfoTipoPago"></span>
                    </p>
                </div>

                <div class="flex justify-end gap-2">
                    <button type="button" onclick="ui.closeModal()" class="btn btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-success">
                        <i data-lucide="check"></i>
                        Confirmar Entrega
                    </button>
                </div>
            </form>
        `;

        ui.showModal('🚚 Entregar Pedido', modalContent);
    },

    actualizarInfoTipoPago() {
        const tipoPagoId = document.getElementById('tipoPagoSelect').value;
        const infoDiv = document.getElementById('infoTipoPago');
        const textoInfo = document.getElementById('textoInfoTipoPago');

        if (!tipoPagoId) {
            infoDiv.style.display = 'none';
            return;
        }

        const tipoPago = this.tiposPago.find(t => t.id == tipoPagoId);
        if (tipoPago) {
            const aplicaSaldo = this.convertirAplicaSaldo(tipoPago.aplicaSaldo);

            if (aplicaSaldo) {
                textoInfo.textContent = 'Este tipo de pago agregará el importe total al saldo del cliente.';
                infoDiv.className = 'bg-blue-50 p-3 rounded-lg mb-4';
            } else {
                textoInfo.textContent = 'Este es un pago inmediato, no se agregará saldo al cliente.';
                infoDiv.className = 'bg-green-50 p-3 rounded-lg mb-4';
            }
            infoDiv.style.display = 'block';
        }
    },

    async procesarEntrega(event, id) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const tipoPagoId = formData.get('tipoPago');

        if (!tipoPagoId) {
            ui.showToast('Debe seleccionar un tipo de pago', 'error');
            return;
        }

        try {
            ui.showLoading('Procesando entrega...');

            // Obtener información del tipo de pago seleccionado
            const tipoPago = this.tiposPago.find(t => t.id == tipoPagoId);
            const aplicaSaldo = tipoPago ? this.convertirAplicaSaldo(tipoPago.aplicaSaldo) : false;

            // Actualizar estado usando la API (solo enviamos el ID del tipo de pago)
            await api.updatePedidoEstado(id, 'entregad', tipoPagoId);

            ui.hideLoading();
            ui.closeModal();

            const mensaje = aplicaSaldo ?
                'Pedido entregado correctamente. Saldo actualizado en cuenta corriente.' :
                'Pedido entregado correctamente.';
            ui.showToast(mensaje, 'success');

            // Emitir evento de pedido actualizado
            if (window.eventBus && window.EVENTS) {
                window.eventBus.emit(window.EVENTS.PEDIDO_UPDATED, {
                    pedidoId: id,
                    nuevoEstado: 'entregad',
                    tipoPago: tipoPago,
                    aplicaSaldo: aplicaSaldo
                });
            }

            await this.refresh();
        } catch (error) {
            ui.hideLoading();
            ui.showToast('Error al procesar entrega: ' + error.message, 'error');
        }
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
        this.filtros.fecha = document.getElementById('filtro-fecha').value;
        this.filtros.zona = document.getElementById('filtro-zona').value;
        this.filtros.search = document.getElementById('filtro-search').value;

        // Recargar pedidos con los nuevos filtros desde el backend
        await this.loadPedidos();
        document.getElementById('lista-pedidos').innerHTML = this.renderPedidos();

        // Reinicializar iconos después de actualizar el DOM
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    // Método para búsqueda con debounce
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filtrar();
        }, 500); // Esperar 500ms después de que el usuario deje de escribir
    },

    async limpiarFiltros() {
        // Limpiar los filtros
        this.filtros = { fecha: '', zona: '', search: '' };

        // Limpiar los campos del formulario
        document.getElementById('filtro-fecha').value = '';
        document.getElementById('filtro-zona').value = '';
        document.getElementById('filtro-search').value = '';

        // Recargar pedidos sin filtros
        await this.loadPedidos();
        document.getElementById('lista-pedidos').innerHTML = this.renderPedidos();

        // Reinicializar iconos después de actualizar el DOM
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        ui.showToast('Filtros limpiados', 'success');
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
