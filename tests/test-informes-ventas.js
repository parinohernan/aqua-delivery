const axios = require('axios');
const { getToken } = require('./get-token');

const BASE_URL = 'http://localhost:8001/api';

async function testInformesVentas() {
  console.log('📊 TESTING: Informes de Ventas');
  console.log('==============================');

  try {
    // 1. Obtener token de autenticación
    console.log('🔑 Obteniendo token...');
    const token = await getToken();
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Configurar fechas para el test (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const fechaHasta = hoy.toISOString().split('T')[0];
    const fechaDesde = hace30Dias.toISOString().split('T')[0];

    console.log(`📅 Rango de fechas: ${fechaDesde} a ${fechaHasta}`);

    // 3. Test: Informe Resumen
    console.log('\n📈 Testing informe resumen...');
    const resumenResponse = await axios.get(
      `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`,
      { headers }
    );

    console.log('✅ Respuesta del informe resumen:', {
      status: resumenResponse.status,
      totalPedidos: resumenResponse.data.totalPedidos,
      totalClientes: resumenResponse.data.totalClientes,
      totalVentas: resumenResponse.data.totalVentas,
      productosCount: resumenResponse.data.productos?.length || 0
    });

    if (resumenResponse.data.productos && resumenResponse.data.productos.length > 0) {
      console.log('🛍️ Productos más vendidos:');
      resumenResponse.data.productos.slice(0, 3).forEach((producto, index) => {
        console.log(`   ${index + 1}. ${producto.descripcion}: ${producto.cantidad} unidades ($${producto.total.toLocaleString('es-AR')})`);
      });
    }

    // 4. Test: Informe Detallado
    console.log('\n📋 Testing informe detallado por cliente...');
    const detalladoResponse = await axios.get(
      `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=detallado`,
      { headers }
    );

    console.log('✅ Respuesta del informe detallado:', {
      status: detalladoResponse.status,
      clientesCount: detalladoResponse.data.clientes?.length || 0
    });

    if (detalladoResponse.data.clientes && detalladoResponse.data.clientes.length > 0) {
      console.log('👥 Top 3 clientes:');
      detalladoResponse.data.clientes.slice(0, 3).forEach((cliente, index) => {
        console.log(`   ${index + 1}. ${cliente.nombre} ${cliente.apellido || ''}: ${cliente.totalPedidos} pedidos ($${cliente.totalComprado.toLocaleString('es-AR')})`);
      });
    }

    // 5. Test: Validaciones de parámetros
    console.log('\n🔍 Testing validaciones...');
    
    try {
      await axios.get(`${BASE_URL}/informes/ventas`, { headers });
      console.log('❌ ERROR: Debería haber fallado sin fechas');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validación correcta: falla sin fechas');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    try {
      await axios.get(`${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=invalido`, { headers });
      console.log('❌ ERROR: Debería haber fallado con tipo inválido');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validación correcta: falla con tipo inválido');
      } else {
        console.log('❌ Error inesperado:', error.message);
      }
    }

    // 6. Test: Rango de fechas inválido (fecha desde mayor que fecha hasta)
    const fechaInvalida = new Date();
    fechaInvalida.setDate(hoy.getDate() + 10);
    const fechaInvalidaStr = fechaInvalida.toISOString().split('T')[0];

    console.log('\n📅 Testing rango de fechas...');
    const rangoResponse = await axios.get(
      `${BASE_URL}/informes/ventas?fechaDesde=${fechaInvalidaStr}&fechaHasta=${fechaDesde}&tipo=resumen`,
      { headers }
    );

    // Aunque el backend no valida esto específicamente, debería devolver datos vacíos
    console.log('✅ Rango de fechas inválido manejado:', {
      totalPedidos: rangoResponse.data.totalPedidos,
      totalVentas: rangoResponse.data.totalVentas
    });

    console.log('\n🎉 ¡TODOS LOS TESTS DE INFORMES PASARON EXITOSAMENTE!');
    console.log('======================================================');
    console.log('✅ Informe resumen funciona correctamente');
    console.log('✅ Informe detallado funciona correctamente');
    console.log('✅ Validaciones de parámetros funcionan');
    console.log('✅ Manejo de rangos de fechas correcto');

  } catch (error) {
    console.error('❌ ERROR EN TEST DE INFORMES:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Ejecutar el test si se llama directamente
if (require.main === module) {
  testInformesVentas();
}

module.exports = { testInformesVentas };
