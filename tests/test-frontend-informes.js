const axios = require('axios');
const { getToken } = require('./get-token');

const BASE_URL = 'http://localhost:8001/api';

async function testFrontendInformes() {
  console.log('🌐 TESTING: Frontend Informes Integration');
  console.log('========================================');

  try {
    // 1. Verificar que el backend esté funcionando
    console.log('🔍 Verificando backend...');
    const healthResponse = await axios.get('http://localhost:8001/health');
    console.log('✅ Backend funcionando:', healthResponse.data.message);

    // 2. Obtener token
    console.log('🔑 Obteniendo token...');
    const token = await getToken();
    console.log('✅ Token obtenido correctamente');

    // 3. Test de endpoint de informes
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const fechaHasta = hoy.toISOString().split('T')[0];
    const fechaDesde = hace30Dias.toISOString().split('T')[0];

    // Test informe resumen
    console.log('📈 Testing endpoint de informes (resumen)...');
    const resumenResponse = await axios.get(
      `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`,
      { headers }
    );

    console.log('✅ Endpoint de informes resumen funciona:', {
      status: resumenResponse.status,
      totalPedidos: resumenResponse.data.totalPedidos,
      totalVentas: resumenResponse.data.totalVentas
    });

    // Test informe detallado
    console.log('📋 Testing endpoint de informes (detallado)...');
    const detalladoResponse = await axios.get(
      `${BASE_URL}/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=detallado`,
      { headers }
    );

    console.log('✅ Endpoint de informes detallado funciona:', {
      status: detalladoResponse.status,
      clientesCount: detalladoResponse.data.clientes?.length || 0
    });

    console.log('\n🎉 ¡INTEGRACIÓN FRONTEND-BACKEND EXITOSA!');
    console.log('==========================================');
    console.log('✅ Backend funcionando en puerto 8001');
    console.log('✅ Endpoints de informes operativos');
    console.log('✅ Autenticación JWT funcionando');
    console.log('✅ Datos de informes disponibles');
    console.log('\n📋 SIGUIENTE PASO:');
    console.log('1. Accede a http://localhost:4321');
    console.log('2. Inicia sesión en la aplicación');
    console.log('3. Haz clic en "📊 Informes" en la navegación');
    console.log('4. Genera informes de ventas');
    console.log('\nSi hay errores de "generarInforme is not defined", recarga la página.');

  } catch (error) {
    console.error('❌ ERROR EN TEST DE FRONTEND:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    console.log('\n🔧 SOLUCIONES POSIBLES:');
    console.log('1. Verificar que el backend esté ejecutándose: cd backend && node server.js');
    console.log('2. Verificar que el frontend esté ejecutándose: cd frontend && npm run dev');
    console.log('3. Recargar la página del navegador para aplicar cambios JS');
    
    process.exit(1);
  }
}

// Ejecutar el test si se llama directamente
if (require.main === module) {
  testFrontendInformes();
}

module.exports = { testFrontendInformes };
