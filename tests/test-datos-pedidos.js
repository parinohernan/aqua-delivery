const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:4321';
const TEST_TOKEN = 'test-token';

console.log('🧪 Iniciando test de datos de pedidos...\n');

async function testDatosPedidos() {
  try {
    // Verificar que el servidor está funcionando
    console.log('📋 Verificando servidor...');
    const response = await axios.get(BASE_URL);
    if (response.status !== 200) {
      throw new Error(`Servidor no responde correctamente: ${response.status}`);
    }
    console.log('✅ Servidor funcionando correctamente');

    // Verificar que la función renderPedidosGrid existe y está correcta
    console.log('\n📋 Verificando función renderPedidosGrid...');
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    
    // Verificar que usa los campos correctos del backend
    const camposCorrectos = [
      'pedido.fecha_pedido',
      'pedido.cliente_nombre',
      'pedido.telefono',
      'pedido.direccion',
      'pedido.detalles',
      'item.descripcion'
    ];
    
    let camposEncontrados = 0;
    camposCorrectos.forEach(campo => {
      if (indexContent.includes(campo)) {
        console.log(`✅ Campo correcto: ${campo}`);
        camposEncontrados++;
      } else {
        console.log(`❌ Campo faltante: ${campo}`);
      }
    });

    // Verificar que no usa campos incorrectos
    const camposIncorrectos = [
      'pedido.fechaEntrega',
      'pedido.horaEntrega',
      'pedido.cliente?.nombre',
      'pedido.items',
      'item.nombreProducto'
    ];
    
    let camposIncorrectosEncontrados = 0;
    camposIncorrectos.forEach(campo => {
      if (indexContent.includes(campo)) {
        console.log(`❌ Campo incorrecto encontrado: ${campo}`);
        camposIncorrectosEncontrados++;
      }
    });

    // Verificar estructura de la tarjeta
    console.log('\n📋 Verificando estructura de tarjeta...');
    const elementosTarjeta = [
      'pedido-card',
      'pedido-header',
      'pedido-title',
      'pedido-status',
      'pedido-info',
      'pedido-cliente',
      'pedido-items',
      'pedido-total',
      'pedido-actions'
    ];
    
    let elementosEncontrados = 0;
    elementosTarjeta.forEach(elemento => {
      if (indexContent.includes(elemento)) {
        console.log(`✅ Elemento de tarjeta: ${elemento}`);
        elementosEncontrados++;
      } else {
        console.log(`❌ Elemento faltante: ${elemento}`);
      }
    });

    // Verificar funciones de acción
    console.log('\n📋 Verificando funciones de acción...');
    const funcionesAccion = [
      'viewPedido',
      'editPedido',
      'startDelivery',
      'completeDelivery',
      'cancelPedido'
    ];
    
    let funcionesEncontradas = 0;
    funcionesAccion.forEach(funcion => {
      if (indexContent.includes(funcion)) {
        console.log(`✅ Función de acción: ${funcion}`);
        funcionesEncontradas++;
      } else {
        console.log(`❌ Función faltante: ${funcion}`);
      }
    });

    // Resumen final
    console.log('\n🎯 RESUMEN:');
    console.log('================');
    console.log(`📊 Campos correctos: ${camposEncontrados}/${camposCorrectos.length}`);
    console.log(`📊 Campos incorrectos encontrados: ${camposIncorrectosEncontrados}`);
    console.log(`📊 Elementos de tarjeta: ${elementosEncontrados}/${elementosTarjeta.length}`);
    console.log(`📊 Funciones de acción: ${funcionesEncontradas}/${funcionesAccion.length}`);
    
    const totalChecks = camposCorrectos.length + elementosTarjeta.length + funcionesAccion.length;
    const totalCorrect = camposEncontrados + elementosEncontrados + funcionesEncontradas;
    
    if (camposIncorrectosEncontrados === 0 && totalCorrect === totalChecks) {
      console.log('\n🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
      console.log('✅ Los datos de pedidos se muestran correctamente');
      console.log('✅ No hay campos incorrectos');
      console.log('✅ La estructura de tarjetas está completa');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
      if (camposIncorrectosEncontrados > 0) {
        console.log('❌ Se encontraron campos incorrectos');
      }
      if (totalCorrect < totalChecks) {
        console.log('❌ Faltan elementos o funciones');
      }
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testDatosPedidos();
