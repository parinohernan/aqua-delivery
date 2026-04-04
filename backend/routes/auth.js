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
                telegramId: vendedor[0].telegramId,
                rol: vendedor[0].rol != null ? String(vendedor[0].rol) : undefined,
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
    console.log('🔐 Verificando token para:', req.method, req.path);
    const authHeader = req.header('Authorization');
    console.log('📋 Authorization header:', authHeader ? 'Presente' : 'Ausente');

    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        console.log('❌ No se encontró token');
        return res.status(401).json({ error: 'Token requerido' });
    }

    try {
        console.log('🔍 Verificando token con JWT_SECRET...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token válido para usuario:', decoded.telegramId);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Error verificando token:', error.message);
        res.status(401).json({ error: 'Token inválido', details: error.message });
    }
};

/**
 * Cambiar contraseña de acceso (valor almacenado en vendedores.telegramId).
 * POST /auth/change-password  body: { currentPassword, newPassword }
 * 400 si la actual no coincide (evita 401 para no disparar logout en el cliente).
 */
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        if (Number(req.user.vendedorId) === 1) {
            return res.status(403).json({ error: 'No está permitido cambiar la contraseña de esta cuenta.' });
        }

        const { currentPassword, newPassword } = req.body;
        const cur = currentPassword != null ? String(currentPassword) : '';
        const neu = newPassword != null ? String(newPassword) : '';

        if (!neu || neu.length < 4) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres' });
        }
        if (neu.length > 200) {
            return res.status(400).json({ error: 'La nueva contraseña es demasiado larga' });
        }

        const rows = await query(
            'SELECT codigo, telegramId FROM vendedores WHERE codigo = ? AND codigoEmpresa = ?',
            [req.user.vendedorId, req.user.codigoEmpresa]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const stored = rows[0].telegramId != null ? String(rows[0].telegramId) : '';
        if (stored !== cur) {
            return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        await query(
            'UPDATE vendedores SET telegramId = ? WHERE codigo = ? AND codigoEmpresa = ?',
            [neu, req.user.vendedorId, req.user.codigoEmpresa]
        );

        res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports.verifyToken = verifyToken;