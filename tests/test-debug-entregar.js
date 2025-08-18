const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testDebugEntregar() {
    console.log('🧪 TEST: Debug endpoint /entregar');
    console.log('==================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // 1. Verificar tipo de pago directamente
        console.log('\n📋 1. Verificando tipo de pago ID 4...');
        const tipoPagoResponse = await axios.get(`${BASE_URL}/tiposdepago/debug/4`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Tipo de pago debug:', tipoPagoResponse.data);
        
        // 2. Crear un pedido simple
        console.log('\n📦 2. Creando pedido de prueba...');
        const pedidoData = {
            clienteId: 3,
            productos: [
                { productoId: 3, cantidad: 1, precio: 300.00 }
            ],
            total: 300.00
        };
        
        const pedidoResponse = await axios.post(`${BASE_URL}/pedidos`, pedidoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoId = pedidoResponse.data.codigo;
        console.log(`✅ Pedido creado con ID: ${pedidoId}, Total: $${pedidoData.total}`);
        
        // 3. Intentar entrega y capturar logs del servidor
        console.log('\n🚚 3. Intentando entrega...');
        const entregaData = {
            tipoPago: 4,  // Cta Cte
            montoCobrado: 0,
            retornablesDevueltos: 0,
            totalRetornables: 0,
            totalPedido: 300.00
        };
        
        console.log('📋 Datos de entrega:', entregaData);
        
        try {
            const entregaResponse = await axios.post(`${BASE_URL}/pedidos/${pedidoId}/entregar`, entregaData, {
                headers: {
                    'Authorization': `Bearer ${TEST_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Respuesta de entrega:', entregaResponse.data);
            
        } catch (error) {
            console.error('❌ Error en entrega:', error.response?.data || error.message);
        }
        
        // 4. Verificar estado final
        console.log('\n💰 4. Verificando estado final...');
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cliente = clientesResponse.data.find(c => c.codigo === 3);
        console.log(`✅ Cliente final: saldo $${cliente?.saldo || 0}`);
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testDebugEntregar()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
