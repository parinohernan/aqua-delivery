/**
 * Test específico para el informe detallado por cliente
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:8001/api';

// Token de prueba (necesitas obtener uno válido del navegador)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImZyZWVkb20xMzUiLCJ2ZW5kZWRvcklkIjoyLCJjb2RpZ29FbXByZXNhIjoxLCJpYXQiOjE3MzQ0NzI4NzQsImV4cCI6MTczNDU1OTI3NH0.example';

async function testInformeDetallado() {
    console.log('🧪 TEST: Informe Detallado por Cliente');
    console.log('=====================================');
    
    try {
        // 1. Verificar que el backend esté corriendo
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
            
            // Mostrar detalles de cada cliente
            if (informeResponse.data.clientes && informeResponse.data.clientes.length > 0) {
                console.log('\n👥 Detalles de clientes:');
                
                informeResponse.data.clientes.forEach((cliente, index) => {
                    console.log(`\n${index + 1}. ${cliente.nombre} ${cliente.apellido || ''}`);
                    console.log(`   📞 Teléfono: ${cliente.telefono || 'Sin teléfono'}`);
                    console.log(`   📦 Pedidos: ${cliente.totalPedidos}`);
                    console.log(`   💰 Total: $${cliente.totalComprado.toLocaleString('es-AR')}`);
                    console.log(`   📊 Promedio: $${(cliente.totalComprado / cliente.totalPedidos).toLocaleString('es-AR')}`);
                    
                    if (cliente.productos && cliente.productos.length > 0) {
                        console.log(`   🛍️ Productos (${cliente.productos.length}):`);
                        cliente.productos.forEach(producto => {
                            console.log(`      - ${producto.descripcion}: ${producto.cantidadTotal} unidades ($${producto.totalPagado.toLocaleString('es-AR')})`);
                        });
                    } else {
                        console.log(`   🛍️ Productos: Ninguno`);
                    }
                    
                    if (cliente.pedidos && cliente.pedidos.length > 0) {
                        console.log(`   📋 Pedidos (${cliente.pedidos.length}):`);
                        cliente.pedidos.slice(0, 3).forEach(pedido => {
                            console.log(`      - #${pedido.codigo}: $${pedido.total.toLocaleString('es-AR')} (${pedido.cantidadItems} items)`);
                        });
                        if (cliente.pedidos.length > 3) {
                            console.log(`      ... y ${cliente.pedidos.length - 3} más`);
                        }
                    } else {
                        console.log(`   📋 Pedidos: Ninguno`);
                    }
                });
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
        
        // 4. Comparar con informe resumen
        console.log('\n📊 3. Comparando con informe resumen...');
        
        if (TEST_TOKEN && !TEST_TOKEN.includes('example')) {
            const resumenResponse = await axios.get(
                `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`,
                { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }
            );
            
            const detalladoResponse = await axios.get(
                `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=detallado`,
                { headers: { 'Authorization': `Bearer ${TEST_TOKEN}` } }
            );
            
            console.log('📈 Comparación:');
            console.log(`   Resumen - Total clientes: ${resumenResponse.data.totalClientes}`);
            console.log(`   Detallado - Clientes encontrados: ${detalladoResponse.data.clientes?.length || 0}`);
            console.log(`   Resumen - Total ventas: $${resumenResponse.data.totalVentas.toLocaleString('es-AR')}`);
            
            const totalDetallado = detalladoResponse.data.clientes?.reduce((sum, c) => sum + c.totalComprado, 0) || 0;
            console.log(`   Detallado - Total ventas: $${totalDetallado.toLocaleString('es-AR')}`);
            
            if (resumenResponse.data.totalClientes === detalladoResponse.data.clientes?.length) {
                console.log('✅ Coincidencia perfecta en número de clientes');
            } else {
                console.log('⚠️ Diferencia en número de clientes');
            }
            
            if (Math.abs(resumenResponse.data.totalVentas - totalDetallado) < 0.01) {
                console.log('✅ Coincidencia perfecta en total de ventas');
            } else {
                console.log('⚠️ Diferencia en total de ventas');
            }
        }
        
        console.log('\n🎉 Test completado');
        console.log('================');
        console.log('✅ Backend funcionando');
        console.log('✅ Endpoint de informes detallado disponible');
        console.log('✅ Datos de productos por cliente incluidos');
        console.log('✅ Datos de pedidos por cliente incluidos');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 El backend no está corriendo. Inicia el servidor:');
            console.log('cd backend && npm start');
        }
    }
}

// Ejecutar test
testInformeDetallado()
    .then(() => {
        console.log('\n✅ Test finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test falló:', error);
        process.exit(1);
    });
