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
