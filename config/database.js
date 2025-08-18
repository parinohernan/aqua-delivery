const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función para ejecutar queries
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en query:', error);
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