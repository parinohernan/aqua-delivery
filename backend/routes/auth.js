const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const router = express.Router();

// Login de vendedor
router.post('/login', async (req, res) => {
    try {
        const { telegramId, codigoEmpresa } = req.body;
        
        const vendedor = await query(
            'SELECT v.*, e.razonSocial, e.usaEntregaProgramada, e.usaRepartoPorZona FROM vendedores v JOIN empresa e ON v.codigoEmpresa = e.codigo WHERE v.telegramId = ? AND v.codigoEmpresa = ?',
            [telegramId, codigoEmpresa]
        );
        
        if (vendedor.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const token = jwt.sign(
            { 
                vendedorId: vendedor[0].codigo,
                codigoEmpresa: vendedor[0].codigoEmpresa,
                telegramId: vendedor[0].telegramId
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            vendedor: vendedor[0]
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = router;
module.exports.verifyToken = verifyToken;