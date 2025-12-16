#!/usr/bin/env node

/**
 * Script para generar VAPID keys para notificaciones push
 * 
 * Uso: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

console.log('🔑 Generando VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generadas:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:admin@aquadelivery.com\n');

console.log('📝 Agrega estas líneas a tu archivo .env:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@aquadelivery.com\n`);

// Preguntar si quiere guardar automáticamente
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('¿Deseas agregar estas keys al archivo .env automáticamente? (s/n): ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y') {
        const envPath = path.join(__dirname, '..', '.env');
        
        try {
            let envContent = '';
            
            // Leer .env existente si existe
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
                
                // Remover keys VAPID existentes
                envContent = envContent.replace(/VAPID_PUBLIC_KEY=.*\n/g, '');
                envContent = envContent.replace(/VAPID_PRIVATE_KEY=.*\n/g, '');
                envContent = envContent.replace(/VAPID_SUBJECT=.*\n/g, '');
            }
            
            // Agregar nuevas keys
            envContent += `\n# VAPID Keys para notificaciones push\n`;
            envContent += `VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`;
            envContent += `VAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`;
            envContent += `VAPID_SUBJECT=mailto:admin@aquadelivery.com\n`;
            
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Keys agregadas al archivo .env');
        } catch (error) {
            console.error('❌ Error escribiendo .env:', error.message);
        }
    }
    
    rl.close();
});

