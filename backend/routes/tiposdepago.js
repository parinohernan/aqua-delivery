const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken } = require('./auth');

// Obtener tipos de pago de la empresa
router.get('/', verifyToken, async (req, res) => {
    try {
        const tiposPago = await query(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE codigoEmpresa = ? ORDER BY pago',
            [req.user.codigoEmpresa]
        );
        
        console.log('💳 Tipos de pago consultados:', tiposPago);
        
        res.json(tiposPago);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear tipo de pago
router.post('/', verifyToken, async (req, res) => {
    try {
        const { pago, aplicaSaldo } = req.body;
        
        const result = await query(
            'INSERT INTO tiposdepago (codigoEmpresa, pago, aplicaSaldo) VALUES (?, ?, ?)',
            [req.user.codigoEmpresa, pago, aplicaSaldo ? 1 : 0]
        );
        
        const nuevoTipoPago = await query(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [result.insertId, req.user.codigoEmpresa]
        );
        
        res.json(nuevoTipoPago[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar tipo de pago
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { pago, aplicaSaldo } = req.body;
        
        await query(
            'UPDATE tiposdepago SET pago = ?, aplicaSaldo = ? WHERE id = ? AND codigoEmpresa = ?',
            [pago, aplicaSaldo ? 1 : 0, req.params.id, req.user.codigoEmpresa]
        );
        
        const tipoActualizado = await query(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json(tipoActualizado[0]);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar tipo de pago
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await query(
            'DELETE FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        res.json({ message: 'Tipo de pago eliminado correctamente' });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint de debug para verificar tipos de pago
router.get('/debug/:id', verifyToken, async (req, res) => {
    try {
        const tipoPago = await query(
            'SELECT id, pago, aplicaSaldo FROM tiposdepago WHERE id = ? AND codigoEmpresa = ?',
            [req.params.id, req.user.codigoEmpresa]
        );
        
        if (tipoPago.length === 0) {
            return res.status(404).json({ error: 'Tipo de pago no encontrado' });
        }
        
        const data = tipoPago[0];
        res.json({
            ...data,
            interpretaciones: {
                '=== 1': data.aplicaSaldo === 1,
                '=== true': data.aplicaSaldo === true,
                '== 1': data.aplicaSaldo == 1,
                '== true': data.aplicaSaldo == true,
                'Boolean()': Boolean(data.aplicaSaldo),
                'tipo': typeof data.aplicaSaldo
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
