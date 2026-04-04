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

/**
 * Literal MySQL DATETIME desde Date (hora local del proceso Node).
 * Evita mezclar tipos con cobros.fechaCobro almacenado como DOUBLE (YYYYMMDDHHmmss).
 */
function toMysqlDatetime(d) {
    const x = toDate(d);
    if (!x) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())} ${pad(x.getHours())}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
}

/**
 * Expresión SQL: convierte fechaCobro (DOUBLE legacy tipo 20260403211724 o similar) a DATETIME
 * para comparar bien con BETWEEN. Si STR_TO_DATE falla, la fila no suma (NULL).
 */
const COBRO_FECHA_EFECTIVA_SQL = `STR_TO_DATE(
  LPAD(CAST(CAST(FLOOR(ABS(fechaCobro)) AS UNSIGNED) AS CHAR), 14, '0'),
  '%Y%m%d%H%i%s'
)`;

/** Caja abierta (sin fecha de cierre en la consulta): tope superior = 20990101010101 en DATETIME. */
const FECHA_FIN_CAJA_ABIERTA = '2099-01-01 01:01:01';

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
        const cierre = toDate(session.fechaCierre);
        const cierreValido = Boolean(cierre && !Number.isNaN(cierre.getTime()));
        const estadoNorm = String(session.estado || '').toLowerCase();
        const esCerrada = estadoNorm === 'cerrada';
        const sesionCerradaConCierre = esCerrada && cierreValido;

        const fechaInicio = apertura;
        const inicioStr = toMysqlDatetime(fechaInicio);
        if (!inicioStr) {
            return res.status(500).json({ error: 'Fecha de apertura inválida' });
        }

        let finStr;
        if (sesionCerradaConCierre) {
            let fechaFin = cierre;
            if (fechaFin.getTime() < fechaInicio.getTime()) {
                fechaFin = new Date(fechaInicio.getTime());
            }
            finStr = toMysqlDatetime(fechaFin);
            if (!finStr) {
                return res.status(500).json({ error: 'Fecha de cierre inválida' });
            }
        } else {
            // Sin fin de sesión: en SQL usamos tope 20990101010101 (no "ahora", evita mismo segundo que apertura).
            finStr = FECHA_FIN_CAJA_ABIERTA;
        }

        const aperturaLog = toMysqlDatetime(apertura) || String(session.fechaApertura ?? '');
        const modoSesion = sesionCerradaConCierre
            ? 'cerrada (hasta fechaCierre)'
            : `abierta (fin consulta = ${FECHA_FIN_CAJA_ABIERTA} / 20990101010101)`;
        console.log(`📦 Caja id=${session.id} · apertura: ${aperturaLog} · modo: ${modoSesion}`);
        console.log(
            `📊 Resumen caja vendedor ${req.user.vendedorId} cobros/gastos entre ${inicioStr} y ${finStr} (fechaCobro normalizada desde DOUBLE)`
        );

        // cobros.fechaCobro suele ser DOUBLE (YYYYMMDDHHmmss). BETWEEN con Date/ string DATETIME
        // hacía que MySQL convirtiera mal y casi todos los cobros entraran al rango.
        const cobros = await query(
            `SELECT SUM(total) as totalCobros FROM cobros WHERE codigoVendedor = ? AND codigoEmpresa = ? AND ${COBRO_FECHA_EFECTIVA_SQL} BETWEEN ? AND ?`,
            [req.user.vendedorId, req.user.codigoEmpresa, inicioStr, finStr]
        );

        // 3. Sumar Gastos que afectan caja en ese periodo (MySQL - gastos_caja)
        const gastos = await query(
            'SELECT SUM(monto) as totalGastos FROM gastos_caja WHERE vendedorId = ? AND codigoEmpresa = ? AND fecha BETWEEN ? AND ?',
            [req.user.vendedorId, req.user.codigoEmpresa, inicioStr, finStr]
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
