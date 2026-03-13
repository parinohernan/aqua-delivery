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
                imageURL,
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
        res.json(productos);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear producto
router.post('/', verifyToken, async (req, res) => {
    try {
        const { descripcion, precio, stock, esRetornable, activo, imageURL } = req.body;

        console.log('📝 Creando producto:', { descripcion, precio, stock, esRetornable, activo, imageURL });

        const result = await query(
            'INSERT INTO productos (descripcion, precio, stock, esRetornable, imageURL, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [descripcion, precio, stock, esRetornable, imageURL || null, req.user.codigoEmpresa, activo || 1]
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
        const { descripcion, precio, stock, esRetornable, activo, imageURL } = req.body;

        // Normalizar activo a 0 o 1 (puede llegar como boolean o string desde el frontend)
        const activoValue = (activo === true || activo === 1 || activo === '1') ? 1 : 0;

        console.log('📝 Actualizando producto:', req.params.id, { descripcion, precio, stock, esRetornable, activo: activoValue, imageURL });

        await query(
            'UPDATE productos SET descripcion = ?, precio = ?, stock = ?, esRetornable = ?, activo = ?, imageURL = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [descripcion, precio, stock, esRetornable ? 1 : 0, activoValue, imageURL || null, req.params.id, req.user.codigoEmpresa]
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
