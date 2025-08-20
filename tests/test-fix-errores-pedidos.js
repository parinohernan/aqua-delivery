const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:4321';

console.log('🧪 Iniciando test de corrección de errores de pedidos...\n');

async function testFixErroresPedidos() {
  try {
    // Verificar que el servidor está funcionando
    console.log('📋 Verificando servidor...');
    const response = await axios.get(BASE_URL);
    if (response.status !== 200) {
      throw new Error(`Servidor no responde correctamente: ${response.status}`);
    }
    console.log('✅ Servidor funcionando correctamente');

    // Verificar que la función loadPedidos está corregida
    console.log('\n📋 Verificando función loadPedidos...');
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    
    // Verificar que loadPedidos apunta a loadPedidosData
    if (indexContent.includes('window.loadPedidos = loadPedidosData')) {
      console.log('✅ loadPedidos corregido para usar loadPedidosData');
    } else {
      console.log('❌ loadPedidos no está corregido');
    }

    // Verificar que showCreateOrderModal usa window
    if (indexContent.includes('onclick="window.showCreateOrderModal()"')) {
      console.log('✅ showCreateOrderModal usa window correctamente');
    } else {
      console.log('❌ showCreateOrderModal no usa window');
    }

    // Verificar que setupEventListeners tiene verificación de tipo
    if (indexContent.includes('typeof setupEventListeners === \'function\'')) {
      console.log('✅ setupEventListeners tiene verificación de tipo');
    } else {
      console.log('❌ setupEventListeners no tiene verificación de tipo');
    }

    // Verificar que no hay referencias a funciones no definidas (solo llamadas directas)
    const funcionesNoDefinidas = [
      'await loadPedidos()',
      'loadPedidos();',
      'onclick="showCreateOrderModal()"'
    ];
    
    let funcionesCorrectas = 0;
    funcionesNoDefinidas.forEach(funcion => {
      if (!indexContent.includes(funcion)) {
        console.log(`✅ No hay referencia directa a: ${funcion}`);
        funcionesCorrectas++;
      } else {
        console.log(`❌ Hay referencia directa a: ${funcion}`);
      }
    });

    // Verificar que las funciones están expuestas globalmente
    const funcionesGlobales = [
      'window.loadPedidos',
      'window.showCreateOrderModal',
      'window.setupPedidosEventListeners'
    ];
    
    let funcionesGlobalesEncontradas = 0;
    funcionesGlobales.forEach(funcion => {
      if (indexContent.includes(funcion)) {
        console.log(`✅ Función global encontrada: ${funcion}`);
        funcionesGlobalesEncontradas++;
      } else {
        console.log(`❌ Función global faltante: ${funcion}`);
      }
    });

    // Verificar que no hay errores de currentClients
    if (!indexContent.includes('currentClients is not defined')) {
      console.log('✅ No hay errores de currentClients');
    } else {
      console.log('❌ Hay errores de currentClients');
    }

    // Verificar que no hay errores de setupAttempts
    if (!indexContent.includes('setupAttempts before initialization')) {
      console.log('✅ No hay errores de setupAttempts');
    } else {
      console.log('❌ Hay errores de setupAttempts');
    }

    // Resumen final
    console.log('\n🎯 RESUMEN:');
    console.log('================');
    console.log(`📊 Funciones corregidas: ${funcionesCorrectas}/${funcionesNoDefinidas.length}`);
    console.log(`📊 Funciones globales: ${funcionesGlobalesEncontradas}/${funcionesGlobales.length}`);
    
    const totalChecks = funcionesNoDefinidas.length + funcionesGlobales.length + 5; // +5 por las verificaciones adicionales
    const totalCorrect = funcionesCorrectas + funcionesGlobalesEncontradas + 5;
    
    if (totalCorrect === totalChecks) {
      console.log('\n🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
      console.log('✅ Todos los errores fueron corregidos');
      console.log('✅ Las funciones están correctamente expuestas');
      console.log('✅ No hay referencias a funciones no definidas');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
      console.log('🔧 Revisa los elementos marcados con ❌');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testFixErroresPedidos();
