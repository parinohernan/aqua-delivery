const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener zonas de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const zonas = await query(
            'SELECT * FROM zonas WHERE codigoEmpresa = ? AND activo = 1 ORDER BY nombre',
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
        const { nombre, descripcion, costoEnvio } = req.body;
        
        const result = await query(
            'INSERT INTO zonas (nombre, descripcion, costoEnvio, codigoEmpresa) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, costoEnvio, req.user.codigoEmpresa]
        );
        
        const zona = await query(
            'SELECT * FROM zonas WHERE codigo = ? AND codigoEmpresa = ?',
            [result.insertId, req.user.codigoEmpresa]
        );
        
        res.json(zona[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar zona
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { nombre, descripcion, costoEnvio } = req.body;
        
        await query(
            'UPDATE zonas SET nombre = ?, descripcion = ?, costoEnvio = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [nombre, descripcion, costoEnvio, req.params.id, req.user.codigoEmpresa]
        );
        
        const zona = await query(
            'SELECT * FROM zonas WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json(zona[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar zona (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await query(
            'UPDATE zonas SET activo = 0 WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json({ message: 'Zona eliminada correctamente' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
