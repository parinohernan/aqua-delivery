const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener pedidos
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('📦 Obteniendo pedidos para usuario:', req.user.telegramId);
        console.log('🏢 Código empresa:', req.user.codigoEmpresa);

        const { estado, clienteId, fecha } = req.query;
        
        let sql = `
            SELECT p.codigo as id,
                   p.fechaPedido as fecha_pedido,
                   p.total,
                   p.estado,
                   CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
                   c.nombre,
                   c.apellido,
                   c.direccion,
                   c.telefono,
                   c.latitud,
                   c.longitud,
                   v1.nombre as vendedor_pedido,
                   v2.nombre as vendedor_entrega
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            LEFT JOIN vendedores v1 ON p.codigoVendedorPedido = v1.codigo
            LEFT JOIN vendedores v2 ON p.codigoVendedorEntrega = v2.codigo
            WHERE p.codigoEmpresa = ?
        `;
        let params = [req.user.codigoEmpresa];
        
        if (estado) {
            sql += ' AND p.estado = ?';
            params.push(estado);
        }
        
        if (clienteId) {
            sql += ' AND p.codigoCliente = ?';
            params.push(clienteId);
        }
        
        if (fecha) {
            sql += ' AND DATE(p.fechaPedido) = ?';
            params.push(fecha);
        }

        sql += ' ORDER BY p.fechaPedido DESC';
        
        console.log('📋 Ejecutando consulta SQL:', sql);
        console.log('📋 Parámetros:', params);

        const pedidos = await query(sql, params);
        console.log('✅ Pedidos encontrados:', pedidos.length);

        // Obtener detalles de cada pedido
        for (let pedido of pedidos) {
            console.log('🔍 Cargando detalles para pedido ID:', pedido.id);
            const detalles = await query(
                'SELECT pi.*, pr.descripcion, pr.precio FROM pedidositems pi JOIN productos pr ON pi.codigoProducto = pr.codigo WHERE pi.codigoPedido = ?',
                [pedido.id]  // Cambiado de pedido.codigo a pedido.id
            );
            pedido.detalles = detalles;
        }
        
        res.json(pedidos);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear pedido
router.post('/', verifyToken, async (req, res) => {
    try {
        const { clienteId, productos, total } = req.body;

        console.log('📦 Creando pedido:', { clienteId, productos: productos?.length, total });

        // Validaciones
        if (!clienteId) {
            return res.status(400).json({ error: 'Cliente es requerido' });
        }
        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'Debe agregar al menos un producto' });
        }

        // Verificar que el cliente existe y pertenece a la empresa
        const cliente = await query(
            'SELECT codigo FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(400).json({ error: 'Cliente no encontrado' });
        }

        // Verificar stock de productos
        for (const item of productos) {
            const producto = await query(
                'SELECT codigo, descripcion, precio, stock FROM productos WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
                [item.productoId, req.user.codigoEmpresa]
            );

            if (producto.length === 0) {
                return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
            }

            if (producto[0].stock < item.cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${producto[0].descripcion}. Disponible: ${producto[0].stock}, Solicitado: ${item.cantidad}`
                });
            }
        }

        // Crear pedido con estado "pendient" (campo estado tiene límite de 8 caracteres)
        // Estados posibles: "pendient", "anulado", "entregad"
        const result = await query(
            'INSERT INTO pedidos (codigoEmpresa, codigoCliente, codigoVendedorPedido, total, FechaPedido, estado) VALUES (?, ?, ?, ?, NOW(), "pendient")',
            [req.user.codigoEmpresa, clienteId, req.user.vendedorId, total]
        );

        const codigoPedido = result.insertId;
        console.log('✅ Pedido creado con código:', codigoPedido);

        // Agregar productos al pedido y actualizar stock
        for (const item of productos) {
            // Insertar en pedidositems
            await query(
                'INSERT INTO pedidositems (codigoPedido, codigoProducto, cantidad) VALUES (?, ?, ?)',
                [codigoPedido, item.productoId, item.cantidad]
            );
            console.log(`📋 Item agregado a pedidositems: Pedido ${codigoPedido}, Producto ${item.productoId}, Cantidad ${item.cantidad}`);

            // Actualizar stock del producto
            await query(
                'UPDATE productos SET stock = stock - ? WHERE codigo = ? AND codigoEmpresa = ?',
                [item.cantidad, item.productoId, req.user.codigoEmpresa]
            );

            console.log(`📦 Stock actualizado para producto ${item.productoId}: -${item.cantidad} unidades`);
        }

        // Obtener el pedido creado con datos del cliente
        const pedidoCreado = await query(`
            SELECT p.*, c.nombre, c.apellido, c.direccion, c.telefono
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            WHERE p.codigo = ? AND p.codigoEmpresa = ?
        `, [codigoPedido, req.user.codigoEmpresa]);

        // Resumen del pedido creado
        console.log('✅ PEDIDO CREADO EXITOSAMENTE:');
        console.log(`   📋 Código: ${codigoPedido}`);
        console.log(`   👤 Cliente: ${pedidoCreado[0].nombre} ${pedidoCreado[0].apellido || ''}`);
        console.log(`   💰 Total: $${total}`);
        console.log(`   📦 Productos: ${productos.length} items`);
        console.log(`   📅 Estado: pendient`);

        res.json(pedidoCreado[0]);

    } catch (error) {
        console.error('❌ Error creando pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cambiar estado de pedido
router.put('/:id/estado', verifyToken, async (req, res) => {
    try {
        const { estado } = req.body;
        
        await query(
            'UPDATE pedidos SET estado = ?, codigoVendedorEntrega = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [estado, req.user.vendedorId, req.params.id, req.user.codigoEmpresa]
        );
        
        if (estado === 'entregado') {
            await query(
                'UPDATE pedidos SET FechaEntrega = NOW() WHERE codigo = ?',
                [req.params.id]
            );
        }
        
        res.json({ success: true });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener items de un pedido específico
router.get('/:id/items', verifyToken, async (req, res) => {
    try {
        const pedidoId = req.params.id;

        console.log(`📋 Obteniendo items del pedido ${pedidoId}`);

        // Verificar que el pedido pertenece a la empresa del usuario
        const pedido = await query(
            'SELECT codigo FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Obtener items del pedido con información del producto
        const items = await query(`
            SELECT
                pi.codigoPedido,
                pi.codigoProducto,
                pi.cantidad,
                p.descripcion as nombreProducto,
                p.precio as precioUnitario,
                (pi.cantidad * p.precio) as subtotal
            FROM pedidositems pi
            JOIN productos p ON pi.codigoProducto = p.codigo
            WHERE pi.codigoPedido = ?
            ORDER BY p.descripcion
        `, [pedidoId]);

        console.log(`✅ Items encontrados: ${items.length}`);
        res.json(items);

    } catch (error) {
        console.error('❌ Error obteniendo items del pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;