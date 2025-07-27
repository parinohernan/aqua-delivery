const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener productos de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM productos WHERE codigoEmpresa = ? AND activo = 1';
        let params = [req.user.codigoEmpresa];
        
        if (search) {
            sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        sql += ' ORDER BY codigo';
        
        const productos = await query(sql, params);
        res.json(productos);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
router.post('/', verifyToken, async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        
        const result = await query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, codigoEmpresa) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, precio, stock, req.user.codigoEmpresa]
        );
        
        const producto = await query(
            'SELECT * FROM productos WHERE codigo = ? AND codigoEmpresa = ?',
            [result.insertId, req.user.codigoEmpresa]
        );
        
        res.json(producto[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar producto
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock } = req.body;
        
        await query(
            'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [nombre, descripcion, precio, stock, req.params.id, req.user.codigoEmpresa]
        );
        
        const producto = await query(
            'SELECT * FROM productos WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json(producto[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar producto (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await query(
            'UPDATE productos SET activo = 0 WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );

        res.json({ message: 'Producto eliminado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
