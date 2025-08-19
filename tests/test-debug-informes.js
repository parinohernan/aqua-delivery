console.log('🔍 DEBUG: Verificando disponibilidad de funciones de informes');

// Simular el entorno del navegador para testing
global.window = global;
global.document = {
  getElementById: (id) => {
    const mockElements = {
      'fechaDesde': { value: '2025-07-19' },
      'fechaHasta': { value: '2025-08-18' },
      'tipoInforme': { value: 'resumen' },
      'informeResultados': { innerHTML: '' }
    };
    return mockElements[id] || null;
  }
};

global.localStorage = {
  getItem: (key) => {
    if (key === 'token') {
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
    }
    return null;
  }
};

global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
global.alert = (message) => console.log('🚨 ALERT:', message);

// Definir la función generarInforme como está en el código
async function generarInforme() {
  console.log('🚀 generarInforme() ejecutada');
  
  const fechaDesde = document.getElementById('fechaDesde')?.value;
  const fechaHasta = document.getElementById('fechaHasta')?.value;
  const tipoInforme = document.getElementById('tipoInforme')?.value;
  const resultadosDiv = document.getElementById('informeResultados');

  console.log('📋 Datos del formulario:', { fechaDesde, fechaHasta, tipoInforme });

  if (!fechaDesde || !fechaHasta) {
    alert('Por favor selecciona ambas fechas');
    return;
  }

  if (new Date(fechaDesde) > new Date(fechaHasta)) {
    alert('La fecha desde no puede ser mayor a la fecha hasta');
    return;
  }

  console.log('✅ Validaciones pasadas, función ejecutada correctamente');
  return true;
}

// Definir window.generarInforme como está en el código
window.generarInforme = async function() {
  console.log('🚀 window.generarInforme() llamada');
  try {
    await generarInforme();
    console.log('✅ window.generarInforme ejecutada exitosamente');
  } catch (error) {
    console.error('❌ Error ejecutando generarInforme:', error);
    alert('Error generando informe: ' + error.message);
  }
};

// Tests
async function runTests() {
  console.log('\n📋 EJECUTANDO TESTS...');
  console.log('========================');

  // Test 1: Verificar que la función existe
  if (typeof window.generarInforme === 'function') {
    console.log('✅ Test 1: window.generarInforme está definida');
  } else {
    console.log('❌ Test 1: window.generarInforme NO está definida');
    return;
  }

  // Test 2: Verificar que se puede ejecutar
  try {
    await window.generarInforme();
    console.log('✅ Test 2: window.generarInforme se ejecuta sin errores');
  } catch (error) {
    console.log('❌ Test 2: Error ejecutando window.generarInforme:', error.message);
  }

  // Test 3: Verificar la función interna
  if (typeof generarInforme === 'function') {
    console.log('✅ Test 3: generarInforme interna está definida');
  } else {
    console.log('❌ Test 3: generarInforme interna NO está definida');
  }

  console.log('\n🎉 TESTS COMPLETADOS');
  console.log('====================');
}

runTests();
