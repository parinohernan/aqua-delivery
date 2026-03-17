/**
 * Tests para el flujo de entrega de pedidos
 * Simula todos los casos posibles de entrega
 */

require('dotenv').config();
const axios = require('axios');

// Configuración (puerto 8001 por defecto; token desde .env)
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001/api';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

// Se rellenan al iniciar runTests con datos reales de la API
let PRODUCTOS_API = [];

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
    const cliente = clientes.find(c => (c.codigo ?? c.id) === Number(clienteId));
    return {
        saldo: parseFloat(cliente?.saldo ?? 0),
        retornables: parseInt(cliente?.retornables ?? 0, 10)
    };
}

// Helper para crear pedido de prueba (backend espera clienteId, productos con productoId, total)
async function createTestPedido(clienteId, items) {
    const productos = items.map((item) => ({
        productoId: item.codigoProducto || item.productoId,
        cantidad: item.cantidad,
        precio: item.precio
    }));
    const total = productos.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const pedidoData = { clienteId: Number(clienteId), productos, total };

    console.log('📦 Creando pedido de prueba:', pedidoData);
    const pedido = await makeRequest('POST', '/pedidos', pedidoData);
    console.log('✅ Pedido creado:', pedido);
    return pedido;
}

// Helper para entregar pedido
async function entregarPedido(pedidoId, tipoPagoId, retornablesDevueltos = 0) {
    const pedido = await makeRequest('GET', `/pedidos/${pedidoId}`);
    const items = await makeRequest('GET', `/pedidos/${pedidoId}/items`);
    
    // Calcular retornables totales (usar productos cargados de la API)
    const totalRetornables = items.reduce((sum, item) => {
        const producto = PRODUCTOS_API.find(p => (p.codigo ?? p.id) === item.codigoProducto);
        const esRetornable = producto?.esRetornable === 1 || producto?.esRetornable === true;
        return sum + (esRetornable ? item.cantidad : 0);
    }, 0);
    
    const totalPedido = parseFloat(pedido.total);
    const tipoEfectivo = 1;
    const montoCobrado = tipoPagoId === tipoEfectivo ? totalPedido : 0;
    const entregaData = {
        tipoPago: tipoPagoId,
        montoCobrado,
        retornablesDevueltos: retornablesDevueltos,
        totalRetornables: totalRetornables,
        totalPedido
    };
    
    console.log('🚚 Entregando pedido:', entregaData);
    const resultado = await makeRequest('POST', `/pedidos/${pedidoId}/entregar`, entregaData);
    console.log('✅ Entrega completada:', resultado);
    return resultado;
}

