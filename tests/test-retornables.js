const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testRetornables() {
    console.log('🧪 TEST: Verificar manejo de retornables');
    console.log('=======================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // 1. Verificar estado inicial del cliente
        console.log('\n📋 1. Verificando estado inicial del cliente...');
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cliente = clientesResponse.data.find(c => c.codigo === 5); // Usar cliente 5
        if (!cliente) {
            console.log('❌ Cliente no encontrado');
            return;
        }
        
        const saldoInicial = parseFloat(cliente.saldo) || 0;
        const retornablesInicial = parseInt(cliente.retornables) || 0;
        console.log(`✅ Estado inicial del cliente ${cliente.nombreCompleto}:`);
        console.log(`   💰 Saldo: $${saldoInicial}`);
        console.log(`   🔄 Retornables: ${retornablesInicial}`);
        
        // 2. Crear un pedido con retornables
        console.log('\n📦 2. Creando pedido con retornables...');
        const pedidoData = {
            clienteId: 5,
            productos: [
                { productoId: 1, cantidad: 2, precio: 1500.00 } // 2 bidones retornables
            ],
            total: 3000.00
        };
        
        const pedidoResponse = await axios.post(`${BASE_URL}/pedidos`, pedidoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoId = pedidoResponse.data.codigo;
        console.log(`✅ Pedido creado con ID: ${pedidoId}, Total: $${pedidoData.total}`);
        
        // 3. Entregar con retornables no devueltos
        console.log('\n🚚 3. Entregando con retornables no devueltos...');
        const entregaData = {
            tipoPago: 4,  // Cta Cte
            montoCobrado: 0,
            retornablesDevueltos: 1,  // Solo devuelve 1 de 2
            totalRetornables: 2,
            totalPedido: 3000.00
        };
        
        console.log('📋 Datos de entrega:', entregaData);
        
        const entregaResponse = await axios.post(`${BASE_URL}/pedidos/${pedidoId}/entregar`, entregaData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Respuesta de entrega:', entregaResponse.data);
        
        // 4. Verificar estado final del cliente
        console.log('\n💰 4. Verificando estado final del cliente...');
        const clientesFinalResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const clienteFinal = clientesFinalResponse.data.find(c => c.codigo === 5);
        const saldoFinal = parseFloat(clienteFinal.saldo) || 0;
        const retornablesFinal = parseInt(clienteFinal.retornables) || 0;
        const diferenciaSaldo = saldoFinal - saldoInicial;
        const diferenciaRetornables = retornablesFinal - retornablesInicial;
        
        console.log(`✅ Estado final del cliente:`);
        console.log(`   💰 Saldo: $${saldoFinal} (diferencia: +$${diferenciaSaldo})`);
        console.log(`   🔄 Retornables: ${retornablesFinal} (diferencia: +${diferenciaRetornables})`);
        
        // Verificar resultados
        let errores = [];
        
        if (diferenciaSaldo !== 3000) {
            errores.push(`Saldo: esperado +$3000, obtenido +$${diferenciaSaldo}`);
        }
        
        if (diferenciaRetornables !== 1) {
            errores.push(`Retornables: esperado +1, obtenido +${diferenciaRetornables}`);
        }
        
        if (errores.length === 0) {
            console.log('✅ CORRECTO: Todos los valores se actualizaron correctamente');
        } else {
            console.log('❌ ERRORES:');
            errores.forEach(error => console.log(`   - ${error}`));
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testRetornables()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
