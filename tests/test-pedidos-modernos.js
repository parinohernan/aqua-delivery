const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'test-token';

console.log('🧪 Iniciando test de sección de pedidos moderna...\n');

async function testPedidosModernos() {
  try {
    console.log('📋 1. Verificando archivo CSS de pedidos...');
    const cssFile = path.join(__dirname, '../frontend/src/styles/pedidos.css');
    let cssComplete = false;
    
    if (fs.existsSync(cssFile)) {
      const cssContent = fs.readFileSync(cssFile, 'utf8');
      const cssChecks = [
        '.pedidos-section',
        '.pedido-card',
        '.pedido-status',
        '.btn-create',
        '.btn-export',
        '.filters-panel',
        '.pedidos-grid'
      ];
      
      const cssResults = cssChecks.map(check => ({
        check,
        found: cssContent.includes(check)
      }));
      
      console.log('✅ CSS de pedidos encontrado');
      cssResults.forEach(result => {
        console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
      });
      
      cssComplete = cssResults.every(r => r.found);
      console.log(`\n📊 CSS completo: ${cssComplete ? '✅' : '❌'}\n`);
    } else {
      console.log('❌ Archivo CSS de pedidos no encontrado\n');
    }

    console.log('📋 2. Verificando archivo index.astro...');
    const indexFile = path.join(__dirname, '../frontend/src/pages/index.astro');
    let indexContent = '';
    let indexComplete = false;
    
    if (fs.existsSync(indexFile)) {
      indexContent = fs.readFileSync(indexFile, 'utf8');
      const indexChecks = [
        'loadPedidosSection',
        'renderPedidosGrid',
        'applyPedidoFilters',
        'clearPedidoFilters',
        'pedidos-section',
        'pedido-card',
        'btn-create'
      ];
      
      const indexResults = indexChecks.map(check => ({
        check,
        found: indexContent.includes(check)
      }));
      
      console.log('✅ Archivo index.astro encontrado');
      indexResults.forEach(result => {
        console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
      });
      
      indexComplete = indexResults.every(r => r.found);
      console.log(`\n📊 Index completo: ${indexComplete ? '✅' : '❌'}\n`);
    } else {
      console.log('❌ Archivo index.astro no encontrado\n');
    }

    console.log('📋 3. Verificando Layout.astro...');
    const layoutFile = path.join(__dirname, '../frontend/src/layouts/Layout.astro');
    let layoutComplete = false;
    
    if (fs.existsSync(layoutFile)) {
      const layoutContent = fs.readFileSync(layoutFile, 'utf8');
      const layoutChecks = [
        'pedidos.css'
      ];
      
      const layoutResults = layoutChecks.map(check => ({
        check,
        found: layoutContent.includes(check)
      }));
      
      console.log('✅ Archivo Layout.astro encontrado');
      layoutResults.forEach(result => {
        console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
      });
      
      layoutComplete = layoutResults.every(r => r.found);
      console.log(`\n📊 Layout completo: ${layoutComplete ? '✅' : '❌'}\n`);
    } else {
      console.log('❌ Archivo Layout.astro no encontrado\n');
    }

    console.log('📋 4. Verificando tipos globales...');
    const typesFile = path.join(__dirname, '../frontend/src/types/global.d.ts');
    let typesComplete = false;
    
    if (fs.existsSync(typesFile)) {
      const typesContent = fs.readFileSync(typesFile, 'utf8');
      const typesChecks = [
        'loadPedidosSection',
        'loadPedidosData',
        'setupPedidosEventListeners',
        'applyPedidoFilters',
        'clearPedidoFilters',
        'viewPedido',
        'editPedido',
        'startDelivery',
        'completeDelivery',
        'cancelPedido',
        'updatePedidoStatus'
      ];
      
      const typesResults = typesChecks.map(check => ({
        check,
        found: typesContent.includes(check)
      }));
      
      console.log('✅ Archivo de tipos encontrado');
      typesResults.forEach(result => {
        console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
      });
      
      typesComplete = typesResults.every(r => r.found);
      console.log(`\n📊 Tipos completos: ${typesComplete ? '✅' : '❌'}\n`);
    } else {
      console.log('❌ Archivo de tipos no encontrado\n');
    }

    console.log('📋 5. Verificando funciones globales...');
    const globalFunctions = [
      'window.loadPedidosSection',
      'window.loadPedidosData',
      'window.setupPedidosEventListeners',
      'window.applyPedidoFilters',
      'window.clearPedidoFilters',
      'window.viewPedido',
      'window.editPedido',
      'window.startDelivery',
      'window.completeDelivery',
      'window.cancelPedido',
      'window.updatePedidoStatus'
    ];
    
    const globalResults = globalFunctions.map(func => ({
      func,
      found: indexContent.includes(func)
    }));
    
    globalResults.forEach(result => {
      console.log(`   ${result.found ? '✅' : '❌'} ${result.func}`);
    });
    
    const globalComplete = globalResults.every(r => r.found);
    console.log(`\n📊 Funciones globales completas: ${globalComplete ? '✅' : '❌'}\n`);

    let uiComplete = false;
    let funcComplete = false;

    console.log('📋 6. Verificando estructura de la UI...');
    const uiChecks = [
      'pedidos-header',
      'actions-panel',
      'filters-panel',
      'pedidos-counter',
      'pedidos-list',
      'pedidos-grid',
      'pedido-header',
      'pedido-info',
      'pedido-cliente',
      'pedido-items',
      'pedido-total',
      'pedido-actions'
    ];
    
    const uiResults = uiChecks.map(check => ({
      check,
      found: indexContent.includes(check)
    }));
    
    uiResults.forEach(result => {
      console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
    });
    
    uiComplete = uiResults.every(r => r.found);
    console.log(`\n📊 UI completa: ${uiComplete ? '✅' : '❌'}\n`);

    console.log('📋 7. Verificando funcionalidades...');
    const funcChecks = [
      'showCreateOrderModal',
      'exportPedidos',
      'showDeliveryMap',
      'getStatusIcon',
      'getStatusText',
      'renderPedidoItems',
      'debounce',
      'showPedidosError'
    ];
    
    const funcResults = funcChecks.map(check => ({
      check,
      found: indexContent.includes(check)
    }));
    
    funcResults.forEach(result => {
      console.log(`   ${result.found ? '✅' : '❌'} ${result.check}`);
    });
    
    funcComplete = funcResults.every(r => r.found);
    console.log(`\n📊 Funcionalidades completas: ${funcComplete ? '✅' : '❌'}\n`);

    // Resumen final
    const allChecks = [
      { name: 'CSS', complete: cssComplete },
      { name: 'Index', complete: indexComplete },
      { name: 'Layout', complete: layoutComplete },
      { name: 'Tipos', complete: typesComplete },
      { name: 'Funciones Globales', complete: globalComplete },
      { name: 'UI', complete: uiComplete },
      { name: 'Funcionalidades', complete: funcComplete }
    ];
    
    const totalComplete = allChecks.filter(c => c.complete).length;
    const totalChecks = allChecks.length;
    
    console.log('🎯 RESUMEN FINAL:');
    console.log('================');
    allChecks.forEach(check => {
      console.log(`${check.complete ? '✅' : '❌'} ${check.name}`);
    });
    
    console.log(`\n📊 Total: ${totalComplete}/${totalChecks} verificaciones exitosas`);
    
    if (totalComplete === totalChecks) {
      console.log('\n🎉 ¡TODAS LAS VERIFICACIONES EXITOSAS!');
      console.log('✅ La sección de pedidos moderna está completamente implementada');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
      console.log('🔧 Revisa los elementos marcados con ❌');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
  }
}

// Ejecutar test
testPedidosModernos();
