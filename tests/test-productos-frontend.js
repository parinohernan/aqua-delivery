const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testProductosFrontend() {
    console.log('🧪 TEST: Verificar datos de productos para frontend');
    console.log('==================================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // 1. Consultar productos directamente
        console.log('\n📦 1. Consultando productos...');
        const productosResponse = await axios.get(`${BASE_URL}/productos`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const productos = productosResponse.data;
        console.log(`✅ Productos encontrados: ${productos.length}`);
        
        // Mostrar cada producto con su campo esRetornable
        console.log('\n📋 Productos con campo esRetornable:');
        productos.forEach(producto => {
            console.log(`   ${producto.codigo}. ${producto.descripcion}`);
            console.log(`      - esRetornable: ${producto.esRetornable} (tipo: ${typeof producto.esRetornable})`);
            console.log(`      - precio: $${producto.precio}`);
            console.log('');
        });
        
        // 2. Crear un pedido con bidones
        console.log('\n📦 2. Creando pedido con bidones...');
        const pedidoData = {
            clienteId: 5,
            productos: [
                { productoId: 1, cantidad: 1, precio: 1500.00 }, // Bidón 20L
                { productoId: 2, cantidad: 1, precio: 1000.00 }  // Bidón 12L
            ],
            total: 2500.00
        };
        
        const pedidoResponse = await axios.post(`${BASE_URL}/pedidos`, pedidoData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const pedidoId = pedidoResponse.data.codigo;
        console.log(`✅ Pedido creado con ID: ${pedidoId}`);
        
        // 3. Consultar items del pedido
        console.log('\n📦 3. Consultando items del pedido...');
        const itemsResponse = await axios.get(`${BASE_URL}/pedidos/${pedidoId}/items`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const items = itemsResponse.data;
        console.log(`✅ Items encontrados: ${items.length}`);
        
        // Mostrar cada item con su campo esRetornable
        console.log('\n📋 Items del pedido con campo esRetornable:');
        items.forEach((item, index) => {
            console.log(`   Item ${index + 1}:`);
            console.log(`      - codigoProducto: ${item.codigoProducto}`);
            console.log(`      - nombreProducto: ${item.nombreProducto}`);
            console.log(`      - descripcion: ${item.descripcion}`);
            console.log(`      - cantidad: ${item.cantidad}`);
            console.log(`      - precioUnitario: $${item.precioUnitario}`);
            console.log(`      - esRetornable: ${item.esRetornable} (tipo: ${typeof item.esRetornable})`);
            console.log(`      - subtotal: $${item.subtotal}`);
            console.log('');
        });
        
        // 4. Verificar si los bidones tienen esRetornable = 1
        const bidones = items.filter(item => 
            item.nombreProducto && 
            item.nombreProducto.toLowerCase().includes('bidón')
        );
        
        console.log('\n🔍 4. Análisis de bidones:');
        bidones.forEach((bidon, index) => {
            console.log(`   Bidón ${index + 1}: ${bidon.nombreProducto}`);
            console.log(`      - esRetornable en BD: ${bidon.esRetornable}`);
            console.log(`      - ¿Es 1?: ${bidon.esRetornable === 1}`);
            console.log(`      - ¿Es true?: ${bidon.esRetornable === true}`);
            console.log(`      - ¿Es truthy?: ${!!bidon.esRetornable}`);
        });
        
        // 5. Simular la lógica del frontend
        console.log('\n🧠 5. Simulando lógica del frontend:');
        const totalRetornables = items.reduce((total, item) => {
            // Lógica exacta del frontend
            const esRetornable = item.esRetornable === 1 || item.esRetornable === true ||
                (item.nombreProducto && 
                 (item.nombreProducto.toLowerCase().includes('bidón') || 
                  item.nombreProducto.toLowerCase().includes('botellon') ||
                  item.nombreProducto.toLowerCase().includes('botellón')));
            
            console.log(`   ${item.nombreProducto}: esRetornable = ${esRetornable} (cantidad: ${item.cantidad})`);
            return total + (esRetornable ? item.cantidad : 0);
        }, 0);
        
        console.log(`\n📊 Total retornables calculado: ${totalRetornables}`);
        
        if (totalRetornables > 0) {
            console.log('✅ CORRECTO: El frontend detectará productos retornables');
        } else {
            console.log('❌ PROBLEMA: El frontend no detectará productos retornables');
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testProductosFrontend()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
