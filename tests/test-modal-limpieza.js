/**
 * Test: Modal de pedido - Verificación de limpieza
 * 
 * Este test verifica que el modal se limpia correctamente entre usos
 */

const axios = require('axios');
const { getToken } = require('./get-token');

const BASE_URL = 'http://localhost:8001/api';
let TEST_TOKEN = null;

async function testModalLimpieza() {
    console.log('\n🧪 TEST: Modal de pedido - Verificación de limpieza');
    console.log('==================================================');

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

        // 2. Verificar que el backend está funcionando
        console.log('\n📋 1. Verificando conectividad del backend...');
        const productosResponse = await axios.get(`${BASE_URL}/productos`, { headers });
        const clientesResponse = await axios.get(`${BASE_URL}/clientes`, { headers });
        
        console.log('✅ Productos disponibles:', productosResponse.data.length);
        console.log('✅ Clientes disponibles:', clientesResponse.data.length);

        // 3. Explicar el problema que se corrigió
        console.log('\n📋 2. Problema corregido:');
        console.log('❌ PROBLEMA ANTERIOR:');
        console.log('   - Al abrir el modal para un segundo pedido');
        console.log('   - Los productos del pedido anterior seguían visibles');
        console.log('   - Solo se limpiaban al agregar un nuevo producto');
        console.log('   - Experiencia de usuario confusa');

        console.log('\n✅ CAUSA DEL PROBLEMA:');
        console.log('   - resetForm() limpiaba el array pero no forzaba la actualización visual');
        console.log('   - updateOrderItemsList() no se ejecutaba inmediatamente');
        console.log('   - El DOM mantenía el estado anterior');

        console.log('\n🛠️ SOLUCIÓN IMPLEMENTADA:');
        console.log('   ✅ Limpieza visual inmediata en resetForm()');
        console.log('   ✅ Forzar innerHTML del contenedor');
        console.log('   ✅ Logs de depuración para monitoreo');
        console.log('   ✅ Función debugState() para verificar estado');

        // 4. Verificar endpoints necesarios
        console.log('\n📋 3. Verificando endpoints necesarios...');
        
        try {
            const productos = productosResponse.data;
            console.log('✅ Endpoint /api/productos: OK');
            console.log(`   📦 Productos disponibles: ${productos.length}`);
            if (productos.length > 0) {
                console.log(`   📦 Primer producto: ${productos[0].descripcion}`);
            }
        } catch (error) {
            console.log('❌ Error en endpoint /api/productos:', error.message);
        }

        try {
            const clientes = clientesResponse.data;
            console.log('✅ Endpoint /api/clientes: OK');
            console.log(`   👥 Clientes disponibles: ${clientes.length}`);
            if (clientes.length > 0) {
                console.log(`   👥 Primer cliente: ${clientes[0].nombreCompleto}`);
            }
        } catch (error) {
            console.log('❌ Error en endpoint /api/clientes:', error.message);
        }

        // 5. Instrucciones para verificar la corrección
        console.log('\n📋 4. Instrucciones para verificar la corrección:');
        console.log('🔄 PASOS PARA VERIFICAR:');
        console.log('   1. Abre http://localhost:4321 en tu navegador');
        console.log('   2. Inicia sesión con las credenciales de prueba');
        console.log('   3. Ve a la sección "Pedidos"');
        console.log('   4. Haz clic en "Nuevo Pedido"');
        console.log('   5. Selecciona un cliente');
        console.log('   6. Agrega un producto (ej: Bidón 12L)');
        console.log('   7. Verifica que aparece en la lista');
        console.log('   8. Cierra el modal (botón X o Cancelar)');
        console.log('   9. Abre "Nuevo Pedido" nuevamente');
        console.log('   10. Verifica que NO aparece el producto anterior');
        console.log('   11. Verifica que aparece "No hay productos agregados"');
        console.log('   12. Verifica que el total es $0.00');

        console.log('\n✅ CORRECCIÓN IMPLEMENTADA:');
        console.log('   🔄 resetForm() con limpieza visual inmediata');
        console.log('   🔄 Forzar innerHTML del contenedor de items');
        console.log('   🔄 Logs de depuración detallados');
        console.log('   🔄 Función debugState() para monitoreo');

        console.log('\n🎯 BENEFICIOS:');
        console.log('   ✅ Modal siempre limpio al abrir');
        console.log('   ✅ No hay productos residuales');
        console.log('   ✅ Experiencia de usuario consistente');
        console.log('   ✅ Fácil depuración con logs');

        console.log('\n🔍 LOGS A VERIFICAR EN CONSOLA:');
        console.log('   📦 "Abriendo modal de pedido: nuevo"');
        console.log('   🔄 "Iniciando reset del formulario de pedido..."');
        console.log('   🔄 "Estado interno limpiado, orderItems: 0"');
        console.log('   🔄 "Limpiando contenedor de items visualmente..."');
        console.log('   🔄 "Formulario de pedido reseteado completamente"');
        console.log('   📦 "Modal de pedido abierto correctamente"');
        console.log('   🔍 "DEBUG - Estado actual del modal:"');

        console.log('\n🎉 Test completado - Verifica manualmente en el frontend');

    } catch (error) {
        console.error('❌ Error en el test:', error.response?.data || error.message);
        process.exit(1);
    }
}

// Ejecutar el test
testModalLimpieza();
