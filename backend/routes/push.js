const express = require('express');
const webpush = require('web-push');
const { query } = require('../config/database');
const { verifyToken } = require('./auth');
const router = express.Router();

// Configurar VAPID keys (deben estar en .env)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@aquadelivery.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('✅ VAPID keys configuradas para notificaciones push');
} else {
    console.warn('⚠️ VAPID keys no configuradas. Las notificaciones push no funcionarán.');
}

// Endpoint para obtener la clave pública VAPID
router.get('/vapid-public-key', (req, res) => {
    if (!VAPID_PUBLIC_KEY) {
        return res.status(500).json({ error: 'VAPID keys no configuradas' });
    }
    res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Registrar suscripción push
router.post('/subscribe', verifyToken, async (req, res) => {
    try {
        const { subscription, grupo = 'all' } = req.body;
        const userId = req.user.vendedorId;
        const empresaId = req.user.codigoEmpresa;

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return res.status(400).json({ error: 'Suscripción inválida' });
        }

        const { endpoint, keys } = subscription;
        const { p256dh, auth } = keys;

        // Verificar si ya existe la suscripción
        const existing = await query(
            'SELECT id FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
            [userId, endpoint]
        );

        if (existing.length > 0) {
            // Actualizar suscripción existente
            await query(
                'UPDATE push_subscriptions SET p256dh = ?, auth = ?, grupo = ?, user_agent = ?, updated_at = NOW() WHERE id = ?',
                [p256dh, auth, grupo, req.headers['user-agent'], existing[0].id]
            );
            console.log(`✅ Suscripción push actualizada para usuario ${userId}`);
        } else {
            // Crear nueva suscripción
            await query(
                'INSERT INTO push_subscriptions (user_id, empresa_id, endpoint, p256dh, auth, grupo, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, empresaId, endpoint, p256dh, auth, grupo, req.headers['user-agent']]
            );
            console.log(`✅ Nueva suscripción push registrada para usuario ${userId}`);
        }

        res.json({ success: true, message: 'Suscripción registrada correctamente' });
    } catch (error) {
        console.error('❌ Error registrando suscripción push:', error);
        res.status(500).json({ error: 'Error al registrar suscripción' });
    }
});

// Eliminar suscripción push
router.post('/unsubscribe', verifyToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.user.vendedorId;

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint requerido' });
        }

        await query(
            'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
            [userId, endpoint]
        );

        console.log(`🗑️ Suscripción push eliminada para usuario ${userId}`);
        res.json({ success: true, message: 'Suscripción eliminada correctamente' });
    } catch (error) {
        console.error('❌ Error eliminando suscripción push:', error);
        res.status(500).json({ error: 'Error al eliminar suscripción' });
    }
});

// Enviar notificación a un grupo específico
router.post('/send', verifyToken, async (req, res) => {
    try {
        const { title, body, url, icon, grupo = 'all', empresaId, userId } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Título y cuerpo son requeridos' });
        }

        // Construir query para obtener suscripciones
        let sql = 'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE 1=1';
        const params = [];

        // Filtrar por empresa si se especifica
        if (empresaId) {
            sql += ' AND empresa_id = ?';
            params.push(empresaId);
        } else {
            // Si no se especifica empresa, usar la del usuario autenticado
            sql += ' AND empresa_id = ?';
            params.push(req.user.codigoEmpresa);
        }

        // Filtrar por grupo
        if (grupo !== 'all') {
            sql += ' AND (grupo = ? OR grupo = "all")';
            params.push(grupo);
        }

        // Filtrar por usuario específico si se especifica
        if (userId) {
            sql += ' AND user_id = ?';
            params.push(userId);
        }

        const subscriptions = await query(sql, params);

        if (subscriptions.length === 0) {
            return res.json({ 
                success: true, 
                message: 'No hay suscripciones para enviar',
                sent: 0 
            });
        }

        // Preparar payload de notificación
        const payload = JSON.stringify({
            title: title,
            body: body,
            icon: icon || '/icon-192.png',
            badge: '/icon-192.png',
            data: {
                url: url || '/',
                timestamp: Date.now()
            }
        });

        // Enviar notificaciones
        const results = await Promise.allSettled(
            subscriptions.map(sub => {
                const subscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                return webpush.sendNotification(subscription, payload);
            })
        );

        // Contar éxitos y errores
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Eliminar suscripciones inválidas (410 Gone, 404 Not Found)
        const invalidSubscriptions = [];
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const error = result.reason;
                if (error.statusCode === 410 || error.statusCode === 404) {
                    invalidSubscriptions.push(subscriptions[index].endpoint);
                }
            }
        });

        if (invalidSubscriptions.length > 0) {
            await query(
                'DELETE FROM push_subscriptions WHERE endpoint IN (?)',
                [invalidSubscriptions]
            );
            console.log(`🗑️ Eliminadas ${invalidSubscriptions.length} suscripciones inválidas`);
        }

        console.log(`📤 Notificaciones enviadas: ${successful} exitosas, ${failed} fallidas`);

        res.json({
            success: true,
            message: `Notificaciones enviadas: ${successful} exitosas, ${failed} fallidas`,
            sent: successful,
            failed: failed,
            total: subscriptions.length
        });
    } catch (error) {
        console.error('❌ Error enviando notificaciones:', error);
        res.status(500).json({ error: 'Error al enviar notificaciones' });
    }
});

// Obtener estadísticas de suscripciones
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const empresaId = req.user.codigoEmpresa;

        const stats = await query(`
            SELECT 
                grupo,
                COUNT(*) as total,
                COUNT(DISTINCT user_id) as usuarios
            FROM push_subscriptions
            WHERE empresa_id = ?
            GROUP BY grupo
        `, [empresaId]);

        const total = await query(
            'SELECT COUNT(*) as total FROM push_subscriptions WHERE empresa_id = ?',
            [empresaId]
        );

        res.json({
            success: true,
            stats: stats,
            total: total[0].total
        });
    } catch (error) {
        console.error('❌ Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;

