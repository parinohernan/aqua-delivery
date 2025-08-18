/**
 * Test simple para probar una entrega con Cta Cte
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';

// Token de prueba (necesitas obtener uno válido del navegador)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWVkb20xMzUiLCJ2ZW5kZWRvcklkIjoyLCJjb2RpZ29FbXByZXNhIjoxLCJpYXQiOjE3MzQ0NzI4NzQsImV4cCI6MTczNDU1OTI3NH0.example';

async function testEntregaSimple() {
    console.log('🧪 TEST: Entrega simple con Cta Cte');
    console.log('===================================');
    
    try {
        // 1. Buscar un pedido pendiente
        console.log('\n📋 1. Buscando pedido pendiente...');
        const pedidos = await axios.get(`${BASE_URL}/pedidos`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoPendiente = pedidos.data.find(p => p.estado === 'pendient');
        if (!pedidoPendiente) {
            console.log('❌ No hay pedidos pendientes para probar');
            return;
        }
        
        console.log('✅ Pedido encontrado:', {
            id: pedidoPendiente.id,
            cliente: pedidoPendiente.cliente_nombre,
            total: pedidoPendiente.total,
            estado: pedidoPendiente.estado
        });
        
        // 2. Obtener items del pedido
        console.log('\n📦 2. Obteniendo items del pedido...');
        const items = await axios.get(`${BASE_URL}/pedidos/${pedidoPendiente.id}/items`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Items del pedido:', items.data);
        
        // 3. Calcular retornables
        const totalRetornables = items.data.reduce((sum, item) => {
            return sum + (item.esRetornable ? item.cantidad : 0);
        }, 0);
        
        console.log(`🔄 Total retornables en pedido: ${totalRetornables}`);
        
        // 4. Probar entrega con Cta Cte
        console.log('\n🚚 3. Probando entrega con Cta Cte...');
        
        const entregaData = {
            tipoPago: '7', // Cta Cte
            montoCobrado: 0,
            retornablesDevueltos: totalRetornables, // Devolver todos
            totalRetornables: totalRetornables,
            totalPedido: parseFloat(pedidoPendiente.total)
        };
        
        console.log('📋 Datos de entrega:', entregaData);
        
        const entregaResponse = await axios.post(`${BASE_URL}/pedidos/${pedidoPendiente.id}/entregar`, entregaData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Respuesta de entrega:', entregaResponse.data);
        
        // 5. Verificar estado del cliente
        console.log('\n👤 4. Verificando estado del cliente...');
        const clientes = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const cliente = clientes.data.find(c => c.codigo === pedidoPendiente.codigoCliente);
        if (cliente) {
            console.log('✅ Estado del cliente:', {
                nombre: cliente.nombreCompleto,
                saldo: cliente.saldo,
                retornables: cliente.retornables
            });
        }
        
        console.log('\n🎉 Test completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n💡 Para obtener un token válido:');
            console.log('1. Abre el navegador y ve a la aplicación');
            console.log('2. Abre las herramientas de desarrollador (F12)');
            console.log('3. Ve a la pestaña Network');
            console.log('4. Haz login y busca una request a /api/');
            console.log('5. Copia el token del header Authorization');
            console.log('6. Reemplaza TEST_TOKEN en este archivo');
        }
    }
}

// Ejecutar test
testEntregaSimple()
    .then(() => {
        console.log('\n✅ Test finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
