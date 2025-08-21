const express = require('express');
const { query, transaction } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener pedidos
router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('📦 Obteniendo pedidos para usuario:', req.user.telegramId);
        console.log('🏢 Código empresa:', req.user.codigoEmpresa);

        const { clienteId, fecha, zona, search, estado } = req.query;

        // Consulta base sin columnas de ubicación
        let sql = `
            SELECT p.codigo as id,
                   p.fechaPedido as fecha_pedido,
                   p.total,
                   p.estado,
                   p.zona,
                   CONCAT(c.nombre, ' ', COALESCE(c.apellido, '')) as cliente_nombre,
                   c.nombre,
                   c.apellido,
                   c.direccion,
                   c.telefono,
                   NULL as latitud,
                   NULL as longitud,
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
                       p.fechaPedido as fecha_pedido,
                       p.total,
                       p.estado,
                       p.zona,
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

        sql += ' ORDER BY p.fechaPedido DESC';
        
        console.log('📋 Ejecutando consulta SQL:', sql);
        console.log('📋 Parámetros:', params);

        const pedidos = await query(sql, params);
        console.log('✅ Pedidos encontrados:', pedidos.length);

        // Obtener detalles de cada pedido
        for (let pedido of pedidos) {
            console.log('🔍 Cargando detalles para pedido ID:', pedido.id);
            const detalles = await query(
                'SELECT pi.*, pr.descripcion, pr.precio FROM pedidositems pi JOIN productos pr ON pi.codigoProducto = pr.codigo WHERE pi.codigoPedido = ? AND pr.activo = 1',
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

        // Verificar que el cliente existe y obtener su zona
        const cliente = await query(
            'SELECT codigo, zona FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(400).json({ error: 'Cliente no encontrado' });
        }

        const clienteZona = cliente[0].zona;

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

        // Crear pedido con estado "pendient" y zona del cliente
        // Estados posibles: "pendient", "anulado", "entregad"
        const result = await query(
            'INSERT INTO pedidos (codigoEmpresa, codigoCliente, codigoVendedorPedido, total, zona, FechaPedido, estado) VALUES (?, ?, ?, ?, ?, NOW(), "pendient")',
            [req.user.codigoEmpresa, clienteId, req.user.vendedorId, total, clienteZona]
        );

        const codigoPedido = result.insertId;
        console.log('✅ Pedido creado con código:', codigoPedido);

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

// Actualizar zona de pedido
router.put('/:id/zona', verifyToken, async (req, res) => {
    try {
        const { zona } = req.body;

        await query(
            'UPDATE pedidos SET zona = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [zona, req.params.id, req.user.codigoEmpresa]
        );

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
            totalPedido
        } = req.body;

        console.log('🚚 Procesando entrega del pedido:', pedidoId);
        console.log('📋 Datos de entrega:', { tipoPago, montoCobrado, retornablesDevueltos, totalRetornables, totalPedido });

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
        console.log(`   💵 Total pedido: $${totalPedido}`);
        console.log(`   🔄 Retornables: ${totalRetornables} total, ${retornablesDevueltos} devueltos`);

        // Ejecutar transacción
        const result = await transaction(async (transactionQuery) => {
            console.log('🔄 INICIANDO TRANSACCIÓN...');
            console.log(`   📋 Pedido: ${pedidoId}`);
            console.log(`   👤 Cliente: ${clienteId}`);
            console.log(`   💰 Aplica saldo: ${aplicaSaldo}`);
            console.log(`   💵 Total pedido: ${totalPedido}`);
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
                console.log(`   💰 Sumando $${totalPedido} al saldo del cliente ${clienteId}`);
                
                // Cuenta corriente: sumar al saldo del cliente
                const resultadoSaldo = await transactionQuery(
                    'UPDATE clientes SET saldo = saldo + ? WHERE codigo = ?',
                    [totalPedido, clienteId]
                );
                console.log(`   ✅ Resultado UPDATE saldo:`, resultadoSaldo);
                
                // Verificar saldo después de la actualización
                const clienteDespuesSaldo = await transactionQuery(
                    'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
                    [clienteId]
                );
                console.log(`   💳 Saldo después de actualización: $${clienteDespuesSaldo[0]?.saldo || 0}`);
                
            } else {
                console.log(`💰 PROCESANDO PAGO INMEDIATO...`);
                // Pago inmediato: registrar cobro
                const codigoCobro = Date.now().toString().slice(-6) + clienteId.toString().padStart(3, '0');
                await transactionQuery(
                    'INSERT INTO cobros (codigo, codigoCliente, codigoVendedor, codigoEmpresa, total, pagoTipo, fechaCobro) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [codigoCobro, clienteId, req.user.vendedorId, req.user.codigoEmpresa, montoCobrado, tipoPago]
                );
                console.log(`💰 Cobro registrado: $${montoCobrado} (código: ${codigoCobro})`);
            }

            // 3. Procesar retornables
            if (totalRetornables > 0) {
                const retornablesNoDevueltos = totalRetornables - (retornablesDevueltos || 0);
                console.log(`🔄 PROCESANDO RETORNABLES...`);
                console.log(`   📦 Total: ${totalRetornables}, Devueltos: ${retornablesDevueltos}, No devueltos: ${retornablesNoDevueltos}`);

                if (retornablesNoDevueltos > 0) {
                    console.log(`   🔄 Sumando ${retornablesNoDevueltos} retornables al cliente ${clienteId}`);
                    
                    const resultadoRetornables = await transactionQuery(
                        'UPDATE clientes SET retornables = COALESCE(retornables, 0) + ? WHERE codigo = ?',
                        [retornablesNoDevueltos, clienteId]
                    );
                    console.log(`   ✅ Resultado UPDATE retornables:`, resultadoRetornables);
                    
                    // Verificar retornables después de la actualización
                    const clienteDespuesRetornables = await transactionQuery(
                        'SELECT saldo, COALESCE(retornables, 0) as retornables FROM clientes WHERE codigo = ?',
                        [clienteId]
                    );
                    console.log(`   🔄 Retornables después de actualización: ${clienteDespuesRetornables[0]?.retornables || 0}`);
                } else {
                    console.log(`   ✅ No hay retornables pendientes para agregar`);
                }
            } else {
                console.log(`🔄 No hay retornables en este pedido`);
            }

            console.log('✅ TRANSACCIÓN COMPLETADA');

            return {
                success: true,
                message: 'Pedido entregado correctamente',
                pedidoId: pedidoId,
                tipoPago: tipoPago,
                montoCobrado: aplicaSaldo ? 0 : montoCobrado,
                retornablesDevueltos: retornablesDevueltos,
                retornablesNoDevueltos: totalRetornables - (retornablesDevueltos || 0),
                aplicaSaldo: aplicaSaldo
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