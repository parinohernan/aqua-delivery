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
            WHERE codigoEmpresa = ?
        `;
        let params = [req.user.codigoEmpresa];

        if (search) {
            sql += ' AND descripcion LIKE ?';
            params.push(`%${search}%`);
        }

        sql += ' ORDER BY activo DESC, descripcion';
        
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
        const { descripcion, precio, stock, esRetornable, activo } = req.body;

        console.log('📝 Creando producto:', { descripcion, precio, stock, esRetornable, activo });

        const result = await query(
            'INSERT INTO productos (descripcion, precio, stock, esRetornable, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?)',
            [descripcion, precio, stock, esRetornable, req.user.codigoEmpresa, activo || 1]
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
        const { descripcion, precio, stock, esRetornable, activo } = req.body;

        console.log('📝 Actualizando producto:', req.params.id, { descripcion, precio, stock, esRetornable, activo });

        await query(
            'UPDATE productos SET descripcion = ?, precio = ?, stock = ?, esRetornable = ?, activo = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [descripcion, precio, stock, esRetornable, activo, req.params.id, req.user.codigoEmpresa]
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

// Desactivar producto (eliminación lógica)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await query(
            'UPDATE productos SET activo = 0 WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );

        res.json({ message: 'Producto desactivado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Activar producto
router.put('/:id/activate', verifyToken, async (req, res) => {
    try {
        await query(
            'UPDATE productos SET activo = 1 WHERE codigo = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );

        res.json({ message: 'Producto activado correctamente' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
