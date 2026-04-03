require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  console.log('--- Iniciando Migración MySQL para el Módulo de Caja ---');
  const connection = await mysql.createConnection(process.env.MYSQL_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    // 1. Tabla de Sesiones de Caja
    console.log('Creando tabla cajas...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cajas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendedorId INT NOT NULL,
        codigoEmpresa INT NOT NULL,
        montoInicial DECIMAL(10,2) NOT NULL DEFAULT 0,
        montoFinalEsperado DECIMAL(10,2) DEFAULT NULL,
        montoRealEntregado DECIMAL(10,2) DEFAULT NULL,
        estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
        fechaApertura DATETIME DEFAULT CURRENT_TIMESTAMP,
        fechaCierre DATETIME DEFAULT NULL,
        INDEX idx_vendedor_caja (vendedorId, codigoEmpresa),
        INDEX idx_fecha_apertura (fechaApertura)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);

    // 2. Tabla de Gastos de Caja (Espejo)
    console.log('Creando tabla gastos_caja...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gastos_caja (
        id INT AUTO_INCREMENT PRIMARY KEY,
        monto DECIMAL(10,2) NOT NULL,
        descripcion TEXT,
        vendedorId INT NOT NULL,
        codigoEmpresa INT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        expense_id_supabase VARCHAR(255),
        INDEX idx_vendedor_gasto (vendedorId, codigoEmpresa),
        INDEX idx_fecha_gasto (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `);

    console.log('✅ Migración MySQL completada exitosamente.');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await connection.end();
  }
}

migrate();
