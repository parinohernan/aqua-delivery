const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testFrontendEntregar() {
    console.log('🧪 TEST: Simular entrega desde frontend');
    console.log('========================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // 1. Verificar saldo inicial del cliente
        console.log('\n📋 1. Verificando saldo inicial del cliente...');
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cliente = clientesResponse.data.find(c => c.codigo === 2); // Usar cliente 2 para no afectar el anterior
        if (!cliente) {
            console.log('❌ Cliente no encontrado');
            return;
        }
        
        const saldoInicial = parseFloat(cliente.saldo) || 0;
        console.log(`✅ Saldo inicial del cliente ${cliente.nombreCompleto}: $${saldoInicial}`);
        
        // 2. Crear un pedido
        console.log('\n📦 2. Creando pedido de prueba...');
        const pedidoData = {
            clienteId: 2,
            productos: [
                { productoId: 2, cantidad: 1, precio: 1000.00 }
            ],
            total: 1000.00
        };
        
        const pedidoResponse = await axios.post(`${BASE_URL}/pedidos`, pedidoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoId = pedidoResponse.data.codigo;
        console.log(`✅ Pedido creado con ID: ${pedidoId}, Total: $${pedidoData.total}`);
        
        // 3. Simular entrega desde frontend (usando el endpoint /entregar)
        console.log('\n🚚 3. Simulando entrega desde frontend...');
        const entregaData = {
            tipoPago: 4,  // Cta Cte
            montoCobrado: 0,  // 0 porque es cuenta corriente
            retornablesDevueltos: 0,
            totalRetornables: 0,
            totalPedido: 1000.00
        };
        
        console.log('📋 Datos de entrega enviados:', entregaData);
        
        const entregaResponse = await axios.post(`${BASE_URL}/pedidos/${pedidoId}/entregar`, entregaData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Respuesta de entrega:', entregaResponse.data);
        
        // 4. Verificar saldo final del cliente
        console.log('\n💰 4. Verificando saldo final del cliente...');
        const clientesFinalResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const clienteFinal = clientesFinalResponse.data.find(c => c.codigo === 2);
        const saldoFinal = parseFloat(clienteFinal.saldo) || 0;
        const diferencia = saldoFinal - saldoInicial;
        
        console.log(`✅ Saldo final del cliente: $${saldoFinal}`);
        console.log(`💰 Diferencia: $${diferencia}`);
        
        if (diferencia === pedidoData.total) {
            console.log('✅ CORRECTO: El saldo se aplicó correctamente al cliente');
        } else {
            console.log('❌ ERROR: El saldo no se aplicó correctamente');
            console.log(`   Esperado: +$${pedidoData.total}`);
            console.log(`   Obtenido: +$${diferencia}`);
        }
        
        // 5. Verificar estado del pedido
        console.log('\n📋 5. Verificando estado del pedido...');
        const pedidosResponse = await axios.get(`${BASE_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoEntregado = pedidosResponse.data.find(p => p.id === pedidoId);
        if (pedidoEntregado) {
            console.log(`✅ Pedido encontrado, estado: ${pedidoEntregado.estado}`);
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        if (error.response) {
            console.error('📋 Status:', error.response.status);
            console.error('📋 Headers:', error.response.headers);
        }
    }
}

// Ejecutar test
testFrontendEntregar()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
