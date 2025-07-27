const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener clientes de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM clientes WHERE codigoEmpresa = ? AND activo = 1';
        let params = [req.user.codigoEmpresa];
        
        if (search) {
            sql += ' AND (nombre LIKE ? OR apellido LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        sql += ' ORDER BY nombre, apellido';
        
        const clientes = await query(sql, params);
        res.json(clientes);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear cliente
router.post('/', verifyToken, async (req, res) => {
    try {
        const { nombre, apellido, descripcion, direccion, telefono } = req.body;
        
        const result = await query(
            'INSERT INTO clientes (nombre, apellido, descripcion, direccion, telefono, codigoEmpresa) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, descripcion, direccion, telefono, req.user.codigoEmpresa]
        );
        
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
        const { nombre, apellido, descripcion, direccion, telefono } = req.body;
        
        await query(
            'UPDATE clientes SET nombre = ?, apellido = ?, descripcion = ?, direccion = ?, telefono = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [nombre, apellido, descripcion, direccion, telefono, req.params.id, req.user.codigoEmpresa]
        );
        
        const cliente = await query(
            'SELECT * FROM clientes WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json(cliente[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;