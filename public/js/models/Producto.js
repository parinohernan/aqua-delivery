class Producto {
    constructor(data = {}) {
        this.codigo = data.codigo || null;
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
        this.precio = data.precio || 0;
        this.stock = data.stock || 0;
        this.codigoEmpresa = data.codigoEmpresa || null;
        this.activo = data.activo !== undefined ? data.activo : 1;
        this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
        this.fechaModificacion = data.fechaModificacion || new Date().toISOString();
    }

    // Validar datos del producto
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length === 0) {
            errors.push('El nombre del producto es requerido');
        }

        if (this.nombre && this.nombre.length > 100) {
            errors.push('El nombre del producto no puede exceder 100 caracteres');
        }

        if (this.descripcion && this.descripcion.length > 500) {
            errors.push('La descripción no puede exceder 500 caracteres');
        }

        if (this.precio < 0) {
            errors.push('El precio no puede ser negativo');
        }

        // Permitir stock negativo para casos donde el stock no está actualizado
        // if (this.stock < 0) {
        //     errors.push('El stock no puede ser negativo');
        // }

        if (!Number.isInteger(this.stock)) {
            errors.push('El stock debe ser un número entero');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convertir a objeto plano para API
    toJSON() {
        return {
            codigo: this.codigo,
            nombre: this.nombre.trim(),
            descripcion: this.descripcion.trim(),
            precio: parseFloat(this.precio),
            stock: parseInt(this.stock),
            codigoEmpresa: this.codigoEmpresa,
            activo: this.activo,
            fechaCreacion: this.fechaCreacion,
            fechaModificacion: new Date().toISOString()
        };
    }

    // Crear desde datos de formulario
    static fromFormData(formData) {
        return new Producto({
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            precio: formData.get('precio'),
            stock: formData.get('stock')
        });
    }

    // Verificar si el stock está bajo
    isLowStock(threshold = 10) {
        return this.stock <= threshold;
    }

    // Formatear precio
    getFormattedPrice() {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(this.precio);
    }

    // Actualizar stock (permite stock negativo)
    updateStock(cantidad, operacion = 'subtract') {
        if (operacion === 'add') {
            this.stock += cantidad;
        } else if (operacion === 'subtract') {
            this.stock = this.stock - cantidad; // Permite stock negativo
        } else if (operacion === 'set') {
            this.stock = cantidad; // Permite stock negativo
        }
        
        this.fechaModificacion = new Date().toISOString();
        return this.stock;
    }

    // Clonar producto
    clone() {
        return new Producto(this.toJSON());
    }

    // Comparar con otro producto
    equals(otroProducto) {
        return this.codigo === otroProducto.codigo;
    }
}
