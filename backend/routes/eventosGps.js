const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const { toMysqlUtcDatetime } = require('../utils/mysqlUtcDatetime');
const router = express.Router();

function parseDateParam(value, endOfDay = false) {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    if (Number.isNaN(d.getTime())) return null;
    if (endOfDay && trimmed.length <= 10) {
        d.setHours(23, 59, 59, 999);
    }
    return d;
}

function isValidCoord(lat, lng) {
    const la = Number(lat);
    const lo = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return false;
    if (la < -90 || la > 90) return false;
    if (lo < -180 || lo > 180) return false;
    return true;
}

/**
 * GET /api/eventos-gps?desde=&hasta=&codigo_vendedor=
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const { desde, hasta, codigo_vendedor: codigoVendedorQ } = req.query;
        const empresa = req.user.codigoEmpresa;

        let sql = `
            SELECT
                e.id,
                e.codigoEmpresa,
                e.codigoVendedor,
                v.nombre AS vendedorNombre,
                v.apellido AS vendedorApellido,
                e.evento,
                e.numeroPedido,
                c.apellido AS clienteApellido,
                c.nombre AS clienteNombre,
                CONCAT(DATE_FORMAT(e.ocurridoEn, '%Y-%m-%dT%H:%i:%s'), '.000Z') AS ocurridoEn,
                e.latitud,
                e.longitud,
                CONCAT(DATE_FORMAT(e.creadoEn, '%Y-%m-%dT%H:%i:%s'), '.000Z') AS creadoEn
            FROM eventos_gps e
            LEFT JOIN vendedores v ON v.codigo = e.codigoVendedor AND v.codigoEmpresa = e.codigoEmpresa
            LEFT JOIN pedidos p ON p.codigoEmpresa = e.codigoEmpresa
                AND e.numeroPedido IS NOT NULL
                AND TRIM(e.numeroPedido) <> ''
                AND TRIM(e.numeroPedido) REGEXP '^[0-9]+$'
                AND p.codigo = CAST(TRIM(e.numeroPedido) AS UNSIGNED)
            LEFT JOIN clientes c ON c.codigo = p.codigoCliente
            WHERE e.codigoEmpresa = ?
        `;
        const params = [empresa];

        const desdeD = parseDateParam(desde || '', false);
        const hastaD = parseDateParam(hasta || '', true);

        if (desdeD) {
            const s = toMysqlUtcDatetime(desdeD);
            if (s) {
                sql += ' AND e.ocurridoEn >= ?';
                params.push(s);
            }
        }
        if (hastaD) {
            const s = toMysqlUtcDatetime(hastaD);
            if (s) {
                sql += ' AND e.ocurridoEn <= ?';
                params.push(s);
            }
        }

        if (codigoVendedorQ !== undefined && codigoVendedorQ !== '' && codigoVendedorQ !== 'all') {
            const cv = parseInt(codigoVendedorQ, 10);
            if (!Number.isNaN(cv)) {
                sql += ' AND e.codigoVendedor = ?';
                params.push(cv);
            }
        }

        sql += ' ORDER BY e.ocurridoEn ASC, e.id ASC';

        const rows = await query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/eventos-gps
 * Body: evento (req), latitud, longitud, numero_pedido opcional, ocurrido_en opcional ISO
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { evento, latitud, longitud, numero_pedido, ocurrido_en } = req.body;

        const ev = typeof evento === 'string' ? evento.trim() : '';
        if (!ev || ev.length > 255) {
            return res.status(400).json({ error: 'evento es requerido (máx. 255 caracteres)' });
        }

        if (!isValidCoord(latitud, longitud)) {
            return res.status(400).json({ error: 'latitud y longitud inválidas' });
        }

        let ocurrido = new Date();
        if (ocurrido_en) {
            const parsed = new Date(ocurrido_en);
            if (!Number.isNaN(parsed.getTime())) {
                ocurrido = parsed;
            }
        }

        const numeroPedido =
            numero_pedido !== undefined && numero_pedido !== null && String(numero_pedido).trim() !== ''
                ? String(numero_pedido).trim().slice(0, 64)
                : null;

        const ocurridoSql = toMysqlUtcDatetime(ocurrido);
        if (!ocurridoSql) {
            return res.status(400).json({ error: 'ocurrido_en inválido' });
        }

        await query(
            `INSERT INTO eventos_gps (
                codigoEmpresa, codigoVendedor, evento, numeroPedido, ocurridoEn, latitud, longitud
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.codigoEmpresa,
                req.user.vendedorId,
                ev,
                numeroPedido,
                ocurridoSql,
                Number(latitud),
                Number(longitud),
            ]
        );

        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
