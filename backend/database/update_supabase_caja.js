const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateSchema() {
  console.log('--- Actualizando Esquema en Supabase ---');
  
  // Como no hay un ALTER TABLE directo vía JS SDK para columnas,
  // informamos que se debe correr en el dashboard o usamos RPC si existiera.
  // Pero intentaremos agregarlo si tenemos el SQL habilitado o via una query directa si el rol lo permite.
  
  console.log('Por favor ejecutá este SQL en el Dashboard de Supabase:');
  console.log('ALTER TABLE expenses ADD COLUMN IF NOT EXISTS affects_cashier BOOLEAN DEFAULT FALSE;');
}

updateSchema();
