// main.js - Parse Cloud Code para AquaDelivery
// Este archivo se ejecutará en Back4App automáticamente

// ===== CLOUD FUNCTIONS PARA AUTENTICACIÓN =====

Parse.Cloud.define("authenticate", async (request) => {
    const { telegramId, codigoEmpresa } = request.params;
    
    try {
        // Validación básica (puedes expandir esta lógica)
        if (telegramId === "freedom135" && codigoEmpresa === "1") {
            // Crear o buscar usuario
            const User = Parse.Object.extend("User");
            const query = new Parse.Query(User);
            query.equalTo("telegramId", telegramId);
            
            let user = await query.first({ useMasterKey: true });
            
            if (!user) {
                // Crear nuevo usuario
                user = new User();
                user.set("telegramId", telegramId);
                user.set("codigoEmpresa", codigoEmpresa);
                user.set("username", `user_${telegramId}`);
                user.set("active", true);
                await user.save(null, { useMasterKey: true });
            }
            
            return {
                success: true,
                message: "Autenticación exitosa",
                userId: user.id,
                telegramId: telegramId,
                codigoEmpresa: codigoEmpresa
            };
        } else {
            throw new Parse.Error(Parse.Error.INVALID_LOGIN, "Credenciales inválidas");
        }
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== CLOUD FUNCTIONS PARA CLIENTES =====

Parse.Cloud.define("getClientes", async (request) => {
    try {
        const Cliente = Parse.Object.extend("Cliente");
        const query = new Parse.Query(Cliente);
        
        // Filtros opcionales
        if (request.params.search) {
            query.matches("nombre", new RegExp(request.params.search, "i"));
        }
        
        query.limit(100); // Limitar resultados
        query.ascending("nombre");
        
        const clientes = await query.find();
        
        return clientes.map(cliente => ({
            id: cliente.id,
            nombre: cliente.get("nombre"),
            telefono: cliente.get("telefono"),
            direccion: cliente.get("direccion"),
            zona: cliente.get("zona"),
            latitud: cliente.get("latitud"),
            longitud: cliente.get("longitud"),
            createdAt: cliente.get("createdAt"),
            updatedAt: cliente.get("updatedAt")
        }));
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

Parse.Cloud.define("createCliente", async (request) => {
    const { nombre, telefono, direccion, zona, latitud, longitud } = request.params;
    
    try {
        const Cliente = Parse.Object.extend("Cliente");
        const cliente = new Cliente();
        
        cliente.set("nombre", nombre);
        cliente.set("telefono", telefono);
        cliente.set("direccion", direccion);
        cliente.set("zona", zona);
        cliente.set("latitud", latitud);
        cliente.set("longitud", longitud);
        
        await cliente.save();
        
        return {
            success: true,
            message: "Cliente creado exitosamente",
            cliente: {
                id: cliente.id,
                nombre: cliente.get("nombre"),
                telefono: cliente.get("telefono"),
                direccion: cliente.get("direccion"),
                zona: cliente.get("zona")
            }
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

Parse.Cloud.define("updateCliente", async (request) => {
    const { clienteId, nombre, telefono, direccion, zona, latitud, longitud } = request.params;
    
    try {
        const Cliente = Parse.Object.extend("Cliente");
        const query = new Parse.Query(Cliente);
        const cliente = await query.get(clienteId);
        
        if (nombre) cliente.set("nombre", nombre);
        if (telefono) cliente.set("telefono", telefono);
        if (direccion) cliente.set("direccion", direccion);
        if (zona) cliente.set("zona", zona);
        if (latitud) cliente.set("latitud", latitud);
        if (longitud) cliente.set("longitud", longitud);
        
        await cliente.save();
        
        return {
            success: true,
            message: "Cliente actualizado exitosamente"
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

Parse.Cloud.define("deleteCliente", async (request) => {
    const { clienteId } = request.params;
    
    try {
        const Cliente = Parse.Object.extend("Cliente");
        const query = new Parse.Query(Cliente);
        const cliente = await query.get(clienteId);
        
        await cliente.destroy();
        
        return {
            success: true,
            message: "Cliente eliminado exitosamente"
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== CLOUD FUNCTIONS PARA PRODUCTOS =====

Parse.Cloud.define("getProductos", async (request) => {
    try {
        const Producto = Parse.Object.extend("Producto");
        const query = new Parse.Query(Producto);
        
        query.limit(100);
        query.ascending("nombre");
        
        const productos = await query.find();
        
        return productos.map(producto => ({
            id: producto.id,
            nombre: producto.get("nombre"),
            precio: producto.get("precio"),
            descripcion: producto.get("descripcion"),
            stock: producto.get("stock"),
            activo: producto.get("activo"),
            createdAt: producto.get("createdAt")
        }));
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

Parse.Cloud.define("createProducto", async (request) => {
    const { nombre, precio, descripcion, stock } = request.params;
    
    try {
        const Producto = Parse.Object.extend("Producto");
        const producto = new Producto();
        
        producto.set("nombre", nombre);
        producto.set("precio", parseFloat(precio));
        producto.set("descripcion", descripcion);
        producto.set("stock", parseInt(stock));
        producto.set("activo", true);
        
        await producto.save();
        
        return {
            success: true,
            message: "Producto creado exitosamente",
            producto: {
                id: producto.id,
                nombre: producto.get("nombre"),
                precio: producto.get("precio")
            }
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== CLOUD FUNCTIONS PARA PEDIDOS =====

Parse.Cloud.define("getPedidos", async (request) => {
    try {
        const Pedido = Parse.Object.extend("Pedido");
        const query = new Parse.Query(Pedido);
        
        // Incluir relaciones
        query.include("cliente");
        query.include("productos");
        
        query.limit(100);
        query.descending("createdAt");
        
        const pedidos = await query.find();
        
        return pedidos.map(pedido => ({
            id: pedido.id,
            cliente: {
                id: pedido.get("cliente")?.id,
                nombre: pedido.get("cliente")?.get("nombre")
            },
            productos: pedido.get("productos") || [],
            total: pedido.get("total"),
            estado: pedido.get("estado"),
            fechaEntrega: pedido.get("fechaEntrega"),
            createdAt: pedido.get("createdAt")
        }));
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

Parse.Cloud.define("createPedido", async (request) => {
    const { clienteId, productos, total, fechaEntrega } = request.params;
    
    try {
        const Pedido = Parse.Object.extend("Pedido");
        const Cliente = Parse.Object.extend("Cliente");
        
        // Obtener cliente
        const clienteQuery = new Parse.Query(Cliente);
        const cliente = await clienteQuery.get(clienteId);
        
        const pedido = new Pedido();
        pedido.set("cliente", cliente);
        pedido.set("productos", productos);
        pedido.set("total", parseFloat(total));
        pedido.set("estado", "pendiente");
        pedido.set("fechaEntrega", new Date(fechaEntrega));
        
        await pedido.save();
        
        return {
            success: true,
            message: "Pedido creado exitosamente",
            pedidoId: pedido.id
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== CLOUD FUNCTIONS PARA ZONAS =====

Parse.Cloud.define("getZonas", async (request) => {
    try {
        const Zona = Parse.Object.extend("Zona");
        const query = new Parse.Query(Zona);
        
        query.ascending("nombre");
        const zonas = await query.find();
        
        return zonas.map(zona => ({
            id: zona.id,
            nombre: zona.get("nombre"),
            descripcion: zona.get("descripcion"),
            activa: zona.get("activa")
        }));
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== CLOUD FUNCTIONS PARA INFORMES =====

Parse.Cloud.define("getInformes", async (request) => {
    const { fechaInicio, fechaFin } = request.params;
    
    try {
        const Pedido = Parse.Object.extend("Pedido");
        const query = new Parse.Query(Pedido);
        
        if (fechaInicio) {
            query.greaterThanOrEqualTo("createdAt", new Date(fechaInicio));
        }
        if (fechaFin) {
            query.lessThanOrEqualTo("createdAt", new Date(fechaFin));
        }
        
        query.include("cliente");
        const pedidos = await query.find();
        
        // Calcular estadísticas
        const totalPedidos = pedidos.length;
        const totalVentas = pedidos.reduce((sum, pedido) => sum + (pedido.get("total") || 0), 0);
        const pedidosPorEstado = pedidos.reduce((acc, pedido) => {
            const estado = pedido.get("estado") || "pendiente";
            acc[estado] = (acc[estado] || 0) + 1;
            return acc;
        }, {});
        
        return {
            totalPedidos,
            totalVentas,
            pedidosPorEstado,
            pedidos: pedidos.map(pedido => ({
                id: pedido.id,
                cliente: pedido.get("cliente")?.get("nombre"),
                total: pedido.get("total"),
                estado: pedido.get("estado"),
                fecha: pedido.get("createdAt")
            }))
        };
    } catch (error) {
        throw new Parse.Error(Parse.Error.SCRIPT_FAILED, error.message);
    }
});

// ===== HEALTH CHECK =====

Parse.Cloud.define("health", (request) => {
    return {
        status: "OK",
        message: "Parse Cloud Code funcionando correctamente",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    };
});

// ===== HOOKS Y TRIGGERS =====

// Trigger antes de guardar un pedido
Parse.Cloud.beforeSave("Pedido", (request) => {
    const pedido = request.object;
    
    // Validar que el total sea mayor a 0
    if (pedido.get("total") <= 0) {
        throw new Parse.Error(Parse.Error.VALIDATION_ERROR, "El total debe ser mayor a 0");
    }
    
    // Establecer fecha de creación si es nuevo
    if (!pedido.existed()) {
        pedido.set("fechaCreacion", new Date());
        pedido.set("estado", pedido.get("estado") || "pendiente");
    }
});

// Trigger después de guardar un cliente
Parse.Cloud.afterSave("Cliente", (request) => {
    const cliente = request.object;
    console.log(`Cliente ${cliente.get("nombre")} guardado con ID: ${cliente.id}`);
});
