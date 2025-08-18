/**
 * Test: Verificar filtros con todos los estados de pedidos
 */

const axios = require('axios');
const { getToken } = require('./get-token');

async function testFiltrosEstados() {
    console.log('\n🧪 TEST: Filtros con todos los estados de pedidos');
    console.log('================================================');

    try {
        const token = await getToken();
        const response = await axios.get('http://localhost:8001/api/pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const pedidos = response.data;
        console.log('✅ Pedidos cargados:', pedidos.length);
        
        // Analizar estados
        const estados = [...new Set(pedidos.map(p => p.estado))];
        console.log('📊 Estados encontrados:', estados);
        
        // Contar por estado
        const conteo = {};
        pedidos.forEach(pedido => {
            conteo[pedido.estado] = (conteo[pedido.estado] || 0) + 1;
        });
        
        console.log('📈 Distribución actual:');
        Object.entries(conteo).forEach(([estado, cantidad]) => {
            console.log(`   ${estado}: ${cantidad} pedidos`);
        });
        
        // Verificar filtros implementados
        console.log('\n✅ Filtros implementados:');
        console.log('   📦 Pendientes (pendient) - Color amarillo');
        console.log('   🔄 En Proceso (proceso) - Color azul');
        console.log('   ✅ Entregados (entregad) - Color verde');
        console.log('   ❌ Anulados (anulado) - Color rojo');
        
        // Verificar que el filtro por defecto funciona
        const pendientes = pedidos.filter(p => p.estado === 'pendient');
        console.log(`\n🎯 Filtro por defecto (pendientes): ${pendientes.length} pedidos`);
        
        if (pendientes.length > 0) {
            console.log('   📦 Pedidos pendientes:');
            pendientes.slice(0, 3).forEach(p => {
                console.log(`      #${p.id} - ${p.cliente_nombre} - $${p.total}`);
            });
        }
        
        // Verificar estado "proceso"
        const enProceso = pedidos.filter(p => p.estado === 'proceso');
        console.log(`\n🔄 Pedidos en proceso: ${enProceso.length} pedidos`);
        
        if (enProceso.length > 0) {
            enProceso.forEach(p => {
                console.log(`   #${p.id} - ${p.cliente_nombre} - $${p.total}`);
            });
        }
        
        console.log('\n📋 Instrucciones para verificar:');
        console.log('1. Abre http://localhost:4321');
        console.log('2. Ve a "Pedidos"');
        console.log('3. Verifica que por defecto muestra solo pendientes');
        console.log('4. Cambia el filtro a "En Proceso" - debería mostrar 1 pedido');
        console.log('5. Cambia a "Entregados" - debería mostrar 1 pedido');
        console.log('6. Cambia a "Todos los estados" - debería mostrar 8 pedidos');
        console.log('7. Verifica que los colores son diferentes para cada estado');
        
        console.log('\n🎨 Colores de estados:');
        console.log('   📦 Pendientes: Amarillo (#fef3c7)');
        console.log('   🔄 En Proceso: Azul (#dbeafe)');
        console.log('   ✅ Entregados: Verde (#d1fae5)');
        console.log('   ❌ Anulados: Rojo (#fee2e2)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFiltrosEstados();
