const express = require('express');
const { query, transaction } = require('../config/database');
const { verifyToken } = require('./auth');
const { actualizarRutasPorCambioZona } = require('../lib/rutasHelper');
const router = express.Router();

// Obtener pedidos
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('📦 Obteniendo pedidos para usuario:', req.user.telegramId);
        console.log('🏢 Código empresa:', req.user.codigoEmpresa);

        const { clienteId, fecha, zona, search, estado, incluirDetalles, ordenarPorRuta } = req.query;
        const cargarDetalles = incluirDetalles !== 'false'; // Por defecto true para compatibilidad

        // Consulta base sin columnas de ubicación
        let sql = `
            SELECT p.codigo as id,
                   p.codigoCliente,
                   p.fechaPedido as fecha_pedido,
                   p.FechaProgramada as fecha_programada,
                   p.FechaEntrega as fecha_entrega,
                   p.total,
                   p.estado,
                   p.zona,
                   CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
                   c.nombre,
                   c.apellido,
                   c.direccion,
                   c.telefono,
                   COALESCE(c.saldo, 0) as cliente_saldo,
                   COALESCE(c.retornables, 0) as cliente_retornables,
                   NULL as latitud,
                   NULL as longitud,
                   NULL as orden_reparto,
                   v1.nombre as vendedor_pedido,
                   v2.nombre as vendedor_entrega
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            LEFT JOIN vendedores v1 ON p.codigoVendedorPedido = v1.codigo
            LEFT JOIN vendedores v2 ON p.codigoVendedorEntrega = v2.codigo
            WHERE p.codigoEmpresa = ?
        `;

        // Intentar usar columnas de ubicación si existen
        try {
            const testQuery = await query('SELECT latitud, longitud FROM clientes LIMIT 1');
            console.log('🗺️ Columnas de ubicación disponibles en pedidos');

            sql = `
                SELECT p.codigo as id,
                       p.codigoCliente,
                       p.fechaPedido as fecha_pedido,
                       p.FechaProgramada as fecha_programada,
                       p.FechaEntrega as fecha_entrega,
                       p.total,
                       p.estado,
                       p.zona,
                       CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
                       c.nombre,
                       c.apellido,
                       c.direccion,
                       c.telefono,
                       COALESCE(c.saldo, 0) as cliente_saldo,
                       COALESCE(c.retornables, 0) as cliente_retornables,
                       c.latitud,
                       c.longitud,
                       NULL as orden_reparto,
                       v1.nombre as vendedor_pedido,
                       v2.nombre as vendedor_entrega
                FROM pedidos p
                JOIN clientes c ON p.codigoCliente = c.codigo
                LEFT JOIN vendedores v1 ON p.codigoVendedorPedido = v1.codigo
                LEFT JOIN vendedores v2 ON p.codigoVendedorEntrega = v2.codigo
                WHERE p.codigoEmpresa = ?
            `;
        } catch (error) {
            console.log('⚠️ Columnas de ubicación no disponibles en pedidos, usando valores NULL');
        }
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

        if (zona) {
            sql += ' AND p.zona = ?';
            params.push(zona);
        }

        if (search) {
            sql += ' AND (c.nombre LIKE ? OR c.apellido LIKE ? OR CONCAT(c.nombre, " ", COALESCE(c.apellido, "")) LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        if (zona && ordenarPorRuta === '1') {
            sql = sql.replace(
                /WHERE p\.codigoEmpresa/,
                'LEFT JOIN rutas r ON r.codigoEmpresa = p.codigoEmpresa AND r.zona = p.zona AND r.codigoCliente = p.codigoCliente WHERE p.codigoEmpresa'
            );
            sql = sql.replace(
                /NULL as orden_reparto/g,
                'COALESCE(r.orden, 9999) as orden_reparto'
            );
            sql += ' ORDER BY COALESCE(r.orden, 9999) ASC, p.fechaPedido DESC';
        } else {
            sql += ' ORDER BY p.fechaPedido DESC';
        }

        console.log('📋 Ejecutando consulta SQL:', sql);
        console.log('📋 Parámetros:', params);

        const pedidos = await query(sql, params);
        console.log('✅ Pedidos encontrados:', pedidos.length);

        // Optimización: Obtener todos los detalles en una sola query usando JOIN
        // Solo cargar detalles si hay pedidos y se solicitan
        if (pedidos.length > 0 && cargarDetalles) {
            const pedidosIds = pedidos.map(p => p.id);
            const placeholders = pedidosIds.map(() => '?').join(',');
            
            // Obtener todos los items de todos los pedidos en una sola query
            const todosDetalles = await query(
                `SELECT 
                    pi.codigoPedido as pedidoId,
                    pi.codigoProducto,
                    pi.cantidad,
                    pi.precioTotal,
                    pr.descripcion,
                    pr.precio,
                    pr.esRetornable
                FROM pedidositems pi 
                JOIN productos pr ON pi.codigoProducto = pr.codigo 
                WHERE pi.codigoPedido IN (${placeholders}) 
                AND pr.activo = 1
                AND pr.codigoEmpresa = ?`,
                [...pedidosIds, req.user.codigoEmpresa]
            );
            
            // Agrupar detalles por pedido
            const detallesPorPedido = {};
            todosDetalles.forEach(detalle => {
                if (!detallesPorPedido[detalle.pedidoId]) {
                    detallesPorPedido[detalle.pedidoId] = [];
                }
                detallesPorPedido[detalle.pedidoId].push({
                    codigoProducto: detalle.codigoProducto,
                    cantidad: detalle.cantidad,
                    precioTotal: detalle.precioTotal,
                    descripcion: detalle.descripcion,
                    precio: detalle.precio,
                    esRetornable: detalle.esRetornable
                });
            });
            
            // Asignar detalles a cada pedido
            pedidos.forEach(pedido => {
                pedido.detalles = detallesPorPedido[pedido.id] || [];
                pedido.items = detallesPorPedido[pedido.id] || []; // También como items para compatibilidad
            });
            
            console.log('✅ Detalles cargados para', pedidos.length, 'pedidos en una sola query');
        } else if (!cargarDetalles) {
            // Si no se solicitan detalles, inicializar arrays vacíos
            pedidos.forEach(pedido => {
                pedido.detalles = [];
                pedido.items = [];
            });
            console.log('✅ Pedidos cargados sin detalles (modo rápido)');
        }

        res.json(pedidos);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener pedido completo por ID (con cliente e items)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const pedidoId = req.params.id;

        console.log('📦 Obteniendo pedido completo:', pedidoId);

        // 1. Obtener datos del pedido con cliente
        const pedido = await query(`
            SELECT
                p.codigo as id,
                p.codigo as codigo,
                p.codigoCliente,
                p.fechaPedido as fecha_pedido,
                p.FechaProgramada as fecha_programada,
                p.FechaEntrega as fecha_entrega,
                p.total,
                p.estado,
                p.zona,
                c.codigo as cliente_codigo,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.telefono as cliente_telefono,
                c.direccion as cliente_direccion,
                c.zona as cliente_zona,
                COALESCE(c.saldo, 0) as cliente_saldo,
                COALESCE(c.retornables, 0) as cliente_retornables
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            WHERE p.codigo = ? AND p.codigoEmpresa = ?
        `, [pedidoId, req.user.codigoEmpresa]);

        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoData = pedido[0];

        // 2. Obtener items del pedido con detalles de productos
        const items = await query(`
            SELECT 
                pi.codigoProducto as productoId,
                pi.codigoProducto as codigoProducto,
                pi.cantidad,
                pi.precioTotal as precio_total,
                CASE 
                    WHEN pi.cantidad > 0 THEN (pi.precioTotal / pi.cantidad)
                    ELSE 0
                END as precio,
                pr.descripcion as producto_nombre,
                pr.descripcion,
                pr.esRetornable
            FROM pedidositems pi
            JOIN productos pr ON pi.codigoProducto = pr.codigo
            WHERE pi.codigoPedido = ? AND pr.codigoEmpresa = ?
            ORDER BY pr.descripcion
        `, [pedidoId, req.user.codigoEmpresa]);

        // 3. Formatear respuesta
        const response = {
            codigo: pedidoData.codigo,
            id: pedidoData.id,
            codigoCliente: pedidoData.codigoCliente,
            cliente_id: pedidoData.codigoCliente,
            fecha_pedido: pedidoData.fecha_pedido,
            total: pedidoData.total,
            estado: pedidoData.estado,
            zona: pedidoData.zona,
            cliente: {
                codigo: pedidoData.cliente_codigo,
                nombre: pedidoData.cliente_nombre,
                apellido: pedidoData.cliente_apellido,
                telefono: pedidoData.cliente_telefono,
                direccion: pedidoData.cliente_direccion,
                zona: pedidoData.cliente_zona,
                saldo: parseFloat(pedidoData.cliente_saldo || 0),
                retornables: parseInt(pedidoData.cliente_retornables || 0, 10)
            },
            cliente_saldo: parseFloat(pedidoData.cliente_saldo || 0),
            cliente_retornables: parseInt(pedidoData.cliente_retornables || 0, 10),
            // Campos adicionales para compatibilidad
            cliente_nombre: pedidoData.cliente_nombre,
            cliente_apellido: pedidoData.cliente_apellido,
            telefono: pedidoData.cliente_telefono,
            direccion: pedidoData.cliente_direccion,
            productos: items.map(item => ({
                productoId: item.productoId,
                codigoProducto: item.codigoProducto,
                codigo: item.codigoProducto,
                producto_id: item.productoId,
                cantidad: parseFloat(item.cantidad),
                precio: parseFloat(item.precio),
                precio_unitario: parseFloat(item.precio),
                precioTotal: parseFloat(item.precio_total),
                descripcion: item.descripcion,
                nombre: item.producto_nombre,
                producto_nombre: item.producto_nombre,
                esRetornable: item.esRetornable === 1 || item.esRetornable === true
            })),
            items: items.map(item => ({
                productoId: item.productoId,
                codigoProducto: item.codigoProducto,
                codigo: item.codigoProducto,
                producto_id: item.productoId,
                cantidad: parseFloat(item.cantidad),
                precio: parseFloat(item.precio),
                precio_unitario: parseFloat(item.precio),
                precioTotal: parseFloat(item.precio_total),
                descripcion: item.descripcion,
                nombre: item.producto_nombre,
                producto_nombre: item.producto_nombre,
                esRetornable: item.esRetornable === 1 || item.esRetornable === true
            })),
            detalles: items.map(item => ({
                productoId: item.productoId,
                codigoProducto: item.codigoProducto,
                codigo: item.codigoProducto,
                producto_id: item.productoId,
                cantidad: parseFloat(item.cantidad),
                precio: parseFloat(item.precio),
                precio_unitario: parseFloat(item.precio),
                precioTotal: parseFloat(item.precio_total),
                descripcion: item.descripcion,
                nombre: item.producto_nombre,
                producto_nombre: item.producto_nombre,
                esRetornable: item.esRetornable === 1 || item.esRetornable === true
            }))
        };

        console.log('✅ Pedido completo obtenido:', {
            id: response.codigo,
            cliente: response.cliente.nombre,
            items: response.productos.length
        });

        res.json(response);

    } catch (error) {
        console.error('❌ Error obteniendo pedido completo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear pedido
router.post('/', verifyToken, async (req, res) => {
    try {
        const { clienteId, productos, total, zona: zonaPedido } = req.body;

        console.log('📦 Creando pedido:', { clienteId, productos: productos?.length, total, zona: zonaPedido });

        // Validaciones
        if (!clienteId) {
            return res.status(400).json({ error: 'Cliente es requerido' });
        }
        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'Debe agregar al menos un producto' });
        }

        // Verificar que el cliente existe y obtener su zona
        const cliente = await query(
            'SELECT codigo, zona FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(400).json({ error: 'Cliente no encontrado' });
        }

        // Usar zona enviada en el body o, si no, la zona del cliente
        const clienteZona = cliente[0].zona;
        const zonaFinal = (zonaPedido != null && String(zonaPedido).trim() !== '') ? String(zonaPedido).trim() : (clienteZona || null);

        // Verificar que los productos existen (sin validar stock)
        for (const item of productos) {
            const producto = await query(
                'SELECT codigo, descripcion, precio, stock FROM productos WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
                [item.productoId, req.user.codigoEmpresa]
            );

            if (producto.length === 0) {
                return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
            }

            // Mostrar advertencia si el stock es insuficiente, pero permitir continuar
            if (producto[0].stock < item.cantidad) {
                console.log(`⚠️ Stock insuficiente para ${producto[0].descripcion}. Disponible: ${producto[0].stock}, Solicitado: ${item.cantidad}. Continuando con stock negativo.`);
            }
        }

        // Crear pedido con estado "pendient" y zona (del body o del cliente)
        const result = await query(
            'INSERT INTO pedidos (codigoEmpresa, codigoCliente, codigoVendedorPedido, total, zona, FechaPedido, estado) VALUES (?, ?, ?, ?, ?, NOW(), "pendient")',
            [req.user.codigoEmpresa, clienteId, req.user.vendedorId, total, zonaFinal]
        );

        const codigoPedido = result.insertId;
        console.log('✅ Pedido creado con código:', codigoPedido);

        // Actualizar también la zona del cliente y la tabla rutas
        if (zonaFinal) {
            await query(
                'UPDATE clientes SET zona = ? WHERE codigo = ? AND codigoEmpresa = ?',
                [zonaFinal, clienteId, req.user.codigoEmpresa]
            );
            console.log(`   📍 Zona del cliente ${clienteId} actualizada a: ${zonaFinal}`);
            try {
                await actualizarRutasPorCambioZona(req.user.codigoEmpresa, Number(clienteId), clienteZona || null, zonaFinal);
            } catch (err) {
                console.error('⚠️ Error actualizando rutas por cambio de zona:', err.message);
            }
        }

        // Agregar productos al pedido y actualizar stock
        for (const item of productos) {
            // Calcular precio total del item (precio unitario * cantidad)
            const precioTotal = item.precio * item.cantidad;

            // Insertar en pedidositems
            await query(
                'INSERT INTO pedidositems (codigoPedido, codigoProducto, cantidad, precioTotal) VALUES (?, ?, ?, ?)',
                [codigoPedido, item.productoId, item.cantidad, precioTotal]
            );
            console.log(`📋 Item agregado a pedidositems: Pedido ${codigoPedido}, Producto ${item.productoId}, Cantidad ${item.cantidad}, Precio Total: $${precioTotal}`);

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

// Actualizar pedido completo
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const { clienteId, productos, total } = req.body;

        console.log('📝 Actualizando pedido:', { pedidoId, clienteId, productos: productos?.length, total });

        // Validaciones
        if (!productos || productos.length === 0) {
            return res.status(400).json({ error: 'Debe agregar al menos un producto' });
        }

        // Verificar que el pedido existe y pertenece a la empresa
        const pedidoExistente = await query(
            'SELECT codigo, estado, codigoCliente FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );

        if (pedidoExistente.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoActual = pedidoExistente[0];

        // Solo permitir actualizar pedidos pendientes
        if (pedidoActual.estado !== 'pendient') {
            return res.status(400).json({ error: 'Solo se pueden actualizar pedidos pendientes' });
        }

        // Si no se envía clienteId, usar el cliente actual del pedido
        const clienteIdToUse = clienteId || pedidoActual.codigoCliente;
        
        if (!clienteIdToUse) {
            return res.status(400).json({ error: 'Cliente es requerido' });
        }

        // Verificar que el cliente existe y obtener su zona
        const cliente = await query(
            'SELECT codigo, zona FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteIdToUse, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(400).json({ error: 'Cliente no encontrado' });
        }

        const clienteZona = cliente[0].zona;

        // Verificar que los productos existen
        for (const item of productos) {
            const producto = await query(
                'SELECT codigo, descripcion, precio, stock FROM productos WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
                [item.productoId, req.user.codigoEmpresa]
            );

            if (producto.length === 0) {
                return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
            }
        }

        // Usar transacción para asegurar consistencia
        await transaction(async (query) => {
            // 1. Obtener items actuales del pedido para restaurar stock
            const itemsActuales = await query(
                'SELECT codigoProducto, cantidad FROM pedidositems WHERE codigoPedido = ?',
                [pedidoId]
            );

            // 2. Restaurar stock de productos anteriores
            for (const item of itemsActuales) {
                await query(
                    'UPDATE productos SET stock = stock + ? WHERE codigo = ? AND codigoEmpresa = ?',
                    [item.cantidad, item.codigoProducto, req.user.codigoEmpresa]
                );
                console.log(`📦 Stock restaurado para producto ${item.codigoProducto}: +${item.cantidad} unidades`);
            }

            // 3. Eliminar items antiguos
            await query('DELETE FROM pedidositems WHERE codigoPedido = ?', [pedidoId]);
            console.log('🗑️ Items antiguos eliminados');

            // 4. Actualizar pedido (cliente, total, zona)
            await query(
                'UPDATE pedidos SET codigoCliente = ?, total = ?, zona = ? WHERE codigo = ? AND codigoEmpresa = ?',
                [clienteIdToUse, total, clienteZona, pedidoId, req.user.codigoEmpresa]
            );
            console.log('✅ Pedido actualizado');

            // 5. Agregar nuevos productos al pedido y actualizar stock
            for (const item of productos) {
                const precioTotal = item.precio * item.cantidad;

                // Insertar en pedidositems
                await query(
                    'INSERT INTO pedidositems (codigoPedido, codigoProducto, cantidad, precioTotal) VALUES (?, ?, ?, ?)',
                    [pedidoId, item.productoId, item.cantidad, precioTotal]
                );
                console.log(`📋 Item agregado: Producto ${item.productoId}, Cantidad ${item.cantidad}, Precio Total: $${precioTotal}`);

                // Actualizar stock del producto
                await query(
                    'UPDATE productos SET stock = stock - ? WHERE codigo = ? AND codigoEmpresa = ?',
                    [item.cantidad, item.productoId, req.user.codigoEmpresa]
                );
                console.log(`📦 Stock actualizado para producto ${item.productoId}: -${item.cantidad} unidades`);
            }
        });

        // Obtener el pedido actualizado con datos del cliente
        const pedidoActualizado = await query(`
            SELECT p.*, c.nombre, c.apellido, c.direccion, c.telefono
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            WHERE p.codigo = ? AND p.codigoEmpresa = ?
        `, [pedidoId, req.user.codigoEmpresa]);

        console.log('✅ PEDIDO ACTUALIZADO EXITOSAMENTE:');
        console.log(`   📋 Código: ${pedidoId}`);
        console.log(`   👤 Cliente: ${pedidoActualizado[0].nombre} ${pedidoActualizado[0].apellido || ''}`);
        console.log(`   💰 Total: $${total}`);
        console.log(`   📦 Productos: ${productos.length} items`);

        res.json(pedidoActualizado[0]);

    } catch (error) {
        console.error('❌ Error actualizando pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cambiar estado de pedido
router.put('/:id/estado', verifyToken, async (req, res) => {
    try {
        const { estado, tipoPago } = req.body;

        if (estado === 'entregad') {
            // Obtener información del pedido
            const pedido = await query(
                'SELECT codigo, codigoCliente, total FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
                [req.params.id, req.user.codigoEmpresa]
            );

            if (pedido.length === 0) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            // Obtener información del tipo de pago para saber si aplica saldo
            const tipoPagoInfo = await query(
                'SELECT aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
                [tipoPago, req.user.codigoEmpresa]
            );

            if (tipoPagoInfo.length === 0) {
                return res.status(400).json({ error: 'Tipo de pago no encontrado' });
            }

            const pedidoData = pedido[0];
            const aplicaSaldo = tipoPagoInfo[0].aplicaSaldo;
            const saldoPedido = aplicaSaldo ? pedidoData.total : 0;

            // Actualizar el pedido con todos los datos de entrega
            await query(
                'UPDATE pedidos SET estado = ?, codigoVendedorEntrega = ?, tipoPago = ?, saldo = ?, FechaEntrega = NOW() WHERE codigo = ? AND codigoEmpresa = ?',
                [estado, req.user.vendedorId, tipoPago, saldoPedido, req.params.id, req.user.codigoEmpresa]
            );

            // Si aplica saldo, actualizar el saldo del cliente
            if (aplicaSaldo && saldoPedido > 0) {
                await query(
                    'UPDATE clientes SET saldo = saldo + ? WHERE codigo = ? AND codigoEmpresa = ?',
                    [saldoPedido, pedidoData.codigoCliente, req.user.codigoEmpresa]
                );
                console.log(`💰 Saldo actualizado para cliente ${pedidoData.codigoCliente}: +${saldoPedido}`);
            }

            console.log(`📦 Pedido ${req.params.id} entregado - Tipo pago: ${tipoPago}, Aplica saldo: ${aplicaSaldo}, Saldo: ${saldoPedido}`);
        } else {
            // Si el nuevo estado es "anulado", verificar si debemos devolver stock
            if (estado === 'anulado') {
                // Obtener estado actual del pedido
                const pedidoActual = await query(
                    'SELECT estado FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
                    [req.params.id, req.user.codigoEmpresa]
                );

                if (pedidoActual.length > 0 && pedidoActual[0].estado !== 'anulado') {
                    console.log(`🔄 Devolviendo stock para pedido ${req.params.id} (cancelación)...`);

                    // Obtener items para devolver stock
                    const items = await query(
                        'SELECT codigoProducto, cantidad FROM pedidositems WHERE codigoPedido = ?',
                        [req.params.id]
                    );

                    for (const item of items) {
                        await query(
                            'UPDATE productos SET stock = stock + ? WHERE codigo = ? AND codigoEmpresa = ?',
                            [item.cantidad, item.codigoProducto, req.user.codigoEmpresa]
                        );
                        console.log(`   📦 Stock restaurado para producto ${item.codigoProducto}: +${item.cantidad}`);
                    }
                }
            }

            // Para otros estados, solo actualizar estado y vendedor
            await query(
                'UPDATE pedidos SET estado = ?, codigoVendedorEntrega = ? WHERE codigo = ? AND codigoEmpresa = ?',
                [estado, req.user.vendedorId, req.params.id, req.user.codigoEmpresa]
            );
        }

        res.json({ success: true });

    } catch (error) {
        console.error('❌ Error actualizando estado del pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar zona de pedido (y del cliente asociado)
router.put('/:id/zona', verifyToken, async (req, res) => {
    try {
        const { zona } = req.body;
        const pedidoId = req.params.id;

        // Obtener el cliente del pedido y su zona actual
        const pedido = await query(
            'SELECT codigoCliente FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const codigoCliente = pedido[0].codigoCliente;
        let zonaAnterior = null;
        if (codigoCliente != null) {
            const cliente = await query(
                'SELECT zona FROM clientes WHERE codigo = ? AND codigoEmpresa = ?',
                [codigoCliente, req.user.codigoEmpresa]
            );
            zonaAnterior = cliente.length > 0 ? cliente[0].zona : null;
        }

        await query(
            'UPDATE pedidos SET zona = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [zona, pedidoId, req.user.codigoEmpresa]
        );

        if (codigoCliente != null) {
            await query(
                'UPDATE clientes SET zona = ? WHERE codigo = ? AND codigoEmpresa = ?',
                [zona, codigoCliente, req.user.codigoEmpresa]
            );
            try {
                await actualizarRutasPorCambioZona(req.user.codigoEmpresa, Number(codigoCliente), zonaAnterior, zona);
            } catch (err) {
                console.error('⚠️ Error actualizando rutas por cambio de zona:', err.message);
            }
        }

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Programar fecha de entrega de pedido
router.put('/:id/programar', verifyToken, async (req, res) => {
    try {
        const { fechaProgramada } = req.body;
        const pedidoId = req.params.id;

        console.log(`📅 Programando entrega para pedido ${pedidoId}:`, fechaProgramada);

        // Validar que se proporcione una fecha
        if (!fechaProgramada) {
            return res.status(400).json({ error: 'La fecha programada es requerida' });
        }

        // Validar que la fecha sea válida
        const fecha = new Date(fechaProgramada);
        if (isNaN(fecha.getTime())) {
            return res.status(400).json({ error: 'La fecha programada no es válida' });
        }

        // Verificar que el pedido existe y pertenece a la empresa
        const pedido = await query(
            'SELECT codigo, estado FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Verificar que el pedido no esté entregado o anulado
        if (pedido[0].estado === 'entregad' || pedido[0].estado === 'anulado') {
            return res.status(400).json({ error: 'No se puede programar un pedido entregado o anulado' });
        }

        // Actualizar la fecha programada
        await query(
            'UPDATE pedidos SET FechaProgramada = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [fechaProgramada, pedidoId, req.user.codigoEmpresa]
        );

        console.log(`✅ Pedido ${pedidoId} programado para: ${fechaProgramada}`);
        res.json({ success: true, fechaProgramada });

    } catch (error) {
        console.error('❌ Error programando pedido:', error);
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
                p.esRetornable,
                (pi.cantidad * p.precio) as subtotal
            FROM pedidositems pi
            JOIN productos p ON pi.codigoProducto = p.codigo
            WHERE pi.codigoPedido = ? AND p.activo = 1
            ORDER BY p.descripcion
        `, [pedidoId]);

        console.log(`✅ Items encontrados: ${items.length}`);
        res.json(items);

    } catch (error) {
        console.error('❌ Error obteniendo items del pedido:', error);
        res.status(500).json({ error: error.message });
    }
});

// Entregar pedido
router.post('/:id/entregar', verifyToken, async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const {
            tipoPago,
            montoCobrado,
            retornablesDevueltos,
            totalRetornables,
            totalPedido,
            usarSaldoAFavor
        } = req.body;

        const montoCobradoNum = parseFloat(montoCobrado) || 0;
        const totalPedidoNum = parseFloat(totalPedido) || 0;
        const pagoConSaldoAFavor = Boolean(usarSaldoAFavor);

        console.log('🚚 Procesando entrega del pedido:', pedidoId);
        console.log('📋 Datos de entrega:', { tipoPago, montoCobrado: montoCobradoNum, retornablesDevueltos, totalRetornables, totalPedido: totalPedidoNum, usarSaldoAFavor: pagoConSaldoAFavor });

        // Verificar que el pedido existe y pertenece a la empresa
        const pedido = await query(
            'SELECT p.*, c.codigo as clienteId FROM pedidos p JOIN clientes c ON p.codigoCliente = c.codigo WHERE p.codigo = ? AND p.codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoData = pedido[0];
        const clienteId = pedidoData.clienteId;

        console.log('🔍 DATOS DEL PEDIDO:');
        console.log(`   📋 Pedido ID: ${pedidoId}`);
        console.log(`   👤 Cliente ID: ${clienteId}`);
        console.log(`   💰 Total: $${pedidoData.total}`);
        console.log(`   🏢 Empresa: ${req.user.codigoEmpresa}`);

        // Verificar que el pedido esté pendiente
        if (pedidoData.estado !== 'pendient') {
            return res.status(400).json({ error: 'Solo se pueden entregar pedidos pendientes' });
        }

        console.log('✅ Pedido válido para entrega');

        // Obtener información del tipo de pago
        const tipoPagoInfo = await query(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [tipoPago, req.user.codigoEmpresa]
        );

        if (tipoPagoInfo.length === 0) {
            return res.status(400).json({ error: 'Tipo de pago no encontrado' });
        }

        const tipoPagoData = tipoPagoInfo[0];
        console.log('💳 TIPO DE PAGO CONSULTADO:');
        console.log(`   📋 ID: ${tipoPagoData.id}`);
        console.log(`   💳 Nombre: ${tipoPagoData.pago}`);
        console.log(`   💰 aplicaSaldo raw:`, tipoPagoData.aplicaSaldo);
        console.log(`   💰 aplicaSaldo tipo:`, typeof tipoPagoData.aplicaSaldo);

        // Función helper para convertir aplicaSaldo
        function convertirAplicaSaldo(valor) {
            console.log('🔄 CONVIRTIENDO aplicaSaldo:');
            console.log(`   📝 Valor recibido:`, valor);
            console.log(`   📝 Tipo:`, typeof valor);

            if (valor === null || valor === undefined) {
                console.log(`   ❌ Valor es null/undefined, retornando false`);
                return false;
            }

            if (typeof valor === 'object' && valor.type === 'Buffer') {
                // Es un Buffer de MySQL BIT
                const resultado = valor.data[0] === 1;
                console.log(`   🔄 Es Buffer, data[0]: ${valor.data[0]}, resultado: ${resultado}`);
                return resultado;
            } else if (typeof valor === 'number') {
                // Es un número
                const resultado = valor === 1;
                console.log(`   🔄 Es número, valor: ${valor}, resultado: ${resultado}`);
                return resultado;
            } else if (typeof valor === 'string') {
                // Es un string
                const resultado = parseInt(valor) === 1;
                console.log(`   🔄 Es string, valor: "${valor}", resultado: ${resultado}`);
                return resultado;
            } else if (typeof valor === 'boolean') {
                // Es un boolean
                console.log(`   🔄 Es boolean, valor: ${valor}`);
                return valor;
            }

            console.log(`   ❌ Tipo no reconocido, retornando false`);
            return false;
        }

        // Verificación adicional
        if (tipoPagoData.aplicaSaldo && typeof tipoPagoData.aplicaSaldo === 'object' && tipoPagoData.aplicaSaldo.type === 'Buffer') {
            console.log(`   🔍 VERIFICACIÓN ADICIONAL: Buffer data[0] = ${tipoPagoData.aplicaSaldo.data[0]}`);
            if (tipoPagoData.aplicaSaldo.data[0] === 1) {
                console.log(`   ✅ Confirmado: aplicaSaldo debería ser true`);
            } else {
                console.log(`   ❌ Confirmado: aplicaSaldo debería ser false`);
            }
        }

        // Forzar conversión directa para Buffer de MySQL
        let aplicaSaldo = false;
        if (tipoPagoData.aplicaSaldo && typeof tipoPagoData.aplicaSaldo === 'object') {
            // Es un Buffer de MySQL
            aplicaSaldo = tipoPagoData.aplicaSaldo[0] === 1;
            console.log(`   🔄 Conversión directa: Buffer[0] = ${tipoPagoData.aplicaSaldo[0]}, resultado = ${aplicaSaldo}`);
        } else {
            console.log(`   ❌ No es Buffer, usando conversión por función`);
            aplicaSaldo = convertirAplicaSaldo(tipoPagoData.aplicaSaldo);
        }

        console.log(`   💰 aplicaSaldo final: ${aplicaSaldo}`);

        console.log('🚚 DATOS DE ENTREGA:');
        console.log(`   📋 Pedido: ${pedidoId}`);
        console.log(`   💳 Tipo de pago: ${tipoPagoData.pago} (ID: ${tipoPago})`);
        console.log(`   💰 Aplica saldo: ${aplicaSaldo}`);
        console.log(`   💵 Total pedido: $${totalPedidoNum}`);
        console.log(`   🔄 Retornables: ${totalRetornables} total, ${retornablesDevueltos} devueltos`);

        // Ejecutar transacción
        const result = await transaction(async (transactionQuery) => {
            console.log('🔄 INICIANDO TRANSACCIÓN...');
            console.log(`   📋 Pedido: ${pedidoId}`);
            console.log(`   👤 Cliente: ${clienteId}`);
            console.log(`   💰 Aplica saldo: ${aplicaSaldo}`);
            console.log(`   💵 Total pedido: ${totalPedidoNum}`);
            console.log(`   🔄 Retornables: ${totalRetornables} total, ${retornablesDevueltos} devueltos`);

            // Verificar estado inicial del cliente
            const clienteInicial = await transactionQuery(
                'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
                [clienteId]
            );
            console.log(`💳 ESTADO INICIAL cliente ${clienteId}:`, {
                saldo: clienteInicial[0]?.saldo || 0,
                retornables: clienteInicial[0]?.retornables || 0
            });

            // 1. Marcar pedido como entregado
            await transactionQuery(
                'UPDATE pedidos SET estado = "entregad", fechaEntrega = NOW() WHERE codigo = ?',
                [pedidoId]
            );
            console.log('✅ Pedido marcado como entregado');

            // 2. Procesar pago
            if (aplicaSaldo) {
                console.log(`💳 PROCESANDO CUENTA CORRIENTE...`);
                console.log(`   💰 Sumando $${totalPedidoNum} al saldo del cliente ${clienteId}`);

                // Cuenta corriente: sumar al saldo del cliente
                const resultadoSaldo = await transactionQuery(
                    'UPDATE clientes SET saldo = saldo + ? WHERE codigo = ?',
                    [totalPedidoNum, clienteId]
                );
                console.log(`   ✅ Resultado UPDATE saldo:`, resultadoSaldo);

                // Verificar saldo después de la actualización
                const clienteDespuesSaldo = await transactionQuery(
                    'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
                    [clienteId]
                );
                console.log(`   💳 Saldo después de actualización: $${clienteDespuesSaldo[0]?.saldo || 0}`);

            } else if (pagoConSaldoAFavor && montoCobradoNum === 0) {
                console.log(`💳 PAGO CON SALDO A FAVOR...`);
                // Usar crédito del cliente para pagar el pedido: saldo = saldo + totalPedido (reduce el crédito)
                await transactionQuery(
                    'UPDATE clientes SET saldo = saldo + ? WHERE codigo = ?',
                    [totalPedidoNum, clienteId]
                );
                console.log(`   💰 Crédito aplicado: $${totalPedidoNum} al pedido (saldo del cliente actualizado)`);

            } else {
                console.log(`💰 PROCESANDO PAGO INMEDIATO...`);
                // Pago inmediato: registrar cobro y descontar del saldo del cliente
                const codigoCobro = Date.now().toString().slice(-6) + clienteId.toString().padStart(3, '0');
                await transactionQuery(
                    'INSERT INTO cobros (codigo, codigoCliente, codigoVendedor, codigoEmpresa, total, pagoTipo, fechaCobro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [codigoCobro, clienteId, req.user.vendedorId, req.user.codigoEmpresa, montoCobradoNum, tipoPago]
                );
                console.log(`💰 Cobro registrado: $${montoCobradoNum} (código: ${codigoCobro})`);
                // El cobro primero paga el pedido; el resto reduce la deuda (o genera crédito)
                // saldo_nuevo = saldo_viejo + totalPedido - montoCobrado
                await transactionQuery(
                    'UPDATE clientes SET saldo = saldo + ? - ? WHERE codigo = ?',
                    [totalPedidoNum, montoCobradoNum, clienteId]
                );
                console.log(`   💳 Saldo del cliente actualizado: +$${totalPedidoNum} - $${montoCobradoNum}`);
            }

            // 3. Procesar retornables (delta = total del pedido - devueltos; puede ser negativo = saldo a favor)
            const totalRetornablesNum = Number(totalRetornables) || 0;
            const retornablesDevueltosNum = Number(retornablesDevueltos) || 0;
            if (totalRetornablesNum > 0 || retornablesDevueltosNum > 0) {
                const deltaRetornables = totalRetornablesNum - retornablesDevueltosNum;
                console.log(`🔄 PROCESANDO RETORNABLES...`);
                console.log(`   📦 Total pedido: ${totalRetornablesNum}, Devueltos: ${retornablesDevueltosNum}, Delta: ${deltaRetornables}`);

                const resultadoRetornables = await transactionQuery(
                    'UPDATE clientes SET retornables = COALESCE(retornables, 0) + ? WHERE codigo = ?',
                    [deltaRetornables, clienteId]
                );
                console.log(`   ✅ Resultado UPDATE retornables:`, resultadoRetornables);

                const clienteDespuesRetornables = await transactionQuery(
                    'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
                    [clienteId]
                );
                console.log(`   🔄 Retornables después de actualización: ${clienteDespuesRetornables[0]?.retornables ?? 0}`);
            } else {
                console.log(`🔄 No hay retornables en esta entrega`);
            }

            console.log('✅ TRANSACCIÓN COMPLETADA');

            return {
                success: true,
                message: 'Pedido entregado correctamente',
                pedidoId: pedidoId,
                tipoPago: tipoPago,
                montoCobrado: aplicaSaldo ? 0 : (pagoConSaldoAFavor ? 0 : montoCobradoNum),
                retornablesDevueltos: retornablesDevueltos,
                retornablesNoDevueltos: totalRetornables - (retornablesDevueltos || 0),
                aplicaSaldo: aplicaSaldo,
                usarSaldoAFavor: pagoConSaldoAFavor
            };
        });

        // Verificar resultado final
        const clienteFinal = await query(
            'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
            [clienteId]
        );

        console.log('🎉 ENTREGA COMPLETADA:');
        console.log(`   📋 Pedido #${pedidoId} entregado`);
        console.log(`   💳 Cliente ${clienteId}: saldo $${clienteFinal[0]?.saldo || 0}, retornables ${clienteFinal[0]?.retornables || 0}`);

        res.json(result);

    } catch (error) {
        console.error('❌ Error procesando entrega:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;