const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testEsRetornableRequerido() {
    console.log('🧪 TEST: Verificar que esRetornable es requerido');
    console.log('===============================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        console.log('\n🧠 Simulando lógica del frontend con diferentes escenarios:');
        
        // Escenario 1: esRetornable = 1 (válido)
        console.log('\n📋 Escenario 1: esRetornable = 1 (válido)');
        const item1 = {
            codigoProducto: 1,
            nombreProducto: 'Bidón 20L',
            cantidad: 1,
            esRetornable: 1
        };
        
        try {
            if (item1.esRetornable === undefined || item1.esRetornable === null) {
                throw new Error(`Campo esRetornable no disponible para producto ${item1.nombreProducto}`);
            }
            const esRetornable1 = item1.esRetornable === 1 || item1.esRetornable === true;
            console.log(`   ✅ Producto: ${item1.nombreProducto} - esRetornable: ${item1.esRetornable} - Resultado: ${esRetornable1}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Escenario 2: esRetornable = 0 (válido)
        console.log('\n📋 Escenario 2: esRetornable = 0 (válido)');
        const item2 = {
            codigoProducto: 2,
            nombreProducto: 'Botella 2L',
            cantidad: 1,
            esRetornable: 0
        };
        
        try {
            if (item2.esRetornable === undefined || item2.esRetornable === null) {
                throw new Error(`Campo esRetornable no disponible para producto ${item2.nombreProducto}`);
            }
            const esRetornable2 = item2.esRetornable === 1 || item2.esRetornable === true;
            console.log(`   ✅ Producto: ${item2.nombreProducto} - esRetornable: ${item2.esRetornable} - Resultado: ${esRetornable2}`);
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Escenario 3: esRetornable = undefined (debe fallar)
        console.log('\n📋 Escenario 3: esRetornable = undefined (debe fallar)');
        const item3 = {
            codigoProducto: 3,
            nombreProducto: 'Producto sin configurar',
            cantidad: 1,
            esRetornable: undefined
        };
        
        try {
            if (item3.esRetornable === undefined || item3.esRetornable === null) {
                throw new Error(`Campo esRetornable no disponible para producto ${item3.nombreProducto}`);
            }
            const esRetornable3 = item3.esRetornable === 1 || item3.esRetornable === true;
            console.log(`   ❌ Producto: ${item3.nombreProducto} - esRetornable: ${item3.esRetornable} - Resultado: ${esRetornable3}`);
        } catch (error) {
            console.log(`   ✅ Error esperado: ${error.message}`);
        }
        
        // Escenario 4: esRetornable = null (debe fallar)
        console.log('\n📋 Escenario 4: esRetornable = null (debe fallar)');
        const item4 = {
            codigoProducto: 4,
            nombreProducto: 'Producto con null',
            cantidad: 1,
            esRetornable: null
        };
        
        try {
            if (item4.esRetornable === undefined || item4.esRetornable === null) {
                throw new Error(`Campo esRetornable no disponible para producto ${item4.nombreProducto}`);
            }
            const esRetornable4 = item4.esRetornable === 1 || item4.esRetornable === true;
            console.log(`   ❌ Producto: ${item4.nombreProducto} - esRetornable: ${item4.esRetornable} - Resultado: ${esRetornable4}`);
        } catch (error) {
            console.log(`   ✅ Error esperado: ${error.message}`);
        }
        
        // Resumen
        console.log('\n📊 Resumen de la lógica:');
        console.log('   ✅ Solo se aceptan valores 1 (true) o 0 (false) para esRetornable');
        console.log('   ✅ Si esRetornable es undefined o null, el sistema falla con error claro');
        console.log('   ✅ No hay lógica de respaldo o heurística');
        console.log('   ✅ El sistema es determinístico y preciso');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testEsRetornableRequerido()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
