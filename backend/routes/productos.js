const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener productos de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `
            SELECT
                codigo as id,
                codigo,
                descripcion,
                precio,
                stock,
                esRetornable,
                activo,
                codigoEmpresa
            FROM productos
            WHERE codigoEmpresa = ? AND activo = 1
        `;
        let params = [req.user.codigoEmpresa];

        if (search) {
            sql += ' AND descripcion LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY descripcion';
        
        const productos = await query(sql, params);

        console.log('✅ Productos encontrados:', productos.length);
        if (productos.length > 0) {
            console.log('📋 Columnas disponibles:', Object.keys(productos[0]));
            console.log('📋 Primer producto:', productos[0]);
        }

        res.json(productos);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
router.post('/', verifyToken, async (req, res) => {
    try {
        const { descripcion, precio, stock, esRetornable } = req.body;

        console.log('📝 Creando producto:', { descripcion, precio, stock, esRetornable });

        const result = await query(
            'INSERT INTO productos (descripcion, precio, stock, esRetornable, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, 1)',
            [descripcion, precio, stock, esRetornable, req.user.codigoEmpresa]
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
        const { descripcion, precio, stock, esRetornable } = req.body;

        console.log('📝 Actualizando producto:', req.params.id, { descripcion, precio, stock, esRetornable });

        await query(
            'UPDATE productos SET descripcion = ?, precio = ?, stock = ?, esRetornable = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [descripcion, precio, stock, esRetornable, req.params.id, req.user.codigoEmpresa]
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
