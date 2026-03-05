const mysql = require('mysql2/promise');

// Validar variables de entorno requeridas
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ ERROR: Variables de entorno faltantes:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('⚠️  Asegúrate de configurar estas variables en tu archivo .env o en las variables de entorno del sistema');
}

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000, // 15 segundos para establecer conexión
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: false, // Deshabilitar SSL si no es necesario
};

// Log de configuración (sin mostrar password)
console.log('📊 Configuración de Base de Datos:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user || 'NO CONFIGURADO'}`);
console.log(`   Password: ${dbConfig.password ? '***' : 'NO CONFIGURADO'}`);

const pool = mysql.createPool(dbConfig);

// Función para ejecutar queries
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en query:', error);
        console.error('SQL:', sql);
        console.error('Params:', params);
        
        // Mensajes de error más descriptivos
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️ Error: Conexión rechazada a la base de datos');
            console.error('   Esto generalmente significa que:');
            console.error('   - MySQL no está corriendo en el host especificado');
            console.error('   - El puerto está bloqueado por firewall');
            console.error('   - El host es incorrecto');
            console.error('   Host:', dbConfig.host);
            console.error('   Port:', dbConfig.port);
            console.error('   💡 Si estás en Docker, asegúrate de que DB_HOST sea el nombre del servicio (ej: "database")');
            console.error('   💡 Si estás en producción, verifica que DB_HOST tenga el valor correcto');
        } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
            console.error('⚠️ Error de timeout en conexión a la base de datos');
            console.error('   Verifica que MySQL esté corriendo y accesible');
            console.error('   Host:', dbConfig.host);
            console.error('   Port:', dbConfig.port);
            console.error('   Database:', dbConfig.database);
        }
        
        throw error;
    }
}

// Función para ejecutar transacciones
async function transaction(callback) {
    const connection = await pool.getConnection();
    console.log('🔗 Conexión obtenida para transacción');

    try {
        await connection.beginTransaction();
        console.log('🔄 Transacción iniciada');

        // Función query específica para esta conexión
        const transactionQuery = async (sql, params = []) => {
            console.log(`   🔍 Ejecutando SQL: ${sql}`);
            console.log(`   📝 Parámetros:`, params);
            const [results] = await connection.execute(sql, params);
            console.log(`   ✅ Resultado:`, results);
            return results;
        };

        // Ejecutar el callback con la función query de la transacción
        const result = await callback(transactionQuery);

        await connection.commit();
        console.log('✅ Transacción confirmada (COMMIT)');

        return result;

    } catch (error) {
        console.log('❌ Error en transacción:', error.message);
        await connection.rollback();
        console.log('❌ Transacción revertida (ROLLBACK)');
        throw error;
    } finally {
        connection.release();
        console.log('🔗 Conexión liberada');
    }
}

module.exports = { query, pool, transaction };