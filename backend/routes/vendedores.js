const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

/**
 * Lista vendedores de la empresa autenticada (para filtros en GPS, etc.)
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
                codigoEmpresa
            FROM vendedores
            WHERE codigoEmpresa = ?
            ORDER BY nombre, apellido, codigo`,
            [req.user.codigoEmpresa]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
