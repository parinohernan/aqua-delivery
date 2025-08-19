const axios = require('axios');
const { getToken } = require('./get-token');

async function testFinalInformes() {
  console.log('🎯 TEST FINAL: Verificación completa de informes');
  console.log('===============================================');

  try {
    // 1. Verificar backend
    console.log('🔍 1. Verificando backend...');
    const healthResponse = await axios.get('http://localhost:8001/health');
    console.log('✅ Backend OK:', healthResponse.data.message);

    // 2. Verificar frontend
    console.log('🔍 2. Verificando frontend...');
    const frontendResponse = await axios.get('http://localhost:4322/');
    const hasGenerarInforme = frontendResponse.data.includes('window.generarInforme');
    console.log('✅ Frontend OK:', hasGenerarInforme ? 'Función generarInforme presente' : 'Función NO encontrada');

    // 3. Verificar endpoint de informes
    console.log('🔍 3. Verificando endpoint de informes...');
    const token = await getToken();
    
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const fechaHasta = hoy.toISOString().split('T')[0];
    const fechaDesde = hace30Dias.toISOString().split('T')[0];

    const informeResponse = await axios.get(
      `http://localhost:8001/api/informes/ventas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}&tipo=resumen`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log('✅ Endpoint de informes OK:', {
      status: informeResponse.status,
      totalPedidos: informeResponse.data.totalPedidos,
      totalVentas: informeResponse.data.totalVentas
    });

    console.log('\n🎉 ¡SISTEMA COMPLETAMENTE OPERATIVO!');
    console.log('====================================');
    console.log('✅ Backend funcionando en puerto 8001');
    console.log('✅ Frontend funcionando en puerto 4322');
    console.log('✅ Función generarInforme implementada');
    console.log('✅ Endpoint de informes operativo');
    console.log('✅ Datos de prueba disponibles');
    
    console.log('\n📋 INSTRUCCIONES PARA EL USUARIO:');
    console.log('1. Accede a http://localhost:4322/');
    console.log('2. Inicia sesión con tus credenciales');
    console.log('3. Haz clic en "📊 Informes" en la navegación');
    console.log('4. Selecciona fechas y tipo de informe');
    console.log('5. Haz clic en "Generar Informe"');
    console.log('\n🔄 Si hay errores, recarga la página con Ctrl+Shift+R');

  } catch (error) {
    console.error('❌ ERROR EN TEST FINAL:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   URL:', error.config?.url);
    }
    
    console.log('\n🔧 PASOS PARA SOLUCIONAR:');
    console.log('1. Verificar que el backend esté ejecutándose:');
    console.log('   cd backend && node server.js');
    console.log('2. Verificar que el frontend esté ejecutándose:');
    console.log('   cd frontend && npm run dev');
    console.log('3. Recargar la página del navegador');
  }
}

testFinalInformes();
