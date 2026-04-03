require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fixBucket() {
  console.log('Cambiando bucket expense-docs a PUBLICO...');
  const { data, error } = await supabase.storage.updateBucket('expense-docs', {
    public: true,
    fileSizeLimit: 52428800, // 50MB (coherente con el server express)
    allowedMimeTypes: ['image/*', 'application/pdf']
  });

  if (error) {
    console.error('Error actualizando bucket:', error);
  } else {
    console.log('✅ Bucket actualizado correctamente:', data);
  }
}

fixBucket();
