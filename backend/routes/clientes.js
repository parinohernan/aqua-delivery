const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Obtener clientes de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const { search } = req.query;

        let sql = `
            SELECT
                codigo as id,
                codigo,
                nombre,
                apellido,
                telefono,
                direccion,
                saldo,
                retornables,
                latitud,
                longitud,
                activo,
                codigoEmpresa,
                CONCAT(nombre, ' ', IFNULL(apellido, '')) as nombreCompleto
            FROM clientes
            WHERE codigoEmpresa = ? AND activo = 1
        `;
        let params = [req.user.codigoEmpresa];

        if (search) {
            sql += ' AND (nombre LIKE ? OR apellido LIKE ? OR telefono LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY nombre, apellido';

        console.log('👥 Obteniendo clientes para empresa:', req.user.codigoEmpresa);
        if (search) {
            console.log('🔍 Búsqueda:', search);
        }

        const clientes = await query(sql, params);

        console.log('✅ Clientes encontrados:', clientes.length);
        if (clientes.length > 0) {
            console.log('📋 Columnas disponibles:', Object.keys(clientes[0]));
            console.log('📋 Primer cliente:', clientes[0]);
        }

        res.json(clientes);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear cliente
router.post('/', verifyToken, async (req, res) => {
    try {
        const { nombre, apellido, direccion, telefono, saldoDinero, saldoRetornables, latitud, longitud } = req.body;

        console.log('👤 Creando cliente:', { nombre, apellido, telefono, direccion, saldoDinero, saldoRetornables, latitud, longitud });

        // Incluir coordenadas si están disponibles
        let sql, params;
        if (latitud !== null && longitud !== null && latitud !== undefined && longitud !== undefined) {
            sql = 'INSERT INTO clientes (nombre, apellido, direccion, telefono, saldo, retornables, latitud, longitud, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)';
            params = [nombre, apellido, direccion, telefono, saldoDinero || 0, saldoRetornables || 0, latitud, longitud, req.user.codigoEmpresa];
        } else {
            sql = 'INSERT INTO clientes (nombre, apellido, direccion, telefono, saldo, retornables, codigoEmpresa, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)';
            params = [nombre, apellido, direccion, telefono, saldoDinero || 0, saldoRetornables || 0, req.user.codigoEmpresa];
        }

        const result = await query(sql, params);
        
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
        const { nombre, apellido, direccion, telefono, saldoDinero, saldoRetornables, latitud, longitud } = req.body;

        console.log('👤 Actualizando cliente:', req.params.id, { nombre, apellido, telefono, direccion, saldoDinero, saldoRetornables, latitud, longitud });

        // Incluir coordenadas si están disponibles
        let sql, params;
        if (latitud !== null && longitud !== null && latitud !== undefined && longitud !== undefined) {
            sql = 'UPDATE clientes SET nombre = ?, apellido = ?, direccion = ?, telefono = ?, saldo = ?, retornables = ?, latitud = ?, longitud = ? WHERE codigo = ? AND codigoEmpresa = ?';
            params = [nombre, apellido, direccion, telefono, saldoDinero || 0, saldoRetornables || 0, latitud, longitud, req.params.id, req.user.codigoEmpresa];
        } else {
            sql = 'UPDATE clientes SET nombre = ?, apellido = ?, direccion = ?, telefono = ?, saldo = ?, retornables = ? WHERE codigo = ? AND codigoEmpresa = ?';
            params = [nombre, apellido, direccion, telefono, saldoDinero || 0, saldoRetornables || 0, req.params.id, req.user.codigoEmpresa];
        }

        await query(sql, params);
        
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