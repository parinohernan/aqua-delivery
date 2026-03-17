/**
 * Tests de saldo en entrega con pago inmediato.
 * Verifica la fórmula: saldo_nuevo = saldo_viejo + totalPedido - montoCobrado
 * y el comportamiento de retornables.
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001/api';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

async function makeRequest(method, endpoint, data = null) {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    if (data) config.data = data;
    const response = await axios(config);
    return response.data;
}

async function getClienteState(clienteId) {
    const clientes = await makeRequest('GET', '/clientes');
    const c = clientes.find(x => x.codigo === Number(clienteId) || x.id === Number(clienteId));
    return {
        saldo: parseFloat(c?.saldo ?? 0),
        retornables: parseInt(c?.retornables ?? 0, 10)
    };
}

async function setClienteSaldo(clienteId, saldoDinero, saldoRetornables = null) {
    const clientes = await makeRequest('GET', '/clientes');
    const c = clientes.find(x => x.codigo === Number(clienteId) || x.id === Number(clienteId));
    if (!c) throw new Error(`Cliente ${clienteId} no encontrado`);
    const payload = {
        nombre: c.nombre,
        apellido: c.apellido || '',
        direccion: c.direccion || '',
        zona: c.zona || '',
        telefono: c.telefono || '',
        saldoDinero: Number(saldoDinero),
        saldoRetornables: saldoRetornables !== null ? Number(saldoRetornables) : (c.retornables ?? 0)
    };
    await makeRequest('PUT', `/clientes/${c.codigo || c.id}`, payload);
}

async function createPedido(clienteId, productos, total) {
    const body = { clienteId: Number(clienteId), productos, total };
    const pedido = await makeRequest('POST', '/pedidos', body);
    return pedido;
}

async function entregar(pedidoId, tipoPagoId, montoCobrado, totalPedido, totalRetornables, retornablesDevueltos = 0) {
    await makeRequest('POST', `/pedidos/${pedidoId}/entregar`, {
        tipoPago: tipoPagoId,
        montoCobrado: Number(montoCobrado),
        totalPedido: Number(totalPedido),
        totalRetornables: Number(totalRetornables),
        retornablesDevueltos: Number(retornablesDevueltos)
    });
}

function assertEqual(actual, expected, msg) {
    const ok = actual === expected || (Number(actual) === Number(expected));
    if (!ok) throw new Error(`${msg}: esperado ${expected}, obtenido ${actual}`);
}

function assertClose(actual, expected, msg, tolerance = 0.01) {
    const a = Number(actual);
    const e = Number(expected);
    if (Math.abs(a - e) > tolerance) throw new Error(`${msg}: esperado ~${expected}, obtenido ${actual}`);
}

async function runTests() {
    if (!TEST_TOKEN) {
        console.error('❌ Falta TEST_TOKEN. Copia tests/.env.example a tests/.env y define TEST_TOKEN con tu JWT.');
        throw new Error('TEST_TOKEN no configurado');
    }
    console.log('Tests de saldo en entrega (pago inmediato)');
    console.log('API:', BASE_URL, '\n');
    const tipoEfectivo = 1;
    let clienteId;
    let productos;

    try {
        const clientes = await makeRequest('GET', '/clientes');
        if (!clientes.length) throw new Error('No hay clientes; crear al menos uno.');
        clienteId = clientes[0].codigo || clientes[0].id;

        const prods = await makeRequest('GET', '/productos');
        if (!prods.length) throw new Error('No hay productos.');
        productos = prods.slice(0, 2).map(p => ({
            productoId: p.codigo || p.id,
            cantidad: 1,
            precio: Number(p.precio) || 1000
        }));
        const totalBase = productos.reduce((s, i) => s + i.precio * i.cantidad, 0);
        const T = totalBase;
        const D = 5000;

        await setClienteSaldo(clienteId, 0, 0);

        // 1. Sin deuda, pago exacto -> saldo final 0
        console.log('1. Sin deuda, pago exacto');
        const p1 = await createPedido(clienteId, productos, T);
        await entregar(p1.codigo, tipoEfectivo, T, T, 0, 0);
        const s1 = await getClienteState(clienteId);
        assertClose(s1.saldo, 0, 'Saldo debe quedar 0');
        console.log('   OK saldo = 0\n');

        // 2. Sin deuda, pago de más -> saldo = -(montoCobrado - T)
        console.log('2. Sin deuda, pago de más');
        await setClienteSaldo(clienteId, 0, 0);
        const p2 = await createPedido(clienteId, productos, T);
        await entregar(p2.codigo, tipoEfectivo, T + 5000, T, 0, 0);
        const s2 = await getClienteState(clienteId);
        assertClose(s2.saldo, -5000, 'Saldo debe ser -5000 (crédito)');
        console.log('   OK saldo = -5000\n');

        // 3. Con deuda, pago solo pedido -> saldo final = D
        console.log('3. Con deuda, pago solo pedido');
        await setClienteSaldo(clienteId, D, 0);
        const p3 = await createPedido(clienteId, productos, T);
        await entregar(p3.codigo, tipoEfectivo, T, T, 0, 0);
        const s3 = await getClienteState(clienteId);
        assertClose(s3.saldo, D, 'Saldo debe seguir siendo D');
        console.log('   OK saldo = D\n');

        // 4. Con deuda, pago total con deuda -> saldo final 0
        console.log('4. Con deuda, pago total con deuda');
        await setClienteSaldo(clienteId, D, 0);
        const p4 = await createPedido(clienteId, productos, T);
        await entregar(p4.codigo, tipoEfectivo, D + T, T, 0, 0);
        const s4 = await getClienteState(clienteId);
        assertClose(s4.saldo, 0, 'Saldo debe quedar 0');
        console.log('   OK saldo = 0\n');

        // 5. Con deuda, pago de más -> saldo = D + T - montoCobrado (crédito)
        console.log('5. Con deuda, pago de más');
        await setClienteSaldo(clienteId, D, 0);
        const p5 = await createPedido(clienteId, productos, T);
        await entregar(p5.codigo, tipoEfectivo, D + T + 5000, T, 0, 0);
        const s5 = await getClienteState(clienteId);
        assertClose(s5.saldo, -5000, 'Saldo debe ser -5000');
        console.log('   OK saldo = -5000\n');

        // 6. Pago parcial -> saldo final = D + T - montoCobrado
        console.log('6. Pago parcial');
        await setClienteSaldo(clienteId, D, 0);
        const p6 = await createPedido(clienteId, productos, T);
        const montoParcial = T - 3000;
        await entregar(p6.codigo, tipoEfectivo, montoParcial, T, 0, 0);
        const s6 = await getClienteState(clienteId);
        assertClose(s6.saldo, D + T - montoParcial, 'Saldo = D + T - montoCobrado');
        console.log('   OK saldo = D + T - monto\n');

        // 7. Retornables: 3 en pedido, devuelve 2 -> +1 retornable al cliente
        console.log('7. Retornables: 3 en pedido, devuelve 2');
        const prodsRet = await makeRequest('GET', '/productos');
        const retornable = prodsRet.find(p => p.esRetornable === 1 || p.esRetornable === true);
        if (!retornable) {
            console.log('   Skip: no hay producto retornable en catálogo\n');
        } else {
            await setClienteSaldo(clienteId, 0, 0);
            const itemsRet = [
                { productoId: retornable.codigo || retornable.id, cantidad: 3, precio: Number(retornable.precio) || 1000 }
            ];
            const totalRet = itemsRet[0].precio * 3;
            const p7 = await createPedido(clienteId, itemsRet, totalRet);
            const antes = await getClienteState(clienteId);
            await entregar(p7.codigo, tipoEfectivo, totalRet, totalRet, 3, 2);
            const despues = await getClienteState(clienteId);
            assertEqual(despues.retornables, antes.retornables + 1, 'Retornables deben aumentar en 1');
            console.log('   OK retornables +1\n');
        }

        console.log('Todos los tests pasaron.');
    } catch (err) {
        console.error(err.message || err);
        throw err;
    }
}

if (require.main === module) {
    runTests()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { runTests, getClienteState, setClienteSaldo, createPedido, entregar };
