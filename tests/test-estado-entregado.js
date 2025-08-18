/**
 * Test: Verificar que el estado cambia a "entregad" al entregar un pedido
 */

const axios = require('axios');
const { getToken } = require('./get-token');

async function testEstadoEntregado() {
    console.log('\n🧪 TEST: Verificar cambio de estado a "entregad"');
    console.log('==================================================');

    try {
        const token = await getToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 1. Obtener pedidos pendientes
        console.log('📋 1. Obteniendo pedidos pendientes...');
        const responsePendientes = await axios.get('http://localhost:8001/api/pedidos?estado=pendient', { headers });
        const pedidosPendientes = responsePendientes.data;
        
        console.log(`   ✅ Pedidos pendientes encontrados: ${pedidosPendientes.length}`);
        
        if (pedidosPendientes.length === 0) {
            console.log('   ❌ No hay pedidos pendientes para probar');
            return;
        }

        // 2. Seleccionar un pedido para entregar
        const pedidoAEntregar = pedidosPendientes[0];
        console.log(`\n📋 2. Pedido seleccionado para entrega:`);
        console.log(`   📦 ID: ${pedidoAEntregar.id}`);
        console.log(`   👤 Cliente: ${pedidoAEntregar.cliente_nombre}`);
        console.log(`   💰 Total: $${pedidoAEntregar.total}`);
        console.log(`   📊 Estado actual: ${pedidoAEntregar.estado}`);

        // 3. Verificar estado inicial
        console.log('\n📋 3. Verificando estado inicial...');
        const estadoInicial = pedidoAEntregar.estado;
        console.log(`   📊 Estado inicial: ${estadoInicial}`);
        
        if (estadoInicial !== 'pendient') {
            console.log(`   ❌ Error: El pedido no está pendiente (estado: ${estadoInicial})`);
            return;
        }
        console.log(`   ✅ Estado inicial correcto: pendient`);

        // 4. Entregar el pedido
        console.log('\n📋 4. Entregando pedido...');
        const entregaData = {
            tipoPago: 1, // Efectivo
            montoCobrado: pedidoAEntregar.total,
            retornablesDevueltos: 0,
            totalRetornables: 0,
            totalPedido: pedidoAEntregar.total
        };

        const entregaResponse = await axios.post(
            `http://localhost:8001/api/pedidos/${pedidoAEntregar.id}/entregar`,
            entregaData,
            { headers }
        );

        console.log('   ✅ Respuesta de entrega:', entregaResponse.data);

        // 5. Verificar que el estado cambió
        console.log('\n📋 5. Verificando cambio de estado...');
        
        // Esperar un momento para que se procese la transacción
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Obtener el pedido actualizado
        const responseActualizado = await axios.get(`http://localhost:8001/api/pedidos?estado=entregad`, { headers });
        const pedidosEntregados = responseActualizado.data;
        
        const pedidoEntregado = pedidosEntregados.find(p => p.id == pedidoAEntregar.id);
        
        if (pedidoEntregado) {
            console.log(`   ✅ Pedido encontrado en entregados`);
            console.log(`   📊 Estado después de entrega: ${pedidoEntregado.estado}`);
            
            if (pedidoEntregado.estado === 'entregad') {
                console.log(`   ✅ Estado cambiado correctamente a "entregad"`);
            } else {
                console.log(`   ❌ Error: Estado no cambió correctamente (esperado: entregad, actual: ${pedidoEntregado.estado})`);
            }
        } else {
            console.log(`   ❌ Error: No se encontró el pedido en la lista de entregados`);
        }

        // 6. Verificar que ya no está en pendientes
        console.log('\n📋 6. Verificando que ya no está en pendientes...');
        const responsePendientesFinal = await axios.get('http://localhost:8001/api/pedidos?estado=pendient', { headers });
        const pedidosPendientesFinal = responsePendientesFinal.data;
        
        const siguePendiente = pedidosPendientesFinal.find(p => p.id == pedidoAEntregar.id);
        
        if (siguePendiente) {
            console.log(`   ❌ Error: El pedido sigue apareciendo en pendientes`);
        } else {
            console.log(`   ✅ Correcto: El pedido ya no aparece en pendientes`);
        }

        // 7. Resumen final
        console.log('\n📋 7. Resumen final:');
        console.log(`   📦 Pedido #${pedidoAEntregar.id} entregado`);
        console.log(`   📊 Estado inicial: ${estadoInicial}`);
        console.log(`   📊 Estado final: ${pedidoEntregado?.estado || 'No encontrado'}`);
        console.log(`   ✅ Cambio de estado: ${estadoInicial} → ${pedidoEntregado?.estado || 'No encontrado'}`);

        console.log('\n🎉 Test completado - Verificar que el estado cambia correctamente');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testEstadoEntregado();
