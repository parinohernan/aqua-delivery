const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener clientes de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search } = req.query;

        // Intentar consulta con columnas de ubicación, si falla usar consulta sin ellas
        let sql = `
            SELECT
                codigo as id,
                codigo,
                nombre,
                apellido,
                telefono,
                direccion,
                zona,
                saldo,
                retornables,
                NULL as latitud,
                NULL as longitud,
                activo,
                codigoEmpresa,
                CONCAT(nombre, ' ', IFNULL(apellido, '')) as nombreCompleto
            FROM clientes
            WHERE codigoEmpresa = ? AND activo = 1
        `;
        
        // Intentar determinar si las columnas existen
        let hasLocationColumns = false;
        try {
            const testQuery = await query('SELECT latitud, longitud FROM clientes LIMIT 1');
            hasLocationColumns = true;
            console.log('🗺️ Columnas de ubicación disponibles');
            
            // Usar consulta con columnas reales
            sql = `
                SELECT
                    codigo as id,
                    codigo,
                    nombre,
                    apellido,
                    telefono,
                    direccion,
                    zona,
                    saldo,
                    retornables,
                    latitud,
                    longitud,
                    activo,
                    codigoEmpresa,
                    CONCAT(nombre, ' ', IFNULL(apellido, '')) as nombreCompleto
                FROM clientes
                WHERE codigoEmpresa = ? AND activo = 1
            `;
        } catch (error) {
            console.log('⚠️ Columnas de ubicación no disponibles, usando valores NULL');
        }
        let params = [req.user.codigoEmpresa];

        if (search) {
            sql += ' AND (nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY nombre, apellido';

        console.log('👥 Obteniendo clientes para empresa:', req.user.codigoEmpresa);
        if (search) {
            console.log('🔍 Búsqueda:', search);
        }

        const clientes = await query(sql, params);

        console.log('✅ Clientes encontrados:', clientes.length);
        if (clientes.length > 0) {
            console.log('📋 Columnas disponibles:', Object.keys(clientes[0]));
            console.log('📋 Primer cliente:', clientes[0]);
        }

        res.json(clientes);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener cliente específico por ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        console.log('👤 Obteniendo cliente:', req.params.id);

        // Intentar consulta con columnas de ubicación
        let sql = `
            SELECT
                codigo as id,
                codigo,
                nombre,
                apellido,
                telefono,
                direccion,
                zona,
                saldo,
                retornables,
                NULL as latitud,
                NULL as longitud,
                activo,
                codigoEmpresa
            FROM clientes
            WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1
        `;
        
        // Intentar determinar si las columnas existen
        let hasLocationColumns = false;
        try {
            const testQuery = await query('SELECT latitud, longitud FROM clientes LIMIT 1');
            hasLocationColumns = true;
            console.log('🗺️ Columnas de ubicación disponibles');
            
            // Usar consulta con columnas reales
            sql = `
                SELECT
                    codigo as id,
                    codigo,
                    nombre,
                    apellido,
                    telefono,
                    direccion,
                    zona,
                    saldo,
                    retornables,
                    latitud,
                    longitud,
                    activo,
                    codigoEmpresa
                FROM clientes
                WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1
            `;
        } catch (error) {
            console.log('⚠️ Columnas de ubicación no disponibles, usando valores NULL');
        }

        const cliente = await query(sql, [req.params.id, req.user.codigoEmpresa]);

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        console.log('✅ Cliente encontrado:', cliente[0]);
        res.json(cliente[0]);
        
    } catch (error) {
        console.error('❌ Error obteniendo cliente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Crear cliente
router.post('/', verifyToken, async (req, res) => {
    try {
        const { nombre, apellido, direccion, zona, telefono, saldoDinero, saldoRetornables, latitud, longitud } = req.body;

        console.log('👤 Creando cliente:', { nombre, apellido, telefono, direccion, zona, saldoDinero, saldoRetornables, latitud, longitud });

        // Verificar si las columnas latitud y longitud existen
        let hasLocationColumns = false;
        try {
            const tableInfo = await query('DESCRIBE clientes');
            hasLocationColumns = tableInfo.some(col => col.Field === 'latitud') && 
                               tableInfo.some(col => col.Field === 'longitud');
        } catch (error) {
            console.log('⚠️ No se pudo verificar estructura de tabla para crear cliente');
        }

        // Incluir coordenadas si están disponibles y la tabla las soporta
        let sql, params;
        if (hasLocationColumns && latitud !== null && longitud !== null && latitud !== undefined && longitud !== undefined) {
            sql = 'INSERT INTO clientes (nombre, apellido, direccion, zona, telefono, saldo, retornables, latitud, longitud, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)';
            params = [nombre, apellido, direccion, zona || null, telefono, saldoDinero || 0, saldoRetornables || 0, latitud, longitud, req.user.codigoEmpresa];
        } else {
            sql = 'INSERT INTO clientes (nombre, apellido, direccion, zona, telefono, saldo, retornables, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)';
            params = [nombre, apellido, direccion, zona || null, telefono, saldoDinero || 0, saldoRetornables || 0, req.user.codigoEmpresa];
        }

        const result = await query(sql, params);
        
        const cliente = await query(
            'SELECT * FROM clientes WHERE codigo = ? AND codigoEmpresa = ?',
            [result.insertId, req.user.codigoEmpresa]
        );
        
        res.json(cliente[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar cliente
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { nombre, apellido, direccion, zona, telefono, saldoDinero, saldoRetornables, latitud, longitud } = req.body;

        console.log('👤 Actualizando cliente:', req.params.id, { nombre, apellido, telefono, direccion, zona, saldoDinero, saldoRetornables, latitud, longitud });

        // Verificar si las columnas latitud y longitud existen
        let hasLocationColumns = false;
        try {
            const tableInfo = await query('DESCRIBE clientes');
            hasLocationColumns = tableInfo.some(col => col.Field === 'latitud') && 
                               tableInfo.some(col => col.Field === 'longitud');
        } catch (error) {
            console.log('⚠️ No se pudo verificar estructura de tabla para actualizar cliente');
        }

        // Incluir coordenadas si están disponibles y la tabla las soporta
        let sql, params;
        if (hasLocationColumns && latitud !== null && longitud !== null && latitud !== undefined && longitud !== undefined) {
            sql = 'UPDATE clientes SET nombre = ?, apellido = ?, direccion = ?, zona = ?, telefono = ?, saldo = ?, retornables = ?, latitud = ?, longitud = ? WHERE codigo = ? AND codigoEmpresa = ?';
            params = [nombre, apellido, direccion, zona || null, telefono, saldoDinero || 0, saldoRetornables || 0, latitud, longitud, req.params.id, req.user.codigoEmpresa];
        } else {
            sql = 'UPDATE clientes SET nombre = ?, apellido = ?, direccion = ?, zona = ?, telefono = ?, saldo = ?, retornables = ? WHERE codigo = ? AND codigoEmpresa = ?';
            params = [nombre, apellido, direccion, zona || null, telefono, saldoDinero || 0, saldoRetornables || 0, req.params.id, req.user.codigoEmpresa];
        }

        const updateResult = await query(sql, params);
        console.log('✅ Cliente actualizado. Filas afectadas:', updateResult.affectedRows);
        
        const cliente = await query(
            'SELECT * FROM clientes WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json(cliente[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Devolver retornables de un cliente
router.post('/retornables/devolver', verifyToken, async (req, res) => {
    try {
        const { clienteId, productoId, cantidad, observaciones } = req.body;

        console.log('🔄 Procesando devolución de retornables:', { clienteId, productoId, cantidad, observaciones });

        // Validar datos
        if (!clienteId || !productoId || !cantidad || cantidad <= 0) {
            return res.status(400).json({ error: 'Datos inválidos para la devolución' });
        }

        // Verificar que el cliente existe y pertenece a la empresa
        const cliente = await query(
            'SELECT codigo, nombre, apellido, retornables FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar que el producto existe y es retornable
        const producto = await query(
            'SELECT codigo, descripcion, esRetornable FROM productos WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [productoId, req.user.codigoEmpresa]
        );

        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        if (!producto[0].esRetornable) {
            return res.status(400).json({ error: 'El producto no es retornable' });
        }

        // Verificar que el cliente tiene suficientes retornables
        const retornablesActuales = parseInt(cliente[0].retornables || 0);
        if (retornablesActuales < cantidad) {
            return res.status(400).json({ 
                error: `El cliente solo tiene ${retornablesActuales} retornables, no puede devolver ${cantidad}` 
            });
        }

        // Usar transacción para garantizar consistencia
        const { transaction } = require('../config/database');

        await transaction(async (transactionQuery) => {
            // Actualizar retornables del cliente
            const nuevosRetornables = retornablesActuales - cantidad;
            await transactionQuery(
                'UPDATE clientes SET retornables = ? WHERE codigo = ?',
                [nuevosRetornables, clienteId]
            );

            // Registrar la devolución en la tabla de pagos (sin pedido asociado)
            await transactionQuery(
                'INSERT INTO pagos (clienteId, monto, metodoPago, observaciones, fechaPago) VALUES (?, ?, ?, ?, NOW())',
                [clienteId, 0, 'Devolución Retornables', `Devolución: ${cantidad} ${producto[0].descripcion} - ${observaciones || 'Sin observaciones'}`]
            );
        });

        // Obtener datos actualizados del cliente
        const clienteActualizado = await query(
            'SELECT retornables FROM clientes WHERE codigo = ?',
            [clienteId]
        );

        const nombreCompleto = `${cliente[0].nombre} ${cliente[0].apellido || ''}`.trim();

        console.log('✅ Devolución procesada exitosamente');

        res.json({
            success: true,
            message: 'Devolución registrada exitosamente',
            clienteNombre: nombreCompleto,
            productoNombre: producto[0].descripcion,
            cantidad: cantidad,
            retornablesAnteriores: retornablesActuales,
            nuevosRetornables: clienteActualizado[0].retornables,
            fechaDevolucion: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error procesando devolución de retornables:', error);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar cliente (soft delete - marcar como inactivo)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const clienteId = req.params.id;

        console.log('🗑️ Eliminando cliente:', clienteId);

        // Verificar que el cliente existe y pertenece a la empresa
        const cliente = await query(
            'SELECT codigo, nombre, apellido FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo = 1',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar si el cliente tiene pedidos activos
        const pedidosActivos = await query(
            'SELECT COUNT(*) as count FROM pedidos WHERE clienteId = ? AND estado != "Entregado" AND estado != "Cancelado"',
            [clienteId]
        );

        if (pedidosActivos[0].count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar el cliente porque tiene pedidos activos' 
            });
        }

        // Soft delete - marcar como inactivo
        await query(
            'UPDATE clientes SET activo = 0 WHERE codigo = ? AND codigoEmpresa = ?',
            [clienteId, req.user.codigoEmpresa]
        );

        const nombreCompleto = `${cliente[0].nombre} ${cliente[0].apellido || ''}`.trim();

        console.log('✅ Cliente eliminado exitosamente:', nombreCompleto);

        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente',
            clienteNombre: nombreCompleto
        });

    } catch (error) {
        console.error('❌ Error eliminando cliente:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alternar estado activo/inactivo de un cliente
router.put('/:id/toggle-status', verifyToken, async (req, res) => {
    try {
        const clienteId = req.params.id;
        const { activo } = req.body; // 1 o 0

        if (typeof activo === 'undefined') {
            return res.status(400).json({ error: 'Falta el campo activo' });
        }

        // Verificar que el cliente existe y pertenece a la empresa
        const cliente = await query(
            'SELECT codigo, activo FROM clientes WHERE codigo = ? AND codigoEmpresa = ? AND activo IN (0,1)',
            [clienteId, req.user.codigoEmpresa]
        );

        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        await query(
            'UPDATE clientes SET activo = ? WHERE codigo = ? AND codigoEmpresa = ? ',
            [activo ? 1 : 0, clienteId, req.user.codigoEmpresa]
        );

        // Verificar columnas disponibles para la consulta de actualización
        let hasLocationColumns = false;
        try {
            const tableInfo = await query('DESCRIBE clientes');
            hasLocationColumns = tableInfo.some(col => col.Field === 'latitud') && 
                               tableInfo.some(col => col.Field === 'longitud');
        } catch (error) {
            console.log('⚠️ No se pudo verificar estructura de tabla');
        }

        const actualizado = await query(
            `SELECT codigo as id, codigo, nombre, apellido, telefono, direccion, zona, saldo, retornables, ${hasLocationColumns ? 'latitud, longitud,' : 'NULL as latitud, NULL as longitud,'} activo FROM clientes WHERE codigo = ? AND codigoEmpresa = ? LIMIT 1`,
            [clienteId, req.user.codigoEmpresa]
        );

        res.json({ success: true, cliente: actualizado[0] });
    } catch (error) {
        console.error('❌ Error alternando estado de cliente:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;