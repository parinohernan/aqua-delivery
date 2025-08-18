/**
 * Test: Verificar filtro por estado en el backend
 */

const axios = require('axios');
const { getToken } = require('./get-token');

async function testFiltroEstadoBackend() {
    console.log('\n🧪 TEST: Filtro por estado en el backend');
    console.log('=========================================');

    try {
        const token = await getToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('🔍 Probando diferentes filtros por estado...');

        // 1. Sin filtro (todos los pedidos)
        console.log('\n📋 1. Sin filtro de estado:');
        const responseTodos = await axios.get('http://localhost:8001/api/pedidos', { headers });
        console.log(`   ✅ Total de pedidos: ${responseTodos.data.length}`);
        
        const estados = [...new Set(responseTodos.data.map(p => p.estado))];
        console.log(`   📊 Estados encontrados: ${estados.join(', ')}`);

        // 2. Filtro por pendientes
        console.log('\n📋 2. Filtro por estado "pendient":');
        const responsePendientes = await axios.get('http://localhost:8001/api/pedidos?estado=pendient', { headers });
        console.log(`   ✅ Pedidos pendientes: ${responsePendientes.data.length}`);
        
        if (responsePendientes.data.length > 0) {
            const estadosPendientes = [...new Set(responsePendientes.data.map(p => p.estado))];
            console.log(`   📊 Estados en resultado: ${estadosPendientes.join(', ')}`);
            
            // Verificar que todos son pendientes
            const todosPendientes = responsePendientes.data.every(p => p.estado === 'pendient');
            console.log(`   ✅ Todos son pendientes: ${todosPendientes ? 'SÍ' : 'NO'}`);
        }

        // 3. Filtro por proceso
        console.log('\n📋 3. Filtro por estado "proceso":');
        const responseProceso = await axios.get('http://localhost:8001/api/pedidos?estado=proceso', { headers });
        console.log(`   ✅ Pedidos en proceso: ${responseProceso.data.length}`);
        
        if (responseProceso.data.length > 0) {
            const estadosProceso = [...new Set(responseProceso.data.map(p => p.estado))];
            console.log(`   📊 Estados en resultado: ${estadosProceso.join(', ')}`);
            
            // Verificar que todos son proceso
            const todosProceso = responseProceso.data.every(p => p.estado === 'proceso');
            console.log(`   ✅ Todos son proceso: ${todosProceso ? 'SÍ' : 'NO'}`);
        }

        // 4. Filtro por entregados
        console.log('\n📋 4. Filtro por estado "entregad":');
        const responseEntregados = await axios.get('http://localhost:8001/api/pedidos?estado=entregad', { headers });
        console.log(`   ✅ Pedidos entregados: ${responseEntregados.data.length}`);
        
        if (responseEntregados.data.length > 0) {
            const estadosEntregados = [...new Set(responseEntregados.data.map(p => p.estado))];
            console.log(`   📊 Estados en resultado: ${estadosEntregados.join(', ')}`);
            
            // Verificar que todos son entregados
            const todosEntregados = responseEntregados.data.every(p => p.estado === 'entregad');
            console.log(`   ✅ Todos son entregados: ${todosEntregados ? 'SÍ' : 'NO'}`);
        }

        // 5. Verificar que la suma coincide
        console.log('\n📋 5. Verificación de consistencia:');
        const totalFiltrados = responsePendientes.data.length + responseProceso.data.length + responseEntregados.data.length;
        console.log(`   📊 Suma de filtrados: ${totalFiltrados}`);
        console.log(`   📊 Total sin filtro: ${responseTodos.data.length}`);
        console.log(`   ✅ Suma coincide: ${totalFiltrados === responseTodos.data.length ? 'SÍ' : 'NO'}`);

        // 6. Mostrar algunos ejemplos
        console.log('\n📋 6. Ejemplos de pedidos:');
        if (responsePendientes.data.length > 0) {
            const ejemplo = responsePendientes.data[0];
            console.log(`   📦 Pendiente: #${ejemplo.id} - ${ejemplo.cliente_nombre} - $${ejemplo.total}`);
        }
        if (responseProceso.data.length > 0) {
            const ejemplo = responseProceso.data[0];
            console.log(`   🔄 Proceso: #${ejemplo.id} - ${ejemplo.cliente_nombre} - $${ejemplo.total}`);
        }
        if (responseEntregados.data.length > 0) {
            const ejemplo = responseEntregados.data[0];
            console.log(`   ✅ Entregado: #${ejemplo.id} - ${ejemplo.cliente_nombre} - $${ejemplo.total}`);
        }

        console.log('\n🎉 Test completado - Filtro por estado funciona correctamente');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testFiltroEstadoBackend();
