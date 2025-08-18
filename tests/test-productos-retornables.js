const axios = require('axios');
const { getToken } = require('./get-token');

// Configuración
const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testProductosRetornables() {
    console.log('🧪 TEST: Verificar productos retornables');
    console.log('========================================');
    
    // Obtener token válido
    TEST_TOKEN = await getToken();
    if (!TEST_TOKEN) {
        console.log('❌ No se pudo obtener token válido');
        return;
    }
    
    try {
        // Consultar productos
        console.log('\n📦 Consultando productos...');
        const productosResponse = await axios.get(`${BASE_URL}/productos`, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const productos = productosResponse.data;
        console.log(`✅ Productos encontrados: ${productos.length}`);
        
        // Mostrar todos los productos
        console.log('\n📋 Lista de productos:');
        productos.forEach(producto => {
            const tipo = producto.esRetornable ? '🔄 RETORNABLE' : '🗑️ DESCARTABLE';
            console.log(`   ${producto.codigo}. ${producto.descripcion} - $${producto.precio} - ${tipo}`);
        });
        
        // Filtrar productos retornables
        const productosRetornables = productos.filter(p => p.esRetornable);
        const productosDescartables = productos.filter(p => !p.esRetornable);
        
        console.log('\n📊 Resumen:');
        console.log(`   🔄 Productos retornables: ${productosRetornables.length}`);
        console.log(`   🗑️ Productos descartables: ${productosDescartables.length}`);
        
        if (productosRetornables.length > 0) {
            console.log('\n✅ CORRECTO: Hay productos retornables disponibles');
            console.log('   Productos retornables:');
            productosRetornables.forEach(p => {
                console.log(`   - ${p.descripcion} (ID: ${p.codigo})`);
            });
        } else {
            console.log('\n❌ ERROR: No hay productos retornables configurados');
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
    }
}

// Ejecutar test
testProductosRetornables()
    .then(() => {
        console.log('\n🎉 Test completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
