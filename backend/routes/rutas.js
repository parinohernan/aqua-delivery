const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// GET /api/rutas?zona=NombreZona  -> lista { codigoCliente, orden } ordenada
router.get('/', verifyToken, async (req, res) => {
    try {
        const { zona } = req.query;
        if (!zona || !String(zona).trim()) {
            return res.status(400).json({ error: 'Parámetro zona es requerido' });
        }
        const nombreZona = String(zona).trim();
        const rows = await query(
            'SELECT codigoCliente, orden FROM rutas WHERE codigoEmpresa = ? AND zona = ? ORDER BY orden ASC',
            [req.user.codigoEmpresa, nombreZona]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/rutas/clientes?zona=NombreZona  -> clientes de esa zona con orden y pedidos pendientes
router.get('/clientes', verifyToken, async (req, res) => {
    try {
        const { zona } = req.query;
        if (!zona || !String(zona).trim()) {
            return res.status(400).json({ error: 'Parámetro zona es requerido' });
        }
        const nombreZona = String(zona).trim();
        const codigoEmpresa = req.user.codigoEmpresa;

        // Clientes de la zona con cantidad de pedidos pendientes (sin depender de tabla rutas)
        const clientes = await query(
            `SELECT c.codigo AS codigoCliente, c.nombre, c.apellido, c.direccion, c.telefono, c.zona,
                    COALESCE(c.saldo, 0) AS saldo,
                    COALESCE(c.retornables, 0) AS retornables,
                    (SELECT COUNT(*) FROM pedidos p 
                     WHERE p.codigoCliente = c.codigo AND p.codigoEmpresa = c.codigoEmpresa 
                     AND p.estado IN ('pendient', 'proceso')) AS pedidosPendientes
             FROM clientes c
             WHERE c.codigoEmpresa = ? AND c.zona = ? AND c.activo = 1
             ORDER BY c.nombre, c.apellido`,
            [codigoEmpresa, nombreZona]
        );

        // Orden de ruta (si la tabla existe)
        let ordenMap = {};
        try {
            const rutasRows = await query(
                'SELECT codigoCliente, orden FROM rutas WHERE codigoEmpresa = ? AND zona = ? ORDER BY orden ASC',
                [codigoEmpresa, nombreZona]
            );
            rutasRows.forEach((row) => { ordenMap[row.codigoCliente] = row.orden; });
        } catch (err) {
            console.warn('Rutas: tabla rutas no disponible o error:', err.message);
        }

        const clientesConOrden = clientes.map((c) => ({
            ...c,
            orden: ordenMap[c.codigoCliente] != null ? ordenMap[c.codigoCliente] : 9999,
            pedidosPendientes: Number(c.pedidosPendientes) || 0,
            saldo: parseFloat(c.saldo) || 0,
            retornables: Number.parseInt(String(c.retornables), 10) || 0,
        })).sort((a, b) => a.orden - b.orden || (a.nombre || '').localeCompare(b.nombre || ''));

        res.json(clientesConOrden);
    } catch (error) {
        console.error('Error GET /rutas/clientes:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/rutas  body: { zona, orden: [codigoCliente1, codigoCliente2, ...] }
router.put('/', verifyToken, async (req, res) => {
    try {
        const { zona, orden: ordenClientes } = req.body;
        if (!zona || !String(zona).trim()) {
            return res.status(400).json({ error: 'zona es requerida' });
        }
        const nombreZona = String(zona).trim();
        const lista = Array.isArray(ordenClientes) ? ordenClientes : [];

        await query(
            'DELETE FROM rutas WHERE codigoEmpresa = ? AND zona = ?',
            [req.user.codigoEmpresa, nombreZona]
        );

        for (let i = 0; i < lista.length; i++) {
            const codigoCliente = lista[i];
            if (codigoCliente != null) {
                await query(
                    'INSERT INTO rutas (codigoEmpresa, zona, codigoCliente, orden) VALUES (?, ?, ?, ?)',
                    [req.user.codigoEmpresa, nombreZona, codigoCliente, i]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
