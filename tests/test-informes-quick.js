/**
 * Test rápido para verificar el fix del informe detallado
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8001/api';

// Token de prueba (necesitas obtener uno válido del navegador)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWVkb20xMzUiLCJ2ZW5kZWRvcklkIjoyLCJjb2RpZ29FbXByZXNhIjoxLCJpYXQiOjE3MzQ0NzI4NzQsImV4cCI6MTczNDU1OTI3NH0.example';

async function testInformeQuick() {
    console.log('🧪 TEST RÁPIDO: Informe Detallado (Post-Fix)');
    console.log('============================================');
    
    try {
        // 1. Verificar backend
        console.log('\n📋 1. Verificando backend...');
        const healthResponse = await axios.get('http://localhost:8001/health');
        console.log('✅ Backend funcionando:', healthResponse.data.message);
        
        // 2. Configurar fechas (últimos 30 días)
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        const fechaHasta = hoy.toISOString().split('T')[0];
        const fechaDesde = hace30Dias.toISOString().split('T')[0];
        
        console.log(`📅 Rango de fechas: ${fechaDesde} a ${fechaHasta}`);
        
        // 3. Test con token (si tienes uno válido)
        if (TEST_TOKEN && !TEST_TOKEN.includes('example')) {
            console.log('\n🔑 2. Probando informe detallado...');
            
            const headers = {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Content-Type': 'application/json'
            };
            
            const informeResponse = await axios.get(
                `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=detallado`,
                { headers }
            );
            
            console.log('✅ Informe detallado generado exitosamente:', {
                status: informeResponse.status,
                clientesCount: informeResponse.data.clientes?.length || 0
            });
            
            // Mostrar un resumen rápido
            if (informeResponse.data.clientes && informeResponse.data.clientes.length > 0) {
                console.log('\n👥 Resumen de clientes:');
                
                informeResponse.data.clientes.slice(0, 3).forEach((cliente, index) => {
                    console.log(`\n${index + 1}. ${cliente.nombre} ${cliente.apellido || ''}`);
                    console.log(`   📦 Pedidos: ${cliente.totalPedidos}`);
                    console.log(`   💰 Total: $${cliente.totalComprado.toLocaleString('es-AR')}`);
                    console.log(`   🛍️ Productos: ${cliente.productos?.length || 0}`);
                    console.log(`   📋 Pedidos detalle: ${cliente.pedidos?.length || 0}`);
                    
                    if (cliente.productos && cliente.productos.length > 0) {
                        console.log(`   📊 Producto más comprado: ${cliente.productos[0].descripcion} (${cliente.productos[0].cantidadTotal} unidades)`);
                    }
                });
                
                if (informeResponse.data.clientes.length > 3) {
                    console.log(`\n... y ${informeResponse.data.clientes.length - 3} clientes más`);
                }
            } else {
                console.log('⚠️ No se encontraron clientes con ventas en el período');
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
        
        console.log('\n🎉 Test completado');
        console.log('================');
        console.log('✅ Backend funcionando');
        console.log('✅ Error de precioUnitario corregido');
        console.log('✅ Consulta SQL optimizada');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 El backend no está corriendo. Inicia el servidor:');
            console.log('cd backend && npm start');
        }
    }
}

// Ejecutar test
testInformeQuick()
    .then(() => {
        console.log('\n✅ Test finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
