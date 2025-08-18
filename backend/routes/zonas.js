const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener zonas de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const zonas = await query(
            'SELECT id, zona, codigoEmpresa, fechaCreacion FROM zonas WHERE codigoEmpresa = ? ORDER BY zona',
            [req.user.codigoEmpresa]
        );

        res.json(zonas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear zona
router.post('/', verifyToken, async (req, res) => {
    try {
        const { zona } = req.body;

        const result = await query(
            'INSERT INTO zonas (zona, codigoEmpresa) VALUES (?, ?)',
            [zona, req.user.codigoEmpresa]
        );

        const nuevaZona = await query(
            'SELECT id, zona, codigoEmpresa, fechaCreacion FROM zonas WHERE id = ? AND codigoEmpresa = ?',
            [result.insertId, req.user.codigoEmpresa]
        );

        res.json(nuevaZona[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar zona
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { zona } = req.body;

        await query(
            'UPDATE zonas SET zona = ? WHERE id = ? AND codigoEmpresa = ?',
            [zona, req.params.id, req.user.codigoEmpresa]
        );

        const zonaActualizada = await query(
            'SELECT id, zona, codigoEmpresa, fechaCreacion FROM zonas WHERE id = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );

        res.json(zonaActualizada[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar zona
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await query(
            'DELETE FROM zonas WHERE id = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );

        res.json({ message: 'Zona eliminada correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
