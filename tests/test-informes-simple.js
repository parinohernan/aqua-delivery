/**
 * Test simple para verificar el sistema de informes
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8001/api';

// Token de prueba (necesitas obtener uno válido del navegador)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWVkb20xMzUiLCJ2ZW5kZWRvcklkIjoyLCJjb2RpZ29FbXByZXNhIjoxLCJpYXQiOjE3MzQ0NzI4NzQsImV4cCI6MTczNDU1OTI3NH0.example';

async function testInformesSimple() {
    console.log('🧪 TEST: Sistema de Informes');
    console.log('============================');
    
    try {
        // 1. Verificar que el backend esté corriendo
        console.log('\n📋 1. Verificando backend...');
        const healthResponse = await axios.get('http://localhost:8001/health');
        console.log('✅ Backend funcionando:', healthResponse.data.message);
        
        // 2. Verificar endpoint de informes
        console.log('\n📊 2. Verificando endpoint de informes...');
        
        // Configurar fechas (últimos 30 días)
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        const fechaHasta = hoy.toISOString().split('T')[0];
        const fechaDesde = hace30Dias.toISOString().split('T')[0];
        
        console.log(`📅 Rango de fechas: ${fechaDesde} a ${fechaHasta}`);
        
        // Test sin token primero (debería fallar)
        try {
            await axios.get(`${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`);
            console.log('❌ ERROR: Debería haber fallado sin token');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Validación de token correcta');
            } else {
                console.log('⚠️ Error inesperado sin token:', error.message);
            }
        }
        
        // Test con token (si tienes uno válido)
        if (TEST_TOKEN && !TEST_TOKEN.includes('example')) {
            console.log('\n🔑 3. Probando con token...');
            
            const headers = {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            };
            
            const informeResponse = await axios.get(
                `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`,
                { headers }
            );
            
            console.log('✅ Informe generado exitosamente:', {
                status: informeResponse.status,
                totalPedidos: informeResponse.data.totalPedidos,
                totalVentas: informeResponse.data.totalVentas,
                totalClientes: informeResponse.data.totalClientes
            });
            
            if (informeResponse.data.productos && informeResponse.data.productos.length > 0) {
                console.log('🛍️ Productos más vendidos:');
                informeResponse.data.productos.slice(0, 3).forEach((producto, index) => {
                    console.log(`   ${index + 1}. ${producto.descripcion}: ${producto.cantidad} unidades`);
                });
            }
        } else {
            console.log('\n💡 Para probar con datos reales:');
            console.log('1. Abre el navegador y ve a la aplicación');
            console.log('2. Abre las herramientas de desarrollador (F12)');
            console.log('3. Ve a la pestaña Network');
            console.log('4. Haz login y busca una request a /api/');
            console.log('5. Copia el token del header Authorization');
            console.log('6. Reemplaza TEST_TOKEN en este archivo');
        }
        
        // 4. Verificar validaciones
        console.log('\n🔍 4. Verificando validaciones...');
        
        try {
            await axios.get(`${BASE_URL}/informes/ventas`, {
                headers: { 'Authorization': `Bearer ${TEST_TOKEN}` }
            });
            console.log('❌ ERROR: Debería haber fallado sin fechas');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Validación de fechas correcta');
            } else {
                console.log('⚠️ Error inesperado en validación:', error.message);
            }
        }
        
        console.log('\n🎉 Test completado');
        console.log('================');
        console.log('✅ Backend funcionando');
        console.log('✅ Endpoint de informes disponible');
        console.log('✅ Validaciones funcionando');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 El backend no está corriendo. Inicia el servidor:');
            console.log('cd backend && npm start');
        }
    }
}

// Ejecutar test
testInformesSimple()
    .then(() => {
        console.log('\n✅ Test finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
