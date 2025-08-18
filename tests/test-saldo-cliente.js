const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testSaldoCliente() {
    console.log('🧪 TEST: Verificar aplicación de saldo al cliente');
    console.log('================================================');
    
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
        
        const cliente = clientesResponse.data.find(c => c.codigo === 1);
        if (!cliente) {
            console.log('❌ Cliente no encontrado');
            return;
        }
        
        const saldoInicial = parseFloat(cliente.saldo) || 0;
        console.log(`✅ Saldo inicial del cliente ${cliente.nombreCompleto}: $${saldoInicial}`);
        
        // 2. Crear un pedido
        console.log('\n📦 2. Creando pedido de prueba...');
        const pedidoData = {
            clienteId: 1,
            productos: [
                { productoId: 1, cantidad: 1, precio: 1500.00 }
            ],
            total: 1500.00
        };
        
        const pedidoResponse = await axios.post(`${BASE_URL}/pedidos`, pedidoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoId = pedidoResponse.data.codigo;
        console.log(`✅ Pedido creado con ID: ${pedidoId}, Total: $${pedidoData.total}`);
        
        // 3. Entregar el pedido con cuenta corriente (tipo de pago 4)
        console.log('\n💳 3. Entregando pedido con cuenta corriente...');
        await axios.put(`${BASE_URL}/pedidos/${pedidoId}/estado`, {
            estado: 'entregad',
            tipoPago: 4  // Cta Cte
        }, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Pedido entregado con cuenta corriente');
        
        // 4. Verificar saldo final del cliente
        console.log('\n💰 4. Verificando saldo final del cliente...');
        const clientesFinalResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const clienteFinal = clientesFinalResponse.data.find(c => c.codigo === 1);
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
        
        // 5. Verificar saldo del pedido
        console.log('\n📋 5. Verificando saldo del pedido...');
        const pedidosResponse = await axios.get(`${BASE_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoEntregado = pedidosResponse.data.find(p => p.id === pedidoId);
        if (pedidoEntregado) {
            console.log(`✅ Pedido encontrado, saldo: $${pedidoEntregado.saldo || 0}`);
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testSaldoCliente()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
