const storage = {
    clientes: JSON.parse(localStorage.getItem('clientes') || '[]'),
    productos: JSON.parse(localStorage.getItem('productos') || '[]'),
    pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
    
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
        this[key] = data;
    },

    getNextId(collection) {
        const items = this[collection];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    },

    // Datos de prueba
    loadTestData() {
        if (this.productos.length === 0) {
            this.productos = [
                new Producto(1, 'Bidón 20L', 1500, true, 50),
                new Producto(2, 'Botella 500ml', 300, false, 100)
            ];
            this.save('productos', this.productos);
        }
        
        if (this.clientes.length === 0) {
            this.clientes = [
                new Cliente(1, 'Juan', 'Pérez', 'Av. Principal 123', -34.6037, -58.3816),
                new Cliente(2, 'María', 'González', 'Calle Falsa 456', -34.6118, -58.3960)
            ];
            this.save('clientes', this.clientes);
        }
    }
};