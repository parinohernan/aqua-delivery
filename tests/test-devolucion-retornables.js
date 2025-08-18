/**
 * Test: Sistema de devolución de retornables
 * 
 * Este test verifica que el sistema de devolución de retornables funciona correctamente:
 * 1. Verifica que se pueden obtener productos retornables
 * 2. Verifica el estado inicial del cliente
 * 3. Realiza una devolución de retornables
 * 4. Verifica que los retornables se actualizaron correctamente
 */

const axios = require('axios');
const { getToken } = require('./get-token');

const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testDevolucionRetornables() {
    console.log('\n🧪 TEST: Sistema de devolución de retornables');
    console.log('============================================');

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

        // 2. Verificar productos retornables disponibles
        console.log('\n📋 1. Verificando productos retornables...');
        const productosResponse = await axios.get(`${BASE_URL}/productos`, { headers });
        const productos = productosResponse.data;
        
        const productosRetornables = productos.filter(p => p.esRetornable === 1);
        console.log('✅ Productos totales:', productos.length);
        console.log('✅ Productos retornables:', productosRetornables.length);
        
        if (productosRetornables.length === 0) {
            console.log('⚠️ No hay productos retornables disponibles');
            return;
        }

        productosRetornables.forEach(p => {
            console.log(`   - ${p.id}: ${p.descripcion}`);
        });

        // 3. Verificar estado inicial del cliente
        console.log('\n📋 2. Verificando estado inicial del cliente...');
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, { headers });
        const clientes = clientesResponse.data;
        
        // Buscar un cliente con retornables
        const clienteConRetornables = clientes.find(c => parseInt(c.retornables || 0) > 0);
        
        if (!clienteConRetornables) {
            console.log('⚠️ No hay clientes con retornables para probar');
            return;
        }

        const nombreCompleto = clienteConRetornables.nombreCompleto || `${clienteConRetornables.nombre} ${clienteConRetornables.apellido || ''}`.trim();
        console.log('✅ Cliente seleccionado:', nombreCompleto);
        console.log('🔄 Retornables iniciales:', clienteConRetornables.retornables);

        // 4. Realizar devolución de retornables
        console.log('\n📋 3. Realizando devolución de retornables...');
        const productoSeleccionado = productosRetornables[0];
        const cantidadDevolver = Math.min(2, parseInt(clienteConRetornables.retornables));

        const datosDevolucion = {
            clienteId: clienteConRetornables.codigo,
            productoId: productoSeleccionado.codigo,
            cantidad: cantidadDevolver,
            observaciones: 'Devolución de prueba - Test automatizado'
        };

        console.log('📋 Datos de la devolución:', datosDevolucion);

        const devolucionResponse = await axios.post(
            `${BASE_URL}/clientes/retornables/devolver`,
            datosDevolucion,
            { headers }
        );

        const resultado = devolucionResponse.data;
        console.log('✅ Respuesta de la devolución:', resultado);

        // 5. Verificar estado final del cliente
        console.log('\n📋 4. Verificando estado final del cliente...');
        const clienteActualizadoResponse = await axios.get(`${BASE_URL}/clientes`, { headers });
        const clienteActualizado = clienteActualizadoResponse.data.find(c => c.codigo === clienteConRetornables.codigo);

        console.log('🔄 Retornables finales:', clienteActualizado.retornables);
        const diferencia = parseInt(clienteActualizado.retornables) - parseInt(clienteConRetornables.retornables);
        console.log('📊 Diferencia:', diferencia, '(esperado:', -cantidadDevolver, ')');

        // 6. Verificar que todo es correcto
        if (diferencia === -cantidadDevolver) {
            console.log('✅ CORRECTO: La devolución se procesó correctamente');
            console.log(`   👤 Cliente: ${nombreCompleto}`);
            console.log(`   📦 Producto: ${productoSeleccionado.descripcion}`);
            console.log(`   🔄 Cantidad devuelta: ${cantidadDevolver} unidades`);
            console.log(`   📊 Retornables anteriores: ${clienteConRetornables.retornables}`);
            console.log(`   📊 Nuevos retornables: ${clienteActualizado.retornables}`);
        } else {
            console.log('❌ ERROR: La devolución no se procesó correctamente');
            console.log(`   Esperado: -${cantidadDevolver}, Obtenido: ${diferencia}`);
        }

        console.log('\n🎉 Test completado');

    } catch (error) {
        console.error('❌ Error en el test:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Ejecutar el test
testDevolucionRetornables();
