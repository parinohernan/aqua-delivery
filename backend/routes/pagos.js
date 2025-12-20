const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener pagos de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { pedidoId } = req.query;
        let sql = `
            SELECT p.*, pe.numero as numeroPedido, c.nombre as clienteNombre, c.apellido as clienteApellido
            FROM pagos p
            JOIN pedidos pe ON p.pedidoId = pe.codigo
            JOIN clientes c ON pe.clienteId = c.codigo
            WHERE pe.codigoEmpresa = ?
        `;
        let params = [req.user.codigoEmpresa];
        
        if (pedidoId) {
            sql += ' AND p.pedidoId = ?';
            params.push(pedidoId);
        }
        
        sql += ' ORDER BY p.fechaPago DESC';
        
        const pagos = await query(sql, params);
        res.json(pagos);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear pago
router.post('/', verifyToken, async (req, res) => {
    try {
        const { pedidoId, monto, metodoPago, observaciones } = req.body;
        
        // Verificar que el pedido pertenece a la empresa
        const pedido = await query(
            'SELECT * FROM pedidos WHERE codigo = ? AND codigoEmpresa = ?',
            [pedidoId, req.user.codigoEmpresa]
        );
        
        if (pedido.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        
        const result = await query(
            'INSERT INTO pagos (pedidoId, monto, metodoPago, observaciones, fechaPago) VALUES (?, ?, ?, ?, NOW())',
            [pedidoId, monto, metodoPago, observaciones]
        );
        
        const pago = await query(
            `SELECT p.*, pe.numero as numeroPedido, c.nombre as clienteNombre, c.apellido as clienteApellido
             FROM pagos p
             JOIN pedidos pe ON p.pedidoId = pe.codigo
             JOIN clientes c ON pe.clienteId = c.codigo
             WHERE p.codigo = ?`,
            [result.insertId]
        );
        
        res.json(pago[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear pago directo a cliente (nuevo endpoint)
router.post('/cliente', verifyToken, async (req, res) => {
    try {
        const { clienteId, tipoPagoId, monto, observaciones, retornablesDevueltos } = req.body;
        
        console.log('💰 Procesando pago directo a cliente:', {
            clienteId,
            tipoPagoId,
            monto,
            observaciones,
            retornablesDevueltos: retornablesDevueltos || 0,
            empresa: req.user.codigoEmpresa
        });
        
        // Verificar que el cliente pertenece a la empresa
        const cliente = await query(
            'SELECT * FROM clientes WHERE codigo = ? AND codigoEmpresa = ?',
            [clienteId, req.user.codigoEmpresa]
        );
        
        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        // Verificar que el tipo de pago existe y NO aplica saldo
        const tipoPago = await query(
            'SELECT * FROM tiposdepago WHERE id = ?',
            [tipoPagoId]
        );
        
        if (tipoPago.length === 0) {
            return res.status(404).json({ error: 'Tipo de pago no encontrado' });
        }
        
        // Verificar que el tipo de pago NO aplica saldo
        const aplicaSaldo = tipoPago[0].aplicaSaldo && 
            (tipoPago[0].aplicaSaldo[0] === 1 || tipoPago[0].aplicaSaldo === 1);
        
        if (aplicaSaldo) {
            return res.status(400).json({ 
                error: 'No se puede usar un tipo de pago que aplica saldo para pagos directos' 
            });
        }
        
        // Validar retornables devueltos
        const retornablesADevolver = parseInt(retornablesDevueltos || 0);
        const retornablesActuales = parseInt(cliente[0].retornables || 0);
        
        // Permitir que devuelvan más retornables de los que deben (quedan a favor/a cuenta)
        // Si retornablesADevolver > retornablesActuales, el cliente queda con retornables a favor
        // Si retornablesADevolver es negativo y retornablesActuales es 0, también queda a favor
        
        // Obtener saldo actual del cliente
        const saldoActual = parseFloat(cliente[0].saldo || 0);
        const nuevoSaldo = saldoActual - monto;
        // Si retornablesADevolver es negativo, significa que el cliente entrega más de los que debe (queda a favor)
        const nuevosRetornables = retornablesActuales - retornablesADevolver;
        
        console.log('💰 Cálculo de saldo y retornables:', {
            saldoActual,
            monto,
            nuevoSaldo,
            retornablesActuales,
            retornablesADevolver,
            nuevosRetornables
        });
        
        // Usar la función transaction del módulo database
        const { transaction } = require('../config/database');
        
        await transaction(async (transactionQuery) => {
            // Actualizar saldo del cliente
            await transactionQuery(
                'UPDATE clientes SET saldo = ? WHERE codigo = ?',
                [nuevoSaldo, clienteId]
            );
            
            // Actualizar retornables del cliente si hay devolución (positiva o negativa)
            if (retornablesADevolver !== 0) {
                await transactionQuery(
                    'UPDATE clientes SET retornables = ? WHERE codigo = ?',
                    [nuevosRetornables, clienteId]
                );
                console.log(`🔄 Retornables actualizados: ${retornablesActuales} → ${nuevosRetornables}`);
            }
            
            // Registrar el pago (sin pedido asociado)
            let observacionesCompletas = '';
            if (retornablesADevolver !== 0) {
                if (retornablesADevolver > 0) {
                    observacionesCompletas = `Devolución: ${retornablesADevolver} ${retornablesADevolver === 1 ? 'envase retornable' : 'envases retornables'}`;
                } else {
                    observacionesCompletas = `Entrega de envases: ${Math.abs(retornablesADevolver)} ${Math.abs(retornablesADevolver) === 1 ? 'envase retornable' : 'envases retornables'} (a favor)`;
                }
            }
            if (observaciones && observaciones.trim()) {
                observacionesCompletas = observacionesCompletas 
                    ? `${observacionesCompletas} | ${observaciones.trim()}`
                    : observaciones.trim();
            }
            
            await transactionQuery(
                'INSERT INTO pagos (clienteId, monto, metodoPago, observaciones, fechaPago) VALUES (?, ?, ?, ?, NOW())',
                [clienteId, monto, tipoPago[0].pago, observacionesCompletas || null]
            );
        });
        
        console.log('✅ Pago procesado exitosamente');
        
        res.json({
            success: true,
            message: 'Pago registrado exitosamente',
            clienteNombre: `${cliente[0].nombre} ${cliente[0].apellido || ''}`.trim(),
            monto: monto,
            tipoPago: tipoPago[0].pago,
            saldoAnterior: saldoActual,
            nuevoSaldo: nuevoSaldo,
            retornablesAnteriores: retornablesActuales,
            retornablesDevueltos: retornablesADevolver,
            nuevosRetornables: nuevosRetornables,
            fechaPago: new Date()
        });
        
    } catch (error) {
        console.error('❌ Error procesando pago directo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar pago
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { monto, metodoPago, observaciones } = req.body;
        
        // Verificar que el pago pertenece a un pedido de la empresa
        const pagoExistente = await query(
            `SELECT p.* FROM pagos p
             JOIN pedidos pe ON p.pedidoId = pe.codigo
             WHERE p.codigo = ? AND pe.codigoEmpresa = ?`,
            [req.params.id, req.user.codigoEmpresa]
        );
        
        if (pagoExistente.length === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        
        await query(
            'UPDATE pagos SET monto = ?, metodoPago = ?, observaciones = ? WHERE codigo = ?',
            [monto, metodoPago, observaciones, req.params.id]
        );
        
        const pago = await query(
            `SELECT p.*, pe.numero as numeroPedido, c.nombre as clienteNombre, c.apellido as clienteApellido
             FROM pagos p
             JOIN pedidos pe ON p.pedidoId = pe.codigo
             JOIN clientes c ON pe.clienteId = c.codigo
             WHERE p.codigo = ?`,
            [req.params.id]
        );
        
        res.json(pago[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
