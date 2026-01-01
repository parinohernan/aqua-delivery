const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 15000, // 15 segundos para establecer conexión (aumentado)
    acquireTimeout: 15000, // 15 segundos para obtener conexión del pool
    timeout: 30000, // 30 segundos para ejecutar queries
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Opciones adicionales para mejorar la conexión
    reconnect: true,
    ssl: false, // Deshabilitar SSL si no es necesario
};

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
        
        // Si es un error de timeout, intentar verificar el estado del pool
        if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
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