class Pedido {
    constructor(data = {}) {
        this.codigo = data.codigo || null;
        this.numero = data.numero || null;
        this.clienteId = data.clienteId || null;
        this.vendedorId = data.vendedorId || null;
        this.codigoEmpresa = data.codigoEmpresa || null;
        this.estado = data.estado || 'pendiente'; // pendiente, preparacion, entregado, cancelado
        this.tipoPago = data.tipoPago || 'efectivo'; // efectivo, cuenta_corriente, tarjeta
        this.total = data.total || 0;
        this.subtotal = data.subtotal || 0;
        this.descuento = data.descuento || 0;
        this.costoEnvio = data.costoEnvio || 0;
        this.observaciones = data.observaciones || '';
        this.direccionEntrega = data.direccionEntrega || '';
        this.zonaId = data.zonaId || null;
        this.fechaPedido = data.fechaPedido || new Date().toISOString();
        this.fechaEntrega = data.fechaEntrega || null;
        this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
        this.items = data.items || []; // Array de items del pedido
        
        // Datos relacionados (se cargan desde API)
        this.cliente = data.cliente || null;
        this.vendedor = data.vendedor || null;
        this.zona = data.zona || null;
    }

    // Estados válidos del pedido
    static ESTADOS = {
        PENDIENTE: 'pendiente',
        PREPARACION: 'preparacion',
        ENTREGADO: 'entregado',
        CANCELADO: 'cancelado'
    };

    // Tipos de pago válidos
    static TIPOS_PAGO = {
        EFECTIVO: 'efectivo',
        CUENTA_CORRIENTE: 'cuenta_corriente',
        TARJETA: 'tarjeta'
    };

    // Validar datos del pedido
    validate() {
        const errors = [];

        if (!this.clienteId) {
            errors.push('El cliente es requerido');
        }

        if (!this.tipoPago || !Object.values(Pedido.TIPOS_PAGO).includes(this.tipoPago)) {
            errors.push('El tipo de pago es requerido y debe ser válido');
        }

        if (!this.estado || !Object.values(Pedido.ESTADOS).includes(this.estado)) {
            errors.push('El estado del pedido debe ser válido');
        }

        if (this.items.length === 0) {
            errors.push('El pedido debe tener al menos un item');
        }

        if (this.total < 0) {
            errors.push('El total no puede ser negativo');
        }

        // Validar items
        this.items.forEach((item, index) => {
            if (!item.productoId) {
                errors.push(`Item ${index + 1}: El producto es requerido`);
            }
            if (!item.cantidad || item.cantidad <= 0) {
                errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
            }
            if (!item.precio || item.precio < 0) {
                errors.push(`Item ${index + 1}: El precio debe ser mayor o igual a 0`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Agregar item al pedido
    addItem(productoId, cantidad, precio, nombre = '') {
        const existingItem = this.items.find(item => item.productoId === productoId);
        
        if (existingItem) {
            existingItem.cantidad += cantidad;
            existingItem.subtotal = existingItem.cantidad * existingItem.precio;
        } else {
            this.items.push({
                productoId: productoId,
                nombre: nombre,
                cantidad: cantidad,
                precio: precio,
                subtotal: cantidad * precio
            });
        }
        
        this.calcularTotales();
        return this;
    }

    // Remover item del pedido
    removeItem(productoId) {
        this.items = this.items.filter(item => item.productoId !== productoId);
        this.calcularTotales();
        return this;
    }

    // Actualizar cantidad de un item
    updateItemQuantity(productoId, nuevaCantidad) {
        const item = this.items.find(item => item.productoId === productoId);
        if (item) {
            if (nuevaCantidad <= 0) {
                this.removeItem(productoId);
            } else {
                item.cantidad = nuevaCantidad;
                item.subtotal = item.cantidad * item.precio;
                this.calcularTotales();
            }
        }
        return this;
    }

    // Calcular totales del pedido
    calcularTotales() {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.total = this.subtotal - this.descuento + this.costoEnvio;
        this.fechaModificacion = new Date().toISOString();
        return this;
    }

    // Cambiar estado del pedido
    cambiarEstado(nuevoEstado) {
        if (!Object.values(Pedido.ESTADOS).includes(nuevoEstado)) {
            throw new Error('Estado inválido');
        }
        
        this.estado = nuevoEstado;
        this.fechaModificacion = new Date().toISOString();
        
        if (nuevoEstado === Pedido.ESTADOS.ENTREGADO) {
            this.fechaEntrega = new Date().toISOString();
        }
        
        return this;
    }

    // Obtener texto del estado
    getEstadoTexto() {
        const estados = {
            [Pedido.ESTADOS.PENDIENTE]: 'Pendiente',
            [Pedido.ESTADOS.PREPARACION]: 'En Preparación',
            [Pedido.ESTADOS.ENTREGADO]: 'Entregado',
            [Pedido.ESTADOS.CANCELADO]: 'Cancelado'
        };
        return estados[this.estado] || this.estado;
    }

    // Obtener texto del tipo de pago
    getTipoPagoTexto() {
        const tipos = {
            [Pedido.TIPOS_PAGO.EFECTIVO]: 'Efectivo',
            [Pedido.TIPOS_PAGO.CUENTA_CORRIENTE]: 'Cuenta Corriente',
            [Pedido.TIPOS_PAGO.TARJETA]: 'Tarjeta'
        };
        return tipos[this.tipoPago] || this.tipoPago;
    }

    // Formatear total
    getFormattedTotal() {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.total);
    }

    // Verificar si el pedido puede ser editado
    canEdit() {
        return this.estado === Pedido.ESTADOS.PENDIENTE;
    }

    // Verificar si el pedido puede ser cancelado
    canCancel() {
        return [Pedido.ESTADOS.PENDIENTE, Pedido.ESTADOS.PREPARACION].includes(this.estado);
    }

    // Convertir a objeto plano para API
    toJSON() {
        return {
            codigo: this.codigo,
            numero: this.numero,
            clienteId: this.clienteId,
            vendedorId: this.vendedorId,
            codigoEmpresa: this.codigoEmpresa,
            estado: this.estado,
            tipoPago: this.tipoPago,
            total: this.total,
            subtotal: this.subtotal,
            descuento: this.descuento,
            costoEnvio: this.costoEnvio,
            observaciones: this.observaciones.trim(),
            direccionEntrega: this.direccionEntrega.trim(),
            zonaId: this.zonaId,
            fechaPedido: this.fechaPedido,
            fechaEntrega: this.fechaEntrega,
            fechaModificacion: new Date().toISOString(),
            items: this.items
        };
    }

    // Crear desde datos de formulario
    static fromFormData(formData, vendedorId, codigoEmpresa) {
        return new Pedido({
            clienteId: parseInt(formData.get('clienteId')),
            vendedorId: vendedorId,
            codigoEmpresa: codigoEmpresa,
            tipoPago: formData.get('tipoPago'),
            observaciones: formData.get('observaciones') || '',
            direccionEntrega: formData.get('direccionEntrega') || '',
            zonaId: formData.get('zonaId') ? parseInt(formData.get('zonaId')) : null
        });
    }

    // Clonar pedido
    clone() {
        return new Pedido(this.toJSON());
    }
}
