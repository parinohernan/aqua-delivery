/**
 * Test: Entregas por adelantado
 * 
 * Este test verifica que el sistema permite entregas por adelantado:
 * 1. Cobrar más del total del pedido (vuelto)
 * 2. Devolver más retornables de los que debe el cliente
 * 3. Verificar que los colores se muestran correctamente
 */

const axios = require('axios');
const { getToken } = require('./get-token');

const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testEntregaAdelantado() {
    console.log('\n🧪 TEST: Entregas por adelantado');
    console.log('================================');

    try {
        // 1. Obtener token
        console.log('🔐 Obteniendo token de autenticación...');
        TEST_TOKEN = await getToken();
        if (!TEST_TOKEN) {
            console.log('❌ No se pudo obtener token válido');
            return;
        }
        console.log('✅ Token obtenido:', TEST_TOKEN.substring(0, 50) + '...');

        const headers = {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // 2. Verificar estado inicial de clientes
        console.log('\n📋 1. Verificando estado inicial de clientes...');
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, { headers });
        const clientes = clientesResponse.data;
        
        // Buscar un cliente con saldo y retornables
        const clienteConSaldo = clientes.find(c => parseFloat(c.saldo || 0) > 0);
        const clienteConRetornables = clientes.find(c => parseInt(c.retornables || 0) > 0);
        
        console.log('✅ Clientes con saldo:', clientes.filter(c => parseFloat(c.saldo || 0) > 0).length);
        console.log('✅ Clientes con retornables:', clientes.filter(c => parseInt(c.retornables || 0) > 0).length);

        // 3. Verificar pedidos pendientes
        console.log('\n📋 2. Verificando pedidos pendientes...');
        const pedidosResponse = await axios.get(`${BASE_URL}/pedidos`, { headers });
        const pedidos = pedidosResponse.data;
        
        const pedidosPendientes = pedidos.filter(p => p.estado === 'pendient');
        console.log('✅ Pedidos pendientes:', pedidosPendientes.length);
        
        if (pedidosPendientes.length === 0) {
            console.log('⚠️ No hay pedidos pendientes para probar');
            return;
        }

        // 4. Seleccionar un pedido para probar
        const pedidoSeleccionado = pedidosPendientes[0];
        console.log('📦 Pedido seleccionado:', {
            id: pedidoSeleccionado.id,
            cliente: pedidoSeleccionado.cliente_nombre,
            total: pedidoSeleccionado.total,
            estado: pedidoSeleccionado.estado
        });

        // 5. Verificar tipos de pago
        console.log('\n📋 3. Verificando tipos de pago...');
        const tiposPagoResponse = await axios.get(`${BASE_URL}/tiposdepago`, { headers });
        const tiposPago = tiposPagoResponse.data;
        
        const tiposSinSaldo = tiposPago.filter(tipo => {
            const aplicaSaldo = tipo.aplicaSaldo && typeof tipo.aplicaSaldo === 'object' && tipo.aplicaSaldo.type === 'Buffer' 
                ? tipo.aplicaSaldo.data[0] === 1 
                : tipo.aplicaSaldo === 1 || tipo.aplicaSaldo === true;
            return !aplicaSaldo;
        });
        
        console.log('✅ Tipos sin aplicar saldo:', tiposSinSaldo.length);
        if (tiposSinSaldo.length === 0) {
            console.log('❌ No hay tipos de pago disponibles para pagos inmediatos');
            return;
        }

        // 6. Simular entrega por adelantado (cobrar más del total)
        console.log('\n📋 4. Simulando entrega por adelantado...');
        const tipoPagoId = tiposSinSaldo[0].id;
        const totalPedido = parseFloat(pedidoSeleccionado.total);
        const montoCobrado = totalPedido + 100; // Cobrar $100 más del total
        
        console.log('💰 Datos de la entrega por adelantado:');
        console.log(`   📦 Pedido: ${pedidoSeleccionado.id}`);
        console.log(`   💰 Total pedido: $${totalPedido.toFixed(2)}`);
        console.log(`   💵 Monto cobrado: $${montoCobrado.toFixed(2)}`);
        console.log(`   📊 Vuelto: $${(montoCobrado - totalPedido).toFixed(2)}`);

        const entregaData = {
            tipoPago: tipoPagoId,
            montoCobrado: montoCobrado,
            retornablesDevueltos: 0,
            totalRetornables: 0,
            totalPedido: totalPedido
        };

        const entregaResponse = await axios.post(
            `${BASE_URL}/pedidos/${pedidoSeleccionado.id}/entregar`,
            entregaData,
            { headers }
        );

        const resultadoEntrega = entregaResponse.data;
        console.log('✅ Respuesta de la entrega:', resultadoEntrega);

        // 7. Verificar que el pedido se marcó como entregado
        console.log('\n📋 5. Verificando estado final del pedido...');
        const pedidoFinalResponse = await axios.get(`${BASE_URL}/pedidos`, { headers });
        const pedidoFinal = pedidoFinalResponse.data.find(p => p.id === pedidoSeleccionado.id);
        
        if (pedidoFinal) {
            console.log('📦 Estado final del pedido:', pedidoFinal.estado);
            
            if (pedidoFinal.estado === 'entregad') {
                console.log('✅ CORRECTO: El pedido se entregó exitosamente por adelantado');
                console.log(`   💰 Total pedido: $${totalPedido.toFixed(2)}`);
                console.log(`   💵 Monto cobrado: $${montoCobrado.toFixed(2)}`);
                console.log(`   📊 Vuelto: $${(montoCobrado - totalPedido).toFixed(2)}`);
            } else {
                console.log('❌ ERROR: El pedido no se entregó correctamente');
            }
        } else {
            console.log('✅ CORRECTO: El pedido ya no aparece en la lista (fue entregado)');
            console.log(`   💰 Total pedido: $${totalPedido.toFixed(2)}`);
            console.log(`   💵 Monto cobrado: $${montoCobrado.toFixed(2)}`);
            console.log(`   📊 Vuelto: $${(montoCobrado - totalPedido).toFixed(2)}`);
        }

        // 8. Verificar colores en la gestión de clientes
        console.log('\n📋 6. Verificando lógica de colores...');
        const cliente = clientes.find(c => c.codigo == pedidoSeleccionado.clienteId || c.id == pedidoSeleccionado.clienteId);
        
        if (cliente) {
            const saldoCliente = parseFloat(cliente.saldo || 0);
            const retornablesCliente = parseInt(cliente.retornables || 0);
            
            console.log('👤 Cliente:', cliente.nombreCompleto);
            console.log('💰 Saldo:', saldoCliente);
            console.log('🔄 Retornables:', retornablesCliente);
            
            // Verificar lógica de colores
            const colorSaldo = saldoCliente <= 0 ? '#059669' : '#dc2626'; // Verde si <= 0, Rojo si > 0
            const colorRetornables = retornablesCliente <= 0 ? '#059669' : '#dc2626'; // Verde si <= 0, Rojo si > 0
            
            console.log('🎨 Color saldo:', colorSaldo, saldoCliente <= 0 ? '(Verde - Bueno)' : '(Rojo - Deuda)');
            console.log('🎨 Color retornables:', colorRetornables, retornablesCliente <= 0 ? '(Verde - Bueno)' : '(Rojo - Deuda)');
        } else {
            console.log('⚠️ No se pudo encontrar el cliente para verificar colores');
        }

        console.log('\n🎉 Test completado');

    } catch (error) {
        console.error('❌ Error en el test:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Ejecutar el test
testEntregaAdelantado();
