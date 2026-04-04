const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

/**
 * PATCH /api/vendedores/me
 * Actualiza preferencias del vendedor autenticado (p. ej. registro_gps_periodico).
 */
router.patch('/me', verifyToken, async (req, res) => {
    try {
        const { registro_gps_periodico } = req.body || {};
        if (registro_gps_periodico === undefined) {
            return res.status(400).json({ error: 'registro_gps_periodico es requerido' });
        }
        const val = registro_gps_periodico === true || registro_gps_periodico === 1 || registro_gps_periodico === '1' ? 1 : 0;

        const upd = await query(
            `UPDATE vendedores SET registro_gps_periodico = ? WHERE codigo = ? AND codigoEmpresa = ?`,
            [val, req.user.vendedorId, req.user.codigoEmpresa]
        );

        if (upd.affectedRows === 0) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        const rows = await query(
            `SELECT v.*, e.razonSocial, e.usaEntregaProgramada, e.usaRepartoPorZona
             FROM vendedores v
             JOIN empresa e ON v.codigoEmpresa = e.codigo
             WHERE v.codigo = ? AND v.codigoEmpresa = ?`,
            [req.user.vendedorId, req.user.codigoEmpresa]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Vendedor no encontrado' });
        }

        res.json(rows[0]);
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(503).json({
                error: 'Falta la columna registro_gps_periodico. Ejecutá la migración en el servidor.',
            });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * Lista vendedores de la empresa autenticada (para filtros en GPS, etc.).
 * Excluye el usuario técnico "Auditor" (sigue pudiendo iniciar sesión vía /auth).
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const rows = await query(
            `SELECT
                codigo AS id,
                codigo,
                nombre,
                apellido,
                telegramId,
                codigoEmpresa,
                registro_gps_periodico
            FROM vendedores
            WHERE codigoEmpresa = ?
              AND LOWER(TRIM(COALESCE(nombre, ''))) <> 'auditor'
            ORDER BY nombre, apellido, codigo`,
            [req.user.codigoEmpresa]
        );
        res.json(rows);
    } catch (error) {
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(503).json({
                error: 'Falta la columna registro_gps_periodico en vendedores. Ejecutá la migración add_registro_gps_periodico_vendedores.sql',
            });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
