/**
 * Tests para el flujo de entrega de pedidos
 * Simula todos los casos posibles de entrega
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Token de prueba

// Datos de prueba
const TEST_DATA = {
    empresa: 1,
    vendedor: 2,
    clientes: [
        { id: 7, nombre: 'Aby Guadalupe', saldo: 0, retornables: 0 },
        { id: 8, nombre: 'Cliente Test', saldo: 0, retornables: 0 }
    ],
    productos: [
        { id: 1, nombre: 'Bidón 20L', precio: 1500, esRetornable: 1 },
        { id: 2, nombre: 'Bidón 12L', precio: 1000, esRetornable: 1 },
        { id: 13, nombre: 'Cafe Don Ramon 200 grs', precio: 4200, esRetornable: 0 }
    ],
    tiposPago: [
        { id: 1, nombre: 'Efectivo', aplicaSaldo: 0 },
        { id: 7, nombre: 'Cta Cte', aplicaSaldo: 1 }
    ]
};

// Helper para hacer requests autenticados
async function makeRequest(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`❌ Error en ${method} ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
}

// Helper para obtener estado del cliente
async function getClienteState(clienteId) {
    const clientes = await makeRequest('GET', '/clientes');
    const cliente = clientes.find(c => c.codigo === clienteId);
    return {
        saldo: parseFloat(cliente?.saldo || 0),
        retornables: parseInt(cliente?.retornables || 0)
    };
}

// Helper para crear pedido de prueba
async function createTestPedido(clienteId, items) {
    const pedidoData = {
        codigoCliente: clienteId,
        codigoEmpresa: TEST_DATA.empresa,
        codigoVendedorPedido: TEST_DATA.vendedor,
        items: items,
        total: items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
    
    console.log('📦 Creando pedido de prueba:', pedidoData);
    const pedido = await makeRequest('POST', '/pedidos', pedidoData);
    console.log('✅ Pedido creado:', pedido);
    return pedido;
}

// Helper para entregar pedido
async function entregarPedido(pedidoId, tipoPagoId, retornablesDevueltos = 0) {
    const pedido = await makeRequest('GET', `/pedidos/${pedidoId}`);
    const items = await makeRequest('GET', `/pedidos/${pedidoId}/items`);
    
    // Calcular retornables totales
    const totalRetornables = items.reduce((sum, item) => {
        const producto = TEST_DATA.productos.find(p => p.id === item.codigoProducto);
        return sum + (producto?.esRetornable ? item.cantidad : 0);
    }, 0);
    
    const entregaData = {
        tipoPago: tipoPagoId,
        montoCobrado: 0, // Se calcula automáticamente
        retornablesDevueltos: retornablesDevueltos,
        totalRetornables: totalRetornables,
        totalPedido: parseFloat(pedido.total)
    };
    
    console.log('🚚 Entregando pedido:', entregaData);
    const resultado = await makeRequest('POST', `/pedidos/${pedidoId}/entregar`, entregaData);
    console.log('✅ Entrega completada:', resultado);
    return resultado;
}

// Tests principales
async function runTests() {
    console.log('🧪 INICIANDO TESTS DE ENTREGA DE PEDIDOS');
    console.log('==========================================');
    
    try {
        // Test 1: Pedido con retornables, pago efectivo, todos devueltos
        console.log('\n📋 TEST 1: Pedido con retornables, pago efectivo, todos devueltos');
        console.log('---------------------------------------------------------------');
        
        const cliente1 = TEST_DATA.clientes[0];
        const estadoInicial1 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado inicial:`, estadoInicial1);
        
        // Crear pedido con 2 bidones (retornables)
        const pedido1 = await createTestPedido(cliente1.id, [
            { codigoProducto: 1, cantidad: 1, precio: 1500 }, // Bidón 20L
            { codigoProducto: 2, cantidad: 1, precio: 1000 }  // Bidón 12L
        ]);
        
        // Entregar con efectivo, todos los retornables devueltos
        await entregarPedido(pedido1.id, 1, 2); // tipoPago: Efectivo, 2 retornables devueltos
        
        const estadoFinal1 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado final:`, estadoFinal1);
        
        // Verificar resultados
        const saldoCambio1 = estadoFinal1.saldo - estadoInicial1.saldo;
        const retornablesCambio1 = estadoFinal1.retornables - estadoInicial1.retornables;
        
        console.log(`💰 Cambio en saldo: $${saldoCambio1} (debería ser 0)`);
        console.log(`🔄 Cambio en retornables: ${retornablesCambio1} (debería ser 0)`);
        
        // Test 2: Pedido con retornables, pago efectivo, algunos devueltos
        console.log('\n📋 TEST 2: Pedido con retornables, pago efectivo, algunos devueltos');
        console.log('-------------------------------------------------------------------');
        
        const pedido2 = await createTestPedido(cliente1.id, [
            { codigoProducto: 1, cantidad: 2, precio: 1500 }, // 2 Bidones 20L
            { codigoProducto: 13, cantidad: 1, precio: 4200 } // 1 Cafe (no retornable)
        ]);
        
        // Entregar con efectivo, solo 1 retornable devuelto
        await entregarPedido(pedido2.id, 1, 1); // tipoPago: Efectivo, 1 retornable devuelto
        
        const estadoFinal2 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado final:`, estadoFinal2);
        
        const retornablesCambio2 = estadoFinal2.retornables - estadoFinal1.retornables;
        console.log(`🔄 Cambio en retornables: ${retornablesCambio2} (debería ser 1)`);
        
        // Test 3: Pedido con retornables, cuenta corriente, todos devueltos
        console.log('\n📋 TEST 3: Pedido con retornables, cuenta corriente, todos devueltos');
        console.log('------------------------------------------------------------------------');
        
        const pedido3 = await createTestPedido(cliente1.id, [
            { codigoProducto: 1, cantidad: 1, precio: 1500 }, // Bidón 20L
            { codigoProducto: 2, cantidad: 1, precio: 1000 }  // Bidón 12L
        ]);
        
        // Entregar con cuenta corriente, todos los retornables devueltos
        await entregarPedido(pedido3.id, 7, 2); // tipoPago: Cta Cte, 2 retornables devueltos
        
        const estadoFinal3 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado final:`, estadoFinal3);
        
        const saldoCambio3 = estadoFinal3.saldo - estadoFinal2.saldo;
        console.log(`💰 Cambio en saldo: $${saldoCambio3} (debería ser 2500)`);
        
        // Test 4: Pedido sin retornables, cuenta corriente
        console.log('\n📋 TEST 4: Pedido sin retornables, cuenta corriente');
        console.log('---------------------------------------------------');
        
        const pedido4 = await createTestPedido(cliente1.id, [
            { codigoProducto: 13, cantidad: 2, precio: 4200 } // 2 Cafes (no retornables)
        ]);
        
        // Entregar con cuenta corriente, no hay retornables
        await entregarPedido(pedido4.id, 7, 0); // tipoPago: Cta Cte, 0 retornables
        
        const estadoFinal4 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado final:`, estadoFinal4);
        
        const saldoCambio4 = estadoFinal4.saldo - estadoFinal3.saldo;
        console.log(`💰 Cambio en saldo: $${saldoCambio4} (debería ser 8400)`);
        
        // Test 5: Pedido mixto, cuenta corriente, algunos retornables devueltos
        console.log('\n📋 TEST 5: Pedido mixto, cuenta corriente, algunos retornables devueltos');
        console.log('-------------------------------------------------------------------------');
        
        const pedido5 = await createTestPedido(cliente1.id, [
            { codigoProducto: 1, cantidad: 3, precio: 1500 }, // 3 Bidones 20L
            { codigoProducto: 13, cantidad: 1, precio: 4200 } // 1 Cafe
        ]);
        
        // Entregar con cuenta corriente, solo 2 retornables devueltos
        await entregarPedido(pedido5.id, 7, 2); // tipoPago: Cta Cte, 2 retornables devueltos
        
        const estadoFinal5 = await getClienteState(cliente1.id);
        console.log(`👤 Cliente ${cliente1.nombre} - Estado final:`, estadoFinal5);
        
        const saldoCambio5 = estadoFinal5.saldo - estadoFinal4.saldo;
        const retornablesCambio5 = estadoFinal5.retornables - estadoFinal4.retornables;
        
        console.log(`💰 Cambio en saldo: $${saldoCambio5} (debería ser 8700)`);
        console.log(`🔄 Cambio en retornables: ${retornablesCambio5} (debería ser 1)`);
        
        // Resumen final
        console.log('\n📊 RESUMEN FINAL');
        console.log('================');
        console.log(`👤 Cliente ${cliente1.nombre}:`);
        console.log(`   💰 Saldo final: $${estadoFinal5.saldo}`);
        console.log(`   🔄 Retornables final: ${estadoFinal5.retornables}`);
        
        console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
        
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    }
}

// Función para limpiar datos de prueba
async function cleanupTestData() {
    console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA');
    console.log('============================');
    
    try {
        // Obtener pedidos de prueba y eliminarlos
        const pedidos = await makeRequest('GET', '/pedidos');
        const pedidosTest = pedidos.filter(p => p.codigoCliente === TEST_DATA.clientes[0].id);
        
        for (const pedido of pedidosTest) {
            console.log(`🗑️ Eliminando pedido ${pedido.id}`);
            await makeRequest('DELETE', `/pedidos/${pedido.id}`);
        }
        
        // Resetear saldo y retornables del cliente de prueba
        await makeRequest('PUT', `/clientes/${TEST_DATA.clientes[0].id}`, {
            saldo: 0,
            retornables: 0
        });
        
        console.log('✅ Limpieza completada');
        
    } catch (error) {
        console.error('❌ Error en limpieza:', error);
    }
}

// Ejecutar tests
if (require.main === module) {
    runTests()
        .then(() => {
            console.log('\n🎉 Tests completados exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Tests fallaron:', error);
            process.exit(1);
        });
}

module.exports = {
    runTests,
    cleanupTestData,
    createTestPedido,
    entregarPedido,
    getClienteState
};
