const express = require('express');
const { verifyToken } = require('./auth');
const {
    createAlquilerUseCase,
    cancelAlquilerUseCase,
    generateMonthlyChargesUseCase,
} = require('../modules/alquileres');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    try {
        const { codigoCliente, tipo, marca, numeroSerie, observacion, montoMensual, fechaInicio } = req.body;
        const useCase = createAlquilerUseCase();
        const alquiler = await useCase.execute({
            codigoEmpresa: req.user.codigoEmpresa,
            codigoCliente: Number(codigoCliente),
            tipo,
            marca,
            numeroSerie,
            observacion,
            montoMensual: Number(montoMensual),
            fechaInicio,
            vendedorId: req.user.vendedorId,
        });
        res.status(201).json(alquiler);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.patch('/:id/cancelar', verifyToken, async (req, res) => {
    try {
        const useCase = cancelAlquilerUseCase();
        const alquiler = await useCase.execute({
            codigoEmpresa: req.user.codigoEmpresa,
            alquilerId: Number(req.params.id),
            motivoCancelacion: req.body?.motivoCancelacion || null,
        });
        res.json(alquiler);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/cobros/ejecutar', verifyToken, async (req, res) => {
    try {
        const runDate = req.body?.fecha ? new Date(req.body.fecha) : new Date();
        if (Number.isNaN(runDate.getTime())) {
            return res.status(400).json({ error: 'fecha inválida' });
        }

        const useCase = generateMonthlyChargesUseCase();
        const summary = await useCase.executeForEmpresa({
            codigoEmpresa: req.user.codigoEmpresa,
            runDate,
        });
        res.json({ ok: true, ...summary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
