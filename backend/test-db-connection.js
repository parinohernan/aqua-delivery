/**
 * Script de diagnóstico para verificar conexión a la base de datos
 * Ejecutar: node test-db-connection.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const dns = require('dns').promises;

async function testConnection() {
  console.log('🔍 Diagnóstico de Conexión a Base de Datos\n');
  
  // Mostrar configuración
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***' : 'NO CONFIGURADO',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };

  console.log('📋 Configuración actual:');
  console.log('   Host:', dbConfig.host || 'NO CONFIGURADO');
  console.log('   Port:', dbConfig.port);
  console.log('   Database:', dbConfig.database || 'NO CONFIGURADO');
  console.log('   User:', dbConfig.user || 'NO CONFIGURADO');
  console.log('   Password:', dbConfig.password);
  console.log('');

  // Verificar variables de entorno
  if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
    console.error('❌ ERROR: Variables de entorno faltantes');
    console.error('   Verifica que exista un archivo .env con:');
    console.error('   - DB_HOST');
    console.error('   - DB_USER');
    console.error('   - DB_PASSWORD');
    console.error('   - DB_NAME');
    return;
  }

  // Test 1: Resolución DNS
  console.log('1️⃣ Verificando resolución DNS...');
  try {
    const addresses = await dns.resolve4(dbConfig.host);
    console.log('   ✅ DNS resuelto correctamente');
    console.log('   📍 IPs encontradas:', addresses.join(', '));
  } catch (error) {
    console.error('   ❌ Error resolviendo DNS:', error.message);
    console.error('   💡 Verifica que el hostname sea correcto');
    return;
  }

  // Test 2: Conectividad de red (puerto)
  console.log('\n2️⃣ Verificando conectividad al puerto...');
  const net = require('net');
  const socket = new net.Socket();
  
  const portTest = new Promise((resolve, reject) => {
    socket.setTimeout(5000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error('Timeout'));
    });
    socket.once('error', (err) => {
      reject(err);
    });
    socket.connect(dbConfig.port, dbConfig.host);
  });

  try {
    await portTest;
    console.log('   ✅ Puerto accesible');
  } catch (error) {
    console.error('   ❌ Puerto no accesible:', error.message);
    console.error('   💡 Posibles causas:');
    console.error('      - Firewall bloqueando el puerto');
    console.error('      - MySQL no está escuchando en todas las interfaces');
    console.error('      - El servidor no está accesible desde tu red');
    return;
  }

  // Test 3: Conexión MySQL
  console.log('\n3️⃣ Intentando conexión a MySQL...');
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: process.env.DB_PASSWORD,
      database: dbConfig.database,
      port: dbConfig.port,
      connectTimeout: 10000,
    });

    console.log('   ✅ Conexión exitosa!');
    
    // Test 4: Query simple
    console.log('\n4️⃣ Ejecutando query de prueba...');
    const [rows] = await connection.execute('SELECT 1 as test, NOW() as server_time');
    console.log('   ✅ Query ejecutada correctamente');
    console.log('   📊 Resultado:', rows[0]);
    
    // Test 5: Verificar tabla de vendedores
    console.log('\n5️⃣ Verificando tabla vendedores...');
    try {
      const [vendors] = await connection.execute('SELECT COUNT(*) as count FROM vendedores LIMIT 1');
      console.log('   ✅ Tabla vendedores accesible');
      console.log('   📊 Total de vendedores:', vendors[0].count);
    } catch (error) {
      console.error('   ⚠️ Error accediendo a tabla vendedores:', error.message);
    }

    await connection.end();
    console.log('\n✅ Todos los tests pasaron correctamente!');
    
  } catch (error) {
    console.error('   ❌ Error de conexión MySQL:', error.message);
    console.error('   📋 Código de error:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Soluciones para ETIMEDOUT:');
      console.error('   1. Verifica que MySQL esté corriendo en el servidor');
      console.error('   2. Verifica el firewall (debe permitir puerto 3306)');
      console.error('   3. Verifica que MySQL escuche en 0.0.0.0 (no solo 127.0.0.1)');
      console.error('   4. Verifica que el usuario tenga permisos remotos');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Soluciones para ER_ACCESS_DENIED_ERROR:');
      console.error('   1. Verifica DB_USER y DB_PASSWORD en .env');
      console.error('   2. Verifica que el usuario tenga permisos:');
      console.error('      GRANT ALL PRIVILEGES ON deliverydeagua.* TO \'usuario\'@\'%\';');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Soluciones para ECONNREFUSED:');
      console.error('   1. MySQL no está corriendo');
      console.error('   2. Puerto incorrecto');
      console.error('   3. Firewall bloqueando');
    }
  }
}

// Ejecutar diagnóstico
testConnection().catch(console.error);

