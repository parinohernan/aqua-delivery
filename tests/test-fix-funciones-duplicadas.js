const fs = require('fs');
const path = require('path');

console.log('🧪 Verificando funciones duplicadas...\n');

async function testFuncionesDuplicadas() {
  try {
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    const content = fs.readFileSync(indexFile, 'utf8');
    
    // Buscar funciones que podrían estar duplicadas
    const funciones = [
      'function viewPedido',
      'function editPedido',
      'function getStatusText',
      'function renderPedidos',
      'function clearPedidosFilters',
      'function loadPedidosSection',
      'function loadClientesSection',
      'function loadProductosSection'
    ];
    
    console.log('📋 Verificando funciones duplicadas:');
    
    let hayDuplicados = false;
    
    funciones.forEach(func => {
      const matches = content.match(new RegExp(func.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      const count = matches ? matches.length : 0;
      
      if (count > 1) {
        console.log(`❌ ${func}: ${count} declaraciones`);
        hayDuplicados = true;
      } else if (count === 1) {
        console.log(`✅ ${func}: 1 declaración`);
      } else {
        console.log(`⚠️ ${func}: 0 declaraciones`);
      }
    });
    
    // Verificar variables duplicadas
    const variables = [
      'let currentPedidos',
      'let allPedidos',
      'let currentClients',
      'let currentProducts'
    ];
    
    console.log('\n📋 Verificando variables duplicadas:');
    
    variables.forEach(varName => {
      const matches = content.match(new RegExp(varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
      const count = matches ? matches.length : 0;
      
      if (count > 1) {
        console.log(`❌ ${varName}: ${count} declaraciones`);
        hayDuplicados = true;
      } else if (count === 1) {
        console.log(`✅ ${varName}: 1 declaración`);
      } else {
        console.log(`⚠️ ${varName}: 0 declaraciones`);
      }
    });
    
    // Verificar que el servidor carga correctamente
    console.log('\n📋 Verificando servidor:');
    
    const { exec } = require('child_process');
    exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/', (error, stdout, stderr) => {
      if (stdout.trim() === '200') {
        console.log('✅ Servidor funcionando correctamente (HTTP 200)');
      } else {
        console.log('❌ Servidor no responde correctamente');
        hayDuplicados = true;
      }
      
      // Resumen final
      console.log('\n🎯 RESUMEN:');
      console.log('================');
      
      if (hayDuplicados) {
        console.log('❌ Se encontraron funciones o variables duplicadas');
        console.log('🔧 Revisa los elementos marcados con ❌');
      } else {
        console.log('✅ No se encontraron duplicados');
        console.log('✅ Servidor funcionando correctamente');
        console.log('🎉 ¡Todo está funcionando perfectamente!');
      }
    });
    
  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testFuncionesDuplicadas();
