/**
 * Test: Verificar estados únicos de pedidos
 */

const axios = require('axios');
const { getToken } = require('./get-token');

async function testEstadosPedidos() {
    console.log('\n🔍 Verificando estados únicos de pedidos...');
    
    try {
        const token = await getToken();
        const response = await axios.get('http://localhost:8001/api/pedidos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const estados = [...new Set(response.data.map(p => p.estado))];
        console.log('📊 Estados únicos encontrados:', estados);
        
        // Contar pedidos por estado
        const conteo = {};
        response.data.forEach(pedido => {
            conteo[pedido.estado] = (conteo[pedido.estado] || 0) + 1;
        });
        
        console.log('📈 Conteo por estado:');
        Object.entries(conteo).forEach(([estado, cantidad]) => {
            console.log(`   ${estado}: ${cantidad} pedidos`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEstadosPedidos();
