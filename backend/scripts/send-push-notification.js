#!/usr/bin/env node

/**
 * Script CLI para enviar notificaciones push
 * 
 * Uso:
 *   node scripts/send-push-notification.js --title "Nueva versión" --body "Actualiza la app" --grupo "all"
 *   node scripts/send-push-notification.js --title "Mantenimiento" --body "El sistema estará en mantenimiento" --grupo "admins"
 *   node scripts/send-push-notification.js --title "Pedido nuevo" --body "Tienes un nuevo pedido" --userId 123
 */

require('dotenv').config();
const webpush = require('web-push');
const { query } = require('../config/database');
const readline = require('readline');

// Configurar VAPID
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@aquadelivery.com';

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('❌ Error: VAPID keys no configuradas en .env');
    console.error('   Ejecuta: node scripts/generate-vapid-keys.js');
    process.exit(1);
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Parsear argumentos de línea de comandos
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        title: '',
        body: '',
        url: '/',
        icon: '/icon-192.png',
        grupo: 'all',
        empresaId: null,
        userId: null,
        interactive: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--title':
            case '-t':
                options.title = args[++i];
                break;
            case '--body':
            case '-b':
                options.body = args[++i];
                break;
            case '--url':
            case '-u':
                options.url = args[++i];
                break;
            case '--icon':
            case '-i':
                options.icon = args[++i];
                break;
            case '--grupo':
            case '-g':
                options.grupo = args[++i];
                break;
            case '--empresa':
            case '-e':
                options.empresaId = parseInt(args[++i]);
                break;
            case '--user':
            case '-U':
                options.userId = parseInt(args[++i]);
                break;
            case '--interactive':
            case '-I':
                options.interactive = true;
                break;
            case '--help':
            case '-h':
                console.log(`
Uso: node scripts/send-push-notification.js [opciones]

Opciones:
  --title, -t <texto>      Título de la notificación (requerido)
  --body, -b <texto>       Cuerpo de la notificación (requerido)
  --url, -u <url>          URL a abrir al hacer clic (default: /)
  --icon, -i <url>         URL del icono (default: /icon-192.png)
  --grupo, -g <grupo>      Grupo de usuarios (default: all)
                           Ejemplos: all, admins, vendedores, clientes
  --empresa, -e <id>       ID de empresa específica (opcional)
  --user, -U <id>          ID de usuario específico (opcional)
  --interactive, -I        Modo interactivo (pregunta por los valores)
  --help, -h               Mostrar esta ayuda

Ejemplos:
  # Notificar a todos sobre nueva versión
  node scripts/send-push-notification.js -t "Nueva versión" -b "Actualiza la app ahora"

  # Notificar a un grupo específico
  node scripts/send-push-notification.js -t "Mantenimiento" -b "Sistema en mantenimiento" -g admins

  # Notificar a un usuario específico
  node scripts/send-push-notification.js -t "Pedido nuevo" -b "Tienes un nuevo pedido" -U 123

  # Modo interactivo
  node scripts/send-push-notification.js -I
                `);
                process.exit(0);
        }
    }

    return options;
}

// Modo interactivo
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    const options = {
        title: await question('📝 Título de la notificación: '),
        body: await question('📄 Cuerpo de la notificación: '),
        url: await question('🔗 URL (Enter para /): ') || '/',
        icon: await question('🖼️  Icono (Enter para default): ') || '/icon-192.png',
        grupo: await question('👥 Grupo (all/admins/vendedores, Enter para all): ') || 'all',
        empresaId: null,
        userId: null
    };

    const empresaInput = await question('🏢 ID de empresa (Enter para todas): ');
    if (empresaInput) {
        options.empresaId = parseInt(empresaInput);
    }

    const userInput = await question('👤 ID de usuario (Enter para todos): ');
    if (userInput) {
        options.userId = parseInt(userInput);
    }

    rl.close();
    return options;
}

// Enviar notificaciones
async function sendNotifications(options) {
    try {
        console.log('📤 Enviando notificaciones push...');
        console.log('   Título:', options.title);
        console.log('   Cuerpo:', options.body);
        console.log('   Grupo:', options.grupo);
        if (options.empresaId) console.log('   Empresa ID:', options.empresaId);
        if (options.userId) console.log('   Usuario ID:', options.userId);
        console.log('');

        // Construir query
        let sql = 'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE 1=1';
        const params = [];

        if (options.empresaId) {
            sql += ' AND empresa_id = ?';
            params.push(options.empresaId);
        }

        if (options.grupo !== 'all') {
            sql += ' AND (grupo = ? OR grupo = "all")';
            params.push(options.grupo);
        }

        if (options.userId) {
            sql += ' AND user_id = ?';
            params.push(options.userId);
        }

        const subscriptions = await query(sql, params);

        if (subscriptions.length === 0) {
            console.log('⚠️  No hay suscripciones para enviar');
            return;
        }

        console.log(`📊 Encontradas ${subscriptions.length} suscripciones`);

        // Preparar payload
        const payload = JSON.stringify({
            title: options.title,
            body: options.body,
            icon: options.icon,
            badge: '/icon-192.png',
            data: {
                url: options.url,
                timestamp: Date.now()
            }
        });

        // Enviar notificaciones
        const results = await Promise.allSettled(
            subscriptions.map((sub, index) => {
                const subscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                return webpush.sendNotification(subscription, payload)
                    .then(() => {
                        process.stdout.write(`\r✅ Enviada ${index + 1}/${subscriptions.length}`);
                    });
            })
        );

        console.log('');

        // Contar resultados
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Eliminar suscripciones inválidas
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
            console.log(`🗑️  Eliminadas ${invalidSubscriptions.length} suscripciones inválidas`);
        }

        console.log('');
        console.log('✅ Notificaciones enviadas:');
        console.log(`   Exitosas: ${successful}`);
        console.log(`   Fallidas: ${failed}`);
        console.log(`   Total: ${subscriptions.length}`);

    } catch (error) {
        console.error('❌ Error enviando notificaciones:', error);
        process.exit(1);
    }
}

// Función principal
async function main() {
    let options = parseArgs();

    // Validar argumentos requeridos
    if (options.interactive) {
        options = await interactiveMode();
    }

    if (!options.title || !options.body) {
        console.error('❌ Error: --title y --body son requeridos');
        console.error('   Usa --help para ver la ayuda');
        process.exit(1);
    }

    await sendNotifications(options);
    process.exit(0);
}

// Ejecutar
main().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});

