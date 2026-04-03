const express = require('express');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

/** Convierte valor MySQL (Date o string) a Date; evita NaN. */
function toDate(value) {
    if (value == null) return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** Garantiza inicio <= fin para consultas BETWEEN (evita rango vacío si hay desajuste de reloj/TZ). */
function orderRangeForBetween(inicio, fin) {
    const a = toDate(inicio);
    const b = toDate(fin);
    if (!a || !b) return [a, b];
    return a.getTime() <= b.getTime() ? [a, b] : [b, a];
}

/**
 * Obtener la sesión de caja activa del vendedor
 */
router.get('/active', verifyToken, async (req, res) => {
    try {
        const rows = await query(
            'SELECT * FROM cajas WHERE vendedorId = ? AND codigoEmpresa = ? AND estado = "abierta" ORDER BY fechaApertura DESC LIMIT 1',
            [req.user.vendedorId, req.user.codigoEmpresa]
        );
        
        if (rows.length === 0) {
            return res.json({ active: false });
        }
        
        res.json({ active: true, session: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Abrir una nueva sesión de caja
 */
router.post('/open', verifyToken, async (req, res) => {
    try {
        const { montoInicial } = req.body;

        // Verificar si ya hay una caja abierta
        const activa = await query(
            'SELECT id FROM cajas WHERE vendedorId = ? AND codigoEmpresa = ? AND estado = "abierta"',
            [req.user.vendedorId, req.user.codigoEmpresa]
        );

        if (activa.length > 0) {
            return res.status(400).json({ error: 'Ya tienes una sesión de caja abierta' });
        }

        const result = await query(
            'INSERT INTO cajas (vendedorId, codigoEmpresa, montoInicial, fechaApertura, estado) VALUES (?, ?, ?, NOW(), "abierta")',
            [req.user.vendedorId, req.user.codigoEmpresa, montoInicial || 0]
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Obtener resumen de la caja (Cobros vs Gastos)
 */
router.get('/summary/:sessionId', verifyToken, async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        // 1. Obtener datos de la caja
        const caja = await query(
            'SELECT * FROM cajas WHERE id = ? AND codigoEmpresa = ?',
            [sessionId, req.user.codigoEmpresa]
        );

        if (caja.length === 0) {
            return res.status(404).json({ error: 'Caja no encontrada' });
        }

        const session = caja[0];
        const apertura = toDate(session.fechaApertura) || new Date();
        const ahora = new Date();
        const cierre = toDate(session.fechaCierre);
        const esAbierta = session.estado === 'abierta';
        // Sesión abierta: siempre hasta "ahora"; ignorar fechaCierre por si quedara sucia en BD.
        const finEfectivo = esAbierta ? ahora : cierre || ahora;
        const [fechaInicio, fechaFin] = orderRangeForBetween(apertura, finEfectivo);

        console.log(
            `📊 Generando resumen para vendedor ${req.user.vendedorId} desde ${fechaInicio.toISOString()} hasta ${fechaFin.toISOString()}`
        );

        // 2. Sumar Cobros del vendedor en ese periodo (MySQL)
        const cobros = await query(
            'SELECT SUM(total) as totalCobros FROM cobros WHERE codigoVendedor = ? AND codigoEmpresa = ? AND fechaCobro BETWEEN ? AND ?',
            [req.user.vendedorId, req.user.codigoEmpresa, fechaInicio, fechaFin]
        );

        // 3. Sumar Gastos que afectan caja en ese periodo (MySQL - gastos_caja)
        const gastos = await query(
            'SELECT SUM(monto) as totalGastos FROM gastos_caja WHERE vendedorId = ? AND codigoEmpresa = ? AND fecha BETWEEN ? AND ?',
            [req.user.vendedorId, req.user.codigoEmpresa, fechaInicio, fechaFin]
        );
        
        console.log(`💰 Cobros encontrados: ${cobros[0].totalCobros || 0}, Gastos encontrados: ${gastos[0].totalGastos || 0}`);

        const totalCobros = parseFloat(cobros[0].totalCobros || 0);
        const totalGastos = parseFloat(gastos[0].totalGastos || 0);
        const balance = (parseFloat(session.montoInicial) + totalCobros) - totalGastos;

        res.json({
            montoInicial: parseFloat(session.montoInicial),
            totalCobros,
            totalGastos,
            balanceEsperado: balance,
            estado: session.estado
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Cerrar sesión de caja
 */
router.post('/close', verifyToken, async (req, res) => {
    try {
        const { sessionId, montoRealEntregado, montoFinalEsperado } = req.body;

        await query(
            'UPDATE cajas SET estado = "cerrada", fechaCierre = NOW(), montoRealEntregado = ?, montoFinalEsperado = ? WHERE id = ? AND vendedorId = ?',
            [montoRealEntregado, montoFinalEsperado, sessionId, req.user.vendedorId]
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
