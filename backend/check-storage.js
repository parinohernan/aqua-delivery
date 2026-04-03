require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStorage() {
  console.log('--- Verificando Buckets ---');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) console.error('Error buckets:', bError);
  else console.log('Buckets:', buckets.map(b => `${b.name} (Public: ${b.public})`));

  console.log('\n--- Listando archivos en expense-docs ---');
  // Intentamos listar la raíz primero
  const { data: files, error: fError } = await supabase.storage.from('expense-docs').list('', { recursive: true });
  if (fError) console.error('Error listando archivos:', fError);
  else {
    console.log(`Encontrados ${files.length} archivos:`);
    files.forEach(f => console.log(` - ${f.name}`));
  }
}

checkStorage();
