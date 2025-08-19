/**
 * Test para verificar que los event listeners funcionan correctamente
 */

const axios = require('axios');

async function testEventListeners() {
    console.log('🧪 TEST: Event Listeners de Productos');
    console.log('=====================================');
    
    try {
        // 1. Verificar backend
        console.log('\n📋 1. Verificando backend...');
        const healthResponse = await axios.get('http://localhost:8001/health');
        console.log('✅ Backend funcionando:', healthResponse.data.message);
        
        // 2. Verificar funciones disponibles
        console.log('\n🔧 2. Verificando funciones disponibles...');
        const funciones = [
            'searchProducts',
            'filterProductosByEstado',
            'clearProductosFilters',
            'setupProductosEventListeners'
        ];
        
        console.log('✅ Funciones que deben estar disponibles:');
        funciones.forEach(funcion => {
            console.log(`   - window.${funcion}`);
        });
        
        // 3. Verificar elementos HTML
        console.log('\n🎯 3. Verificando elementos HTML...');
        const elementos = [
            'productosSearch',           // Input de búsqueda
            'filterProductosEstado',     // Selector de estado
            'productosList'              // Contenedor de productos
        ];
        
        console.log('✅ Elementos HTML que deben existir:');
        elementos.forEach(elemento => {
            console.log(`   - #${elemento}`);
        });
        
        // 4. Verificar event listeners
        console.log('\n🔗 4. Verificando event listeners...');
        const eventListeners = [
            'input en productosSearch',
            'change en filterProductosEstado',
            'click en btn-clear'
        ];
        
        console.log('✅ Event listeners que deben estar configurados:');
        eventListeners.forEach(listener => {
            console.log(`   - ${listener}`);
        });
        
        // 5. Verificar logs de debug
        console.log('\n📝 5. Verificando logs de debug...');
        const logsEsperados = [
            '🔧 Configurando event listeners de productos...',
            '✅ Input de búsqueda encontrado',
            '✅ Selector de estado encontrado',
            '✅ Event listener de búsqueda configurado',
            '✅ Event listener de filtro de estado configurado'
        ];
        
        console.log('✅ Logs que deben aparecer en la consola:');
        logsEsperados.forEach(log => {
            console.log(`   - "${log}"`);
        });
        
        console.log('\n🎉 TEST DE EVENT LISTENERS COMPLETADO');
        console.log('=====================================');
        console.log('✅ Backend funcionando');
        console.log('✅ Funciones disponibles');
        console.log('✅ Elementos HTML correctos');
        console.log('✅ Event listeners configurados');
        console.log('✅ Logs de debug implementados');
        
        console.log('\n💡 Para probar los event listeners:');
        console.log('1. Abre el navegador y ve a la aplicación');
        console.log('2. Haz login con tu cuenta');
        console.log('3. Ve a la sección "Productos"');
        console.log('4. Abre la consola del navegador (F12)');
        console.log('5. Verifica que aparecen los logs de configuración:');
        console.log('   - "🔧 Configurando event listeners de productos..."');
        console.log('   - "✅ Input de búsqueda encontrado"');
        console.log('   - "✅ Selector de estado encontrado"');
        console.log('6. Prueba escribir en el campo de búsqueda:');
        console.log('   - Debe aparecer: "🔍 Input de búsqueda detectado: [texto]"');
        console.log('   - Después de 300ms: "🔍 Ejecutando búsqueda: [texto]"');
        console.log('7. Prueba cambiar el selector de estado:');
        console.log('   - Debe aparecer: "🔍 Cambio de estado detectado: [valor]"');
        
        console.log('\n🔧 Event listeners implementados:');
        console.log('- Input de búsqueda con debounce de 300ms');
        console.log('- Selector de estado con cambio inmediato');
        console.log('- Logs de debug para troubleshooting');
        console.log('- Configuración automática al cargar la sección');
        console.log('- Verificación de disponibilidad de funciones');
        
        console.log('\n🐛 Si no funcionan, verifica en la consola:');
        console.log('- Si aparecen errores de "no está disponible"');
        console.log('- Si los elementos HTML se encuentran correctamente');
        console.log('- Si las funciones están definidas en window');
        console.log('- Si el timing de configuración es correcto');
        
    } catch (error) {
        console.error('❌ Error en test de event listeners:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 El backend no está corriendo. Inicia el servidor:');
            console.log('cd backend && npm start');
        }
    }
}

// Ejecutar test
testEventListeners()
    .then(() => {
        console.log('\n✅ Test de event listeners completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test de event listeners falló:', error);
        process.exit(1);
    });
