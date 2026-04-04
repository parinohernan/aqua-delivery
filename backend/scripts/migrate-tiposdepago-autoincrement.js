/**
 * Asegura tiposdepago.id con AUTO_INCREMENT (requerido por INSERT sin id).
 * Uso: cd backend && npm run migrate:tiposdepago
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const sqlPath = path.join(
    __dirname,
    '../migrations/fix_tiposdepago_id_autoincrement.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  await conn.query(sql);
  await conn.end();
  console.log('✅ tiposdepago.id configurado como AUTO_INCREMENT.');
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
