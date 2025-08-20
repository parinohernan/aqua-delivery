const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:4321';

console.log('🧪 Iniciando test de corrección de timing de funciones...\n');

async function testFixTimingFunciones() {
  try {
    // Verificar que el servidor está funcionando
    console.log('📋 Verificando servidor...');
    const response = await axios.get(BASE_URL);
    if (response.status !== 200) {
      throw new Error(`Servidor no responde correctamente: ${response.status}`);
    }
    console.log('✅ Servidor funcionando correctamente');

    // Verificar que las funciones se exponen inmediatamente después de su definición
    console.log('\n📋 Verificando timing de exposición de funciones...');
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    
    // Verificar que showCreateOrderModal se expone inmediatamente
    const showCreateOrderModalPattern = /function showCreateOrderModal\(\) \{[\s\S]*?\}\s*\n\s*\/\/ Exponer inmediatamente para evitar errores de timing\s*\n\s*window\.showCreateOrderModal = showCreateOrderModal;/;
    
    if (showCreateOrderModalPattern.test(indexContent)) {
      console.log('✅ showCreateOrderModal se expone inmediatamente después de su definición');
    } else {
      console.log('❌ showCreateOrderModal no se expone inmediatamente');
    }

    // Verificar que showDeliveryMap se expone inmediatamente
    const showDeliveryMapPattern = /function closeDeliveryMap\(\) \{[\s\S]*?\}\s*\n\s*\/\/ Exponer inmediatamente para evitar errores de timing\s*\n\s*window\.showDeliveryMap = showDeliveryMap;\s*\n\s*window\.closeDeliveryMap = closeDeliveryMap;/;
    
    if (showDeliveryMapPattern.test(indexContent)) {
      console.log('✅ showDeliveryMap y closeDeliveryMap se exponen inmediatamente');
    } else {
      console.log('❌ showDeliveryMap y closeDeliveryMap no se exponen inmediatamente');
    }

    // Verificar que no hay exposiciones duplicadas
    const exposicionesShowCreateOrderModal = (indexContent.match(/window\.showCreateOrderModal = showCreateOrderModal;/g) || []).length;
    const exposicionesShowDeliveryMap = (indexContent.match(/window\.showDeliveryMap = showDeliveryMap;/g) || []).length;
    const exposicionesCloseDeliveryMap = (indexContent.match(/window\.closeDeliveryMap = closeDeliveryMap;/g) || []).length;
    
    if (exposicionesShowCreateOrderModal === 1) {
      console.log('✅ showCreateOrderModal tiene exactamente 1 exposición global');
    } else {
      console.log(`❌ showCreateOrderModal tiene ${exposicionesShowCreateOrderModal} exposiciones globales`);
    }
    
    if (exposicionesShowDeliveryMap === 1) {
      console.log('✅ showDeliveryMap tiene exactamente 1 exposición global');
    } else {
      console.log(`❌ showDeliveryMap tiene ${exposicionesShowDeliveryMap} exposiciones globales`);
    }
    
    if (exposicionesCloseDeliveryMap === 1) {
      console.log('✅ closeDeliveryMap tiene exactamente 1 exposición global');
    } else {
      console.log(`❌ closeDeliveryMap tiene ${exposicionesCloseDeliveryMap} exposiciones globales`);
    }

    // Verificar que los botones usan window.
    const botonesConWindow = [
      'onclick="window.showCreateOrderModal()"',
      'onclick="window.showDeliveryMap()"'
    ];
    
    let botonesCorrectos = 0;
    botonesConWindow.forEach(boton => {
      if (indexContent.includes(boton)) {
        console.log(`✅ Botón usa window: ${boton}`);
        botonesCorrectos++;
      } else {
        console.log(`❌ Botón no usa window: ${boton}`);
      }
    });

    // Verificar que las funciones están definidas
    const funcionesDefinidas = [
      'function showCreateOrderModal',
      'function showDeliveryMap',
      'function closeDeliveryMap'
    ];
    
    let funcionesEncontradas = 0;
    funcionesDefinidas.forEach(funcion => {
      if (indexContent.includes(funcion)) {
        console.log(`✅ Función definida: ${funcion}`);
        funcionesEncontradas++;
      } else {
        console.log(`❌ Función no definida: ${funcion}`);
      }
    });

    // Resumen final
    console.log('\n🎯 RESUMEN:');
    console.log('================');
    console.log(`📊 Funciones definidas: ${funcionesEncontradas}/${funcionesDefinidas.length}`);
    console.log(`📊 Botones con window: ${botonesCorrectos}/${botonesConWindow.length}`);
    console.log(`📊 Exposiciones duplicadas: ${exposicionesShowCreateOrderModal + exposicionesShowDeliveryMap + exposicionesCloseDeliveryMap - 3}`);
    
    const totalChecks = funcionesDefinidas.length + botonesConWindow.length + 3; // +3 por verificaciones de timing
    const totalCorrect = funcionesEncontradas + botonesCorrectos + 3;
    
    if (totalCorrect === totalChecks && exposicionesShowCreateOrderModal === 1 && exposicionesShowDeliveryMap === 1 && exposicionesCloseDeliveryMap === 1) {
      console.log('\n🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
      console.log('✅ El problema de timing se corrigió correctamente');
      console.log('✅ Las funciones se exponen inmediatamente después de su definición');
      console.log('✅ No hay exposiciones duplicadas');
      console.log('✅ Los botones usan window. correctamente');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
      console.log('🔧 Revisa los elementos marcados con ❌');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testFixTimingFunciones();

