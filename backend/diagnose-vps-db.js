#!/usr/bin/env node
/**
 * Script de diagnóstico para problemas de conexión a base de datos en VPS
 * Ejecutar: node diagnose-vps-db.js
 */

require('dotenv').config();
const dns = require('dns').promises;
const net = require('net');

console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS');
console.log('==========================================\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Verificando variables de entorno...');
const envVars = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***' : undefined,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || '3306'
};

let hasMissingVars = false;
Object.entries(envVars).forEach(([key, value]) => {
    if (!value && key !== 'DB_PASSWORD') {
        console.log(`   ❌ ${key}: NO CONFIGURADO`);
        hasMissingVars = true;
    } else {
        console.log(`   ✅ ${key}: ${value}`);
    }
});

if (hasMissingVars) {
    console.log('\n⚠️  ERROR: Faltan variables de entorno requeridas');
    console.log('   Crea un archivo .env en el directorio backend/ con:');
    console.log('   DB_HOST=tu_host_mysql');
    console.log('   DB_USER=tu_usuario');
    console.log('   DB_PASSWORD=tu_password');
    console.log('   DB_NAME=tu_base_de_datos');
    console.log('   DB_PORT=3306');
    process.exit(1);
}

console.log('\n2️⃣ Verificando resolución DNS...');
const host = envVars.DB_HOST;

// Verificar si es una IP o un hostname
const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

if (isIP) {
    console.log(`   ✅ Host es una IP directa: ${host}`);
} else {
    try {
        const addresses = await dns.resolve4(host);
        console.log(`   ✅ DNS resuelto correctamente`);
        console.log(`   📍 IP(s): ${addresses.join(', ')}`);
    } catch (error) {
        console.log(`   ❌ ERROR resolviendo DNS: ${error.message}`);
        console.log(`   💡 Intenta usar la IP directa en lugar del hostname`);
        process.exit(1);
    }
}

console.log('\n3️⃣ Verificando conectividad al puerto...');
const port = parseInt(envVars.DB_PORT, 10);

await new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
        console.log(`   ✅ Puerto ${port} accesible`);
        socket.destroy();
        resolve();
    });
    
    socket.on('timeout', () => {
        console.log(`   ❌ Timeout conectando al puerto ${port}`);
        socket.destroy();
        reject(new Error('Timeout'));
    });
    
    socket.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
            console.log(`   ❌ Conexión rechazada en puerto ${port}`);
            console.log(`   💡 Posibles causas:`);
            console.log(`      - MySQL no está corriendo`);
            console.log(`      - MySQL no está escuchando en ${host}:${port}`);
            console.log(`      - Firewall bloqueando el puerto`);
        } else {
            console.log(`   ❌ Error: ${error.message}`);
        }
        reject(error);
    });
    
    socket.connect(port, host);
}).catch(() => {
    console.log('\n⚠️  No se pudo conectar al puerto. Verifica:');
    console.log('   1. Que MySQL esté corriendo');
    console.log('   2. Que MySQL escuche en todas las interfaces (bind-address = 0.0.0.0)');
    console.log('   3. Que el firewall permita conexiones al puerto 3306');
    process.exit(1);
});

console.log('\n4️⃣ Intentando conexión MySQL...');
const mysql = require('mysql2/promise');

const dbConfig = {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: process.env.DB_PASSWORD,
    database: envVars.DB_NAME,
    port: port,
    connectTimeout: 10000,
};

try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('   ✅ Conexión MySQL exitosa!');
    
    // Probar una query simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('   ✅ Query de prueba exitosa');
    
    // Verificar versión de MySQL
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`   📊 Versión MySQL: ${version[0].version}`);
    
    await connection.end();
    console.log('\n✅ ¡TODOS LOS CHECKS PASARON!');
    console.log('   La base de datos está accesible y funcionando correctamente.');
    
} catch (error) {
    console.log(`   ❌ Error en conexión MySQL: ${error.message}`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('\n⚠️  ERROR DE AUTENTICACIÓN');
        console.log('   Verifica que el usuario y password sean correctos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('\n⚠️  BASE DE DATOS NO EXISTE');
        console.log(`   La base de datos "${envVars.DB_NAME}" no existe`);
        console.log('   Crea la base de datos o corrige DB_NAME en .env');
    } else if (error.code === 'ECONNREFUSED') {
        console.log('\n⚠️  CONEXIÓN RECHAZADA');
        console.log('   MySQL no está aceptando conexiones');
    } else {
        console.log(`\n⚠️  ERROR: ${error.code || error.message}`);
    }
    
    process.exit(1);
}

