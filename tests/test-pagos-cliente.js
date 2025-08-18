const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testPagosCliente() {
    console.log('🧪 TEST: Sistema de pagos directos a clientes');
    console.log('============================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // 1. Verificar tipos de pago disponibles
        console.log('\n📋 1. Verificando tipos de pago...');
        const tiposPagoResponse = await axios.get(`${BASE_URL}/tiposdepago`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const todosLosTipos = tiposPagoResponse.data;
        const tiposSinSaldo = todosLosTipos.filter(tipo => {
            const aplicaSaldo = tipo.aplicaSaldo && typeof tipo.aplicaSaldo === 'object' && tipo.aplicaSaldo.type === 'Buffer' 
                ? tipo.aplicaSaldo.data[0] === 1 
                : tipo.aplicaSaldo === 1 || tipo.aplicaSaldo === true;
            return !aplicaSaldo;
        });
        
        console.log(`✅ Tipos de pago totales: ${todosLosTipos.length}`);
        console.log(`✅ Tipos sin aplicar saldo: ${tiposSinSaldo.length}`);
        tiposSinSaldo.forEach(tipo => {
            console.log(`   - ${tipo.id}: ${tipo.pago}`);
        });
        
        if (tiposSinSaldo.length === 0) {
            console.log('❌ No hay tipos de pago disponibles para pagos directos');
            return;
        }
        
        // 2. Verificar estado inicial del cliente
        console.log('\n📋 2. Verificando estado inicial del cliente...');
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
        console.log(`✅ Cliente: ${cliente.nombreCompleto}`);
        console.log(`💰 Saldo inicial: $${saldoInicial.toFixed(2)}`);
        
        // 3. Realizar pago directo
        console.log('\n📋 3. Realizando pago directo...');
        const tipoPagoId = tiposSinSaldo[0].id;
        const montoPago = 500.00;
        
        const pagoData = {
            clienteId: cliente.codigo,
            tipoPagoId: tipoPagoId,
            monto: montoPago,
            observaciones: 'Pago de prueba - Test automatizado'
        };
        
        console.log('📋 Datos del pago:', pagoData);
        
        const pagoResponse = await axios.post(`${BASE_URL}/pagos/cliente`, pagoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const resultadoPago = pagoResponse.data;
        console.log('✅ Respuesta del pago:', resultadoPago);
        
        // 4. Verificar estado final del cliente
        console.log('\n📋 4. Verificando estado final del cliente...');
        const clientesFinalResponse = await axios.get(`${BASE_URL}/clientes`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const clienteFinal = clientesFinalResponse.data.find(c => c.codigo === 5);
        const saldoFinal = parseFloat(clienteFinal.saldo) || 0;
        const diferenciaSaldo = saldoFinal - saldoInicial;
        
        console.log(`💰 Saldo final: $${saldoFinal.toFixed(2)}`);
        console.log(`📊 Diferencia: $${diferenciaSaldo.toFixed(2)} (esperado: -$${montoPago.toFixed(2)})`);
        
        // Verificar resultados
        let errores = [];
        
        if (diferenciaSaldo !== -montoPago) {
            errores.push(`Saldo: esperado -$${montoPago.toFixed(2)}, obtenido $${diferenciaSaldo.toFixed(2)}`);
        }
        
        if (!resultadoPago.success) {
            errores.push('Respuesta del servidor no indica éxito');
        }
        
        if (resultadoPago.nuevoSaldo !== saldoFinal) {
            errores.push(`Nuevo saldo en respuesta: $${resultadoPago.nuevoSaldo}, saldo real: $${saldoFinal}`);
        }
        
        if (errores.length === 0) {
            console.log('✅ CORRECTO: El pago se procesó correctamente');
            console.log(`   💰 Cliente: ${resultadoPago.clienteNombre}`);
            console.log(`   💳 Tipo de pago: ${resultadoPago.tipoPago}`);
            console.log(`   💵 Monto: $${resultadoPago.monto.toFixed(2)}`);
            console.log(`   📊 Saldo anterior: $${resultadoPago.saldoAnterior.toFixed(2)}`);
            console.log(`   📊 Nuevo saldo: $${resultadoPago.nuevoSaldo.toFixed(2)}`);
        } else {
            console.log('❌ ERRORES:');
            errores.forEach(error => console.log(`   - ${error}`));
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testPagosCliente()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
