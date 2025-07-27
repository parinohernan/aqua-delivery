const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener pedidos
router.get('/', verifyToken, async (req, res) => {
    try {
        const { estado, clienteId, fecha } = req.query;
        
        let sql = `
            SELECT p.*, c.nombre, c.apellido, c.direccion,
                   v1.nombre as vendedorPedido, v2.nombre as vendedorEntrega
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
            sql += ' AND DATE(p.FechaPedido) = ?';
            params.push(fecha);
        }
        
        sql += ' ORDER BY p.FechaPedido DESC';
        
        const pedidos = await query(sql, params);
        
        // Obtener detalles de cada pedido
        for (let pedido of pedidos) {
            const detalles = await query(
                'SELECT pi.*, pr.descripcion, pr.precio FROM pedidositems pi JOIN productos pr ON pi.codigoProducto = pr.codigo WHERE pi.codigoPedido = ?',
                [pedido.codigo]
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
        const { clienteId, tipoPago, observaciones } = req.body;

        // Por ahora crear un pedido básico sin productos (se pueden agregar después)
        const total = 0; // Se calculará cuando se agreguen productos

        // Crear pedido
        const result = await query(
            'INSERT INTO pedidos (codigoEmpresa, codigoCliente, codigoVendedorPedido, total, tipoPago, FechaPedido, estado) VALUES (?, ?, ?, ?, ?, NOW(), "pendiente")',
            [req.user.codigoEmpresa, clienteId, req.user.vendedorId, total, tipoPago]
        );

        const codigoPedido = result.insertId;

        // Obtener el pedido creado con datos del cliente
        const pedidoCreado = await query(`
            SELECT p.*, c.nombre, c.apellido, c.direccion
            FROM pedidos p
            JOIN clientes c ON p.codigoCliente = c.codigo
            WHERE p.codigo = ? AND p.codigoEmpresa = ?
        `, [codigoPedido, req.user.codigoEmpresa]);

        res.json(pedidoCreado[0]);

    } catch (error) {
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

module.exports = router;