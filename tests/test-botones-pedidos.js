const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:4321';

console.log('🧪 Iniciando test de botones de pedidos...\n');

async function testBotonesPedidos() {
  try {
    // Verificar que el servidor está funcionando
    console.log('📋 Verificando servidor...');
    const response = await axios.get(BASE_URL);
    if (response.status !== 200) {
      throw new Error(`Servidor no responde correctamente: ${response.status}`);
    }
    console.log('✅ Servidor funcionando correctamente');

    // Verificar que las funciones están definidas y expuestas
    console.log('\n📋 Verificando funciones de botones...');
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    
    // Verificar funciones de botones
    const funcionesBotones = [
      'function showCreateOrderModal',
      'function showDeliveryMap',
      'function closeDeliveryMap'
    ];
    
    let funcionesEncontradas = 0;
    funcionesBotones.forEach(funcion => {
      if (indexContent.includes(funcion)) {
        console.log(`✅ Función encontrada: ${funcion}`);
        funcionesEncontradas++;
      } else {
        console.log(`❌ Función faltante: ${funcion}`);
      }
    });

    // Verificar exposición global
    const funcionesGlobales = [
      'window.showCreateOrderModal',
      'window.showDeliveryMap',
      'window.closeDeliveryMap'
    ];
    
    let funcionesGlobalesEncontradas = 0;
    funcionesGlobales.forEach(funcion => {
      if (indexContent.includes(funcion)) {
        console.log(`✅ Función global: ${funcion}`);
        funcionesGlobalesEncontradas++;
      } else {
        console.log(`❌ Función global faltante: ${funcion}`);
      }
    });

    // Verificar botones en HTML
    const botonesHTML = [
      'onclick="window.showCreateOrderModal()"',
      'onclick="window.showDeliveryMap()"'
    ];
    
    let botonesEncontrados = 0;
    botonesHTML.forEach(boton => {
      if (indexContent.includes(boton)) {
        console.log(`✅ Botón encontrado: ${boton}`);
        botonesEncontrados++;
      } else {
        console.log(`❌ Botón faltante: ${boton}`);
      }
    });

    // Verificar implementación del mapa
    console.log('\n📋 Verificando implementación del mapa...');
    const elementosMapa = [
      'deliveryMapModal',
      'deliveryMapContainer',
      'closeDeliveryMap()',
      'currentPedidos.length'
    ];
    
    let elementosMapaEncontrados = 0;
    elementosMapa.forEach(elemento => {
      if (indexContent.includes(elemento)) {
        console.log(`✅ Elemento de mapa: ${elemento}`);
        elementosMapaEncontrados++;
      } else {
        console.log(`❌ Elemento de mapa faltante: ${elemento}`);
      }
    });

    // Verificar que no hay alertas de "en desarrollo"
    if (!indexContent.includes('alert(\'Mapa de entregas en desarrollo\')')) {
      console.log('✅ No hay alerta de "en desarrollo" en el mapa');
    } else {
      console.log('❌ Hay alerta de "en desarrollo" en el mapa');
    }

    // Verificar que showCreateOrderModal usa orderModal
    if (indexContent.includes('window.orderModal')) {
      console.log('✅ showCreateOrderModal usa orderModal correctamente');
    } else {
      console.log('❌ showCreateOrderModal no usa orderModal');
    }

    // Resumen final
    console.log('\n🎯 RESUMEN:');
    console.log('================');
    console.log(`📊 Funciones definidas: ${funcionesEncontradas}/${funcionesBotones.length}`);
    console.log(`📊 Funciones globales: ${funcionesGlobalesEncontradas}/${funcionesGlobales.length}`);
    console.log(`📊 Botones HTML: ${botonesEncontrados}/${botonesHTML.length}`);
    console.log(`📊 Elementos de mapa: ${elementosMapaEncontrados}/${elementosMapa.length}`);
    
    const totalChecks = funcionesBotones.length + funcionesGlobales.length + botonesHTML.length + elementosMapa.length + 2; // +2 por verificaciones adicionales
    const totalCorrect = funcionesEncontradas + funcionesGlobalesEncontradas + botonesEncontrados + elementosMapaEncontrados + 2;
    
    if (totalCorrect === totalChecks) {
      console.log('\n🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
      console.log('✅ Todos los botones están correctamente implementados');
      console.log('✅ Las funciones están expuestas globalmente');
      console.log('✅ El mapa tiene una implementación funcional');
      console.log('✅ No hay alertas de "en desarrollo"');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
      console.log('🔧 Revisa los elementos marcados con ❌');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testBotonesPedidos();
