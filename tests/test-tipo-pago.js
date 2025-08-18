const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testTipoPago() {
    console.log('🧪 TEST: Verificar consulta de tipo de pago');
    console.log('==========================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // Consultar tipos de pago
        console.log('\n📋 Consultando tipos de pago...');
        const tiposPagoResponse = await axios.get(`${BASE_URL}/tiposdepago`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tipos de pago obtenidos:', tiposPagoResponse.data);
        
        // Buscar Cta Cte
        const ctaCte = tiposPagoResponse.data.find(t => t.id === 4);
        if (ctaCte) {
            console.log('\n💳 Tipo de pago Cta Cte encontrado:');
            console.log(`   📋 ID: ${ctaCte.id}`);
            console.log(`   💳 Nombre: ${ctaCte.pago}`);
            console.log(`   💰 aplicaSaldo raw:`, ctaCte.aplicaSaldo);
            console.log(`   💰 aplicaSaldo tipo:`, typeof ctaCte.aplicaSaldo);
            
            // Probar conversión
            let aplicaSaldo = false;
            if (ctaCte.aplicaSaldo) {
                if (typeof ctaCte.aplicaSaldo === 'object' && ctaCte.aplicaSaldo.type === 'Buffer') {
                    aplicaSaldo = ctaCte.aplicaSaldo.data[0] === 1;
                    console.log(`   🔄 Es Buffer, data[0]: ${ctaCte.aplicaSaldo.data[0]}, resultado: ${aplicaSaldo}`);
                } else if (typeof ctaCte.aplicaSaldo === 'number') {
                    aplicaSaldo = ctaCte.aplicaSaldo === 1;
                    console.log(`   🔄 Es número, valor: ${ctaCte.aplicaSaldo}, resultado: ${aplicaSaldo}`);
                } else if (typeof ctaCte.aplicaSaldo === 'string') {
                    aplicaSaldo = parseInt(ctaCte.aplicaSaldo) === 1;
                    console.log(`   🔄 Es string, valor: "${ctaCte.aplicaSaldo}", resultado: ${aplicaSaldo}`);
                } else if (typeof ctaCte.aplicaSaldo === 'boolean') {
                    aplicaSaldo = ctaCte.aplicaSaldo;
                    console.log(`   🔄 Es boolean, valor: ${ctaCte.aplicaSaldo}`);
                }
            }
            
            console.log(`   💰 aplicaSaldo convertido: ${aplicaSaldo}`);
            
            if (!aplicaSaldo) {
                console.log('❌ PROBLEMA: aplicaSaldo debería ser true para Cta Cte');
            } else {
                console.log('✅ CORRECTO: aplicaSaldo es true para Cta Cte');
            }
        } else {
            console.log('❌ No se encontró el tipo de pago Cta Cte');
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testTipoPago()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