// Tests principales
async function runTests() {
    if (!TEST_TOKEN) {
        console.error('❌ Falta TEST_TOKEN. Copia tests/.env.example a tests/.env y define TEST_TOKEN con tu JWT.');
        throw new Error('TEST_TOKEN no configurado');
    }
    console.log('🧪 INICIANDO TESTS DE ENTREGA DE PEDIDOS');
    console.log('==========================================');
    console.log('   API:', BASE_URL);
    console.log('');

    let clientesFromApi;
    let productosFromApi;
    let clienteId;
    let clienteNombre;
    let prod1;
    let prod2;
    let prodNoRetornable;

    try {
        clientesFromApi = await makeRequest('GET', '/clientes');
        productosFromApi = await makeRequest('GET', '/productos');
        if (!clientesFromApi?.length) throw new Error('No hay clientes en la API. Crea al menos uno.');
        if (!productosFromApi?.length) throw new Error('No hay productos en la API. Crea al menos uno.');

        PRODUCTOS_API = productosFromApi;
        const cliente = clientesFromApi[0];
        clienteId = cliente.codigo ?? cliente.id;
        clienteNombre = [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || 'Cliente';

        prod1 = productosFromApi[0];
        prod2 = productosFromApi[1] ?? productosFromApi[0];
        const retornables = productosFromApi.filter(p => p.esRetornable === 1 || p.esRetornable === true);
        const noRetornables = productosFromApi.filter(p => !p.esRetornable && p.esRetornable !== 1);
        prodNoRetornable = noRetornables[0] ?? productosFromApi[0];

        const id = (p) => p.codigo ?? p.id;
        const precio = (p) => Number(p.precio) || 0;

        // Test 1: Pedido con retornables, pago efectivo, todos devueltos
        console.log('\n📋 TEST 1: Pedido con retornables, pago efectivo, todos devueltos');
        console.log('---------------------------------------------------------------');

        const estadoInicial1 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado inicial:`, estadoInicial1);

        const items1 = [
            { codigoProducto: id(prod1), cantidad: 1, precio: precio(prod1) },
            { codigoProducto: id(prod2), cantidad: 1, precio: precio(prod2) }
        ];
        const pedido1 = await createTestPedido(clienteId, items1);
        const retornables1 = items1.reduce((s, it) => {
            const p = PRODUCTOS_API.find(x => (x.codigo ?? x.id) === it.codigoProducto);
            return s + ((p?.esRetornable === 1 || p?.esRetornable === true) ? it.cantidad : 0);
        }, 0);
        await entregarPedido(pedido1.codigo || pedido1.id, 1, retornables1);

        const estadoFinal1 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado final:`, estadoFinal1);
        console.log(`💰 Cambio en saldo: $${estadoFinal1.saldo - estadoInicial1.saldo} (debería ser 0)`);
        console.log(`🔄 Cambio en retornables: ${estadoFinal1.retornables - estadoInicial1.retornables}`);

        // Test 2: Pedido con retornables, pago efectivo, algunos devueltos
        console.log('\n📋 TEST 2: Pedido con retornables, pago efectivo, algunos devueltos');
        console.log('-------------------------------------------------------------------');

        const items2 = [
            { codigoProducto: id(prod1), cantidad: 2, precio: precio(prod1) },
            { codigoProducto: id(prodNoRetornable), cantidad: 1, precio: precio(prodNoRetornable) }
        ];
        const pedido2 = await createTestPedido(clienteId, items2);
        const retornables2 = items2.reduce((s, it) => {
            const p = PRODUCTOS_API.find(x => (x.codigo ?? x.id) === it.codigoProducto);
            return s + ((p?.esRetornable === 1 || p?.esRetornable === true) ? it.cantidad : 0);
        }, 0);
        await entregarPedido(pedido2.codigo || pedido2.id, 1, Math.max(0, retornables2 - 1));

        const estadoFinal2 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado final:`, estadoFinal2);
        console.log(`🔄 Cambio en retornables: ${estadoFinal2.retornables - estadoFinal1.retornables}`);

        // Test 3: Pedido con retornables, cuenta corriente, todos devueltos
        console.log('\n📋 TEST 3: Pedido con retornables, cuenta corriente, todos devueltos');
        console.log('------------------------------------------------------------------------');

        const pedido3 = await createTestPedido(clienteId, items1);
        await entregarPedido(pedido3.codigo || pedido3.id, 7, retornables1);

        const estadoFinal3 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado final:`, estadoFinal3);
        console.log(`💰 Cambio en saldo: $${estadoFinal3.saldo - estadoFinal2.saldo}`);

        // Test 4: Pedido sin retornables, cuenta corriente
        console.log('\n📋 TEST 4: Pedido sin retornables, cuenta corriente');
        console.log('---------------------------------------------------');

        const items4 = [
            { codigoProducto: id(prodNoRetornable), cantidad: 2, precio: precio(prodNoRetornable) }
        ];
        const pedido4 = await createTestPedido(clienteId, items4);
        await entregarPedido(pedido4.codigo || pedido4.id, 7, 0);

        const estadoFinal4 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado final:`, estadoFinal4);
        console.log(`💰 Cambio en saldo: $${estadoFinal4.saldo - estadoFinal3.saldo}`);

        // Test 5: Pedido mixto, cuenta corriente, algunos retornables devueltos
        console.log('\n📋 TEST 5: Pedido mixto, cuenta corriente, algunos retornables devueltos');
        console.log('-------------------------------------------------------------------------');

        const items5 = [
            { codigoProducto: id(prod1), cantidad: 3, precio: precio(prod1) },
            { codigoProducto: id(prodNoRetornable), cantidad: 1, precio: precio(prodNoRetornable) }
        ];
        const pedido5 = await createTestPedido(clienteId, items5);
        const retornables5 = items5.reduce((s, it) => {
            const p = PRODUCTOS_API.find(x => (x.codigo ?? x.id) === it.codigoProducto);
            return s + ((p?.esRetornable === 1 || p?.esRetornable === true) ? it.cantidad : 0);
        }, 0);
        await entregarPedido(pedido5.codigo || pedido5.id, 7, Math.max(0, retornables5 - 1));

        const estadoFinal5 = await getClienteState(clienteId);
        console.log(`👤 Cliente ${clienteNombre} - Estado final:`, estadoFinal5);
        console.log(`💰 Cambio en saldo: $${estadoFinal5.saldo - estadoFinal4.saldo}`);
        console.log(`🔄 Cambio en retornables: ${estadoFinal5.retornables - estadoFinal4.retornables}`);

        // Resumen final
        console.log('\n📊 RESUMEN FINAL');
        console.log('================');
        console.log(`👤 Cliente ${clienteNombre}:`);
        console.log(`   💰 Saldo final: $${estadoFinal5.saldo}`);
        console.log(`   🔄 Retornables final: ${estadoFinal5.retornables}`);

        console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
        
    } catch (error) {
        console.error('❌ Error ejecutando tests:', error);
    }
}

// Función para limpiar datos de prueba (usa el primer cliente de la API)
async function cleanupTestData() {
    console.log('\n🧹 LIMPIANDO DATOS DE PRUEBA');
    console.log('============================');
    try {
        const clientes = await makeRequest('GET', '/clientes');
        const clienteId = clientes[0] ? (clientes[0].codigo ?? clientes[0].id) : null;
        if (!clienteId) {
            console.log('No hay clientes, nada que limpiar.');
            return;
        }
        const pedidos = await makeRequest('GET', '/pedidos');
        const pedidosTest = pedidos.filter(p => (p.codigoCliente ?? p.clienteId) === clienteId);
        for (const pedido of pedidosTest) {
            const pedidoId = pedido.codigo ?? pedido.id;
            console.log(`🗑️ Eliminando pedido ${pedidoId}`);
            await makeRequest('DELETE', `/pedidos/${pedidoId}`);
        }
        const cliente = clientes[0];
        const payload = {
            nombre: cliente.nombre,
            apellido: cliente.apellido ?? '',
            direccion: cliente.direccion ?? '',
            zona: cliente.zona ?? '',
            telefono: cliente.telefono ?? '',
            saldoDinero: 0,
            saldoRetornables: 0
        };
        await makeRequest('PUT', `/clientes/${clienteId}`, payload);
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
