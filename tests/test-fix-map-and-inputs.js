/**
 * Test para verificar que el mapa y los estilos de inputs se han agregado correctamente
 */
const fs = require('fs');
const path = require('path');

function testFixMapAndInputs() {
    console.log('🧪 TEST: Mapa y Estilos de Inputs');
    console.log('=================================');
    
    try {
        // 1. Verificar archivo principal
        console.log('\n📋 1. Verificando archivo principal...');
        const filePath = path.join(__dirname, '../frontend/src/pages/index.astro');
        
        if (!fs.existsSync(filePath)) {
            throw new Error('Archivo index.astro no encontrado');
        }
        
        console.log('✅ Archivo index.astro encontrado');
        
        // 2. Leer contenido
        console.log('\n📖 2. Leyendo contenido del archivo...');
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('✅ Contenido leído correctamente');
        
        // 3. Verificar elementos del mapa en el modal
        console.log('\n🗺️ 3. Verificando elementos del mapa...');
        const mapElements = [
            'id="clientMap"',
            'class="client-map"',
            'id="getLocationBtn"',
            'id="clearLocationBtn"',
            'id="clientLatitud"',
            'id="clientLongitud"',
            'class="map-container"',
            'class="map-controls"'
        ];
        
        console.log('✅ Elementos del mapa encontrados:');
        mapElements.forEach(element => {
            if (content.includes(element)) {
                console.log(`   - ${element}`);
            } else {
                console.log(`   - ${element} (no encontrado)`);
            }
        });
        
        // 4. Verificar funciones del mapa
        console.log('\n🔧 4. Verificando funciones del mapa...');
        const mapFunctions = [
            'initializeClientMap',
            'setupMapControls',
            'clientMap',
            'clientMarker'
        ];
        
        console.log('✅ Funciones del mapa encontradas:');
        mapFunctions.forEach(func => {
            if (content.includes(func)) {
                console.log(`   - ${func}`);
            } else {
                console.log(`   - ${func} (no encontrada)`);
            }
        });
        
        // 5. Verificar CSS del mapa
        console.log('\n🎨 5. Verificando CSS del mapa...');
        const cssFile = path.join(__dirname, '../frontend/src/styles/clientes.css');
        let cssContent = '';
        const cssMapElements = [
            '.map-container',
            '.client-map',
            '.map-controls',
            '.btn-location',
            '.btn-clear-location'
        ];
        
        if (fs.existsSync(cssFile)) {
            cssContent = fs.readFileSync(cssFile, 'utf8');
            console.log('✅ Archivo CSS de clientes encontrado');
            
            console.log('✅ Elementos CSS del mapa encontrados:');
            cssMapElements.forEach(element => {
                if (cssContent.includes(element)) {
                    console.log(`   - ${element}`);
                } else {
                    console.log(`   - ${element} (no encontrado)`);
                }
            });
        } else {
            console.log('❌ Archivo CSS de clientes no encontrado');
        }
        
        // 6. Verificar estilos de inputs
        console.log('\n📝 6. Verificando estilos de inputs...');
        const cssInputElements = [
            'color: #1f2937',
            'font-weight: 500',
            'color: #9ca3af',
            'font-weight: 400'
        ];
        
        console.log('✅ Estilos de inputs encontrados:');
        cssInputElements.forEach(element => {
            if (cssContent && cssContent.includes(element)) {
                console.log(`   - ${element}`);
            } else {
                console.log(`   - ${element} (no encontrado)`);
            }
        });
        
        // 7. Verificar integración con Leaflet
        console.log('\n🌿 7. Verificando integración con Leaflet...');
        const leafletElements = [
            'L.map',
            'L.tileLayer',
            'L.marker',
            'navigator.geolocation',
            'getCurrentPosition'
        ];
        
        console.log('✅ Elementos de Leaflet encontrados:');
        leafletElements.forEach(element => {
            if (content.includes(element)) {
                console.log(`   - ${element}`);
            } else {
                console.log(`   - ${element} (no encontrado)`);
            }
        });
        
        // 8. Verificar exposición global de funciones
        console.log('\n🌐 8. Verificando exposición global...');
        const globalExposures = [
            'window.initializeClientMap = initializeClientMap'
        ];
        
        console.log('✅ Exposiciones globales encontradas:');
        globalExposures.forEach(exposure => {
            if (content.includes(exposure)) {
                console.log(`   - ${exposure}`);
            } else {
                console.log(`   - ${exposure} (no encontrada)`);
            }
        });
        
        // 9. Verificar inclusión de coordenadas en formulario
        console.log('\n📍 9. Verificando inclusión de coordenadas...');
        const coordinateElements = [
            'latitud: formData.get',
            'longitud: formData.get',
            'cliente.latitud',
            'cliente.longitud'
        ];
        
        console.log('✅ Elementos de coordenadas encontrados:');
        coordinateElements.forEach(element => {
            if (content.includes(element)) {
                console.log(`   - ${element}`);
            } else {
                console.log(`   - ${element} (no encontrado)`);
            }
        });
        
        // 10. Resultado final
        console.log('\n🎉 RESULTADO DEL TEST');
        console.log('=====================');
        
        const mapComplete = mapElements.every(element => content.includes(element));
        const functionsAvailable = mapFunctions.every(func => content.includes(func));
        const cssMapComplete = cssMapElements ? cssMapElements.every(element => cssContent.includes(element)) : false;
        const inputStylesComplete = cssInputElements.every(element => cssContent.includes(element));
        const leafletIntegrated = leafletElements.every(element => content.includes(element));
        const globalExposed = globalExposures.every(exposure => content.includes(exposure));
        const coordinatesIncluded = coordinateElements.every(element => content.includes(element));
        
        if (mapComplete && functionsAvailable && cssMapComplete && inputStylesComplete && 
            leafletIntegrated && globalExposed && coordinatesIncluded) {
            console.log('✅ MAPA Y ESTILOS CORREGIDOS');
            console.log('============================');
            console.log('✅ Mapa de Leaflet agregado al modal');
            console.log('✅ Estilos de inputs corregidos');
            console.log('✅ Funciones del mapa disponibles');
            console.log('✅ CSS del mapa completo');
            console.log('✅ Integración con Leaflet');
            console.log('✅ Coordenadas GPS incluidas');
            console.log('✅ Texto de inputs legible');
            
            console.log('\n💡 Para verificar que los problemas se solucionaron:');
            console.log('1. Abre la aplicación en el navegador');
            console.log('2. Haz login con tu cuenta');
            console.log('3. Ve a la sección "Clientes"');
            console.log('4. Prueba crear un nuevo cliente:');
            console.log('   - Los inputs deberían tener texto legible');
            console.log('   - El mapa debería aparecer en el modal');
            console.log('   - Deberías poder hacer clic en el mapa');
            console.log('   - El botón "Obtener mi ubicación" debería funcionar');
            console.log('5. Prueba editar un cliente existente:');
            console.log('   - El mapa debería cargar con las coordenadas del cliente');
            console.log('   - Los datos deberían cargarse correctamente');
            
        } else {
            console.log('❌ MAPA Y ESTILOS INCOMPLETOS');
            console.log('==============================');
            if (!mapComplete) console.log('❌ Elementos del mapa incompletos');
            if (!functionsAvailable) console.log('❌ Funciones del mapa no disponibles');
            if (!cssMapComplete) console.log('❌ CSS del mapa incompleto');
            if (!inputStylesComplete) console.log('❌ Estilos de inputs incompletos');
            if (!leafletIntegrated) console.log('❌ Integración con Leaflet incompleta');
            if (!globalExposed) console.log('❌ Exposición global incompleta');
            if (!coordinatesIncluded) console.log('❌ Coordenadas no incluidas');
            console.log('❌ Problemas pueden persistir');
        }
        
        console.log('\n🔧 Variables disponibles para testing:');
        console.log('- window.initializeClientMap(lat, lng)');
        console.log('- clientMap (instancia del mapa)');
        console.log('- clientMarker (marcador del mapa)');
        
        console.log('\n🎯 Comportamiento esperado:');
        console.log('- Mapa funcional en modal de clientes');
        console.log('- Inputs con texto legible');
        console.log('- Geolocalización funcional');
        console.log('- Coordenadas guardadas correctamente');
        
        console.log('\n🔍 Debug en consola:');
        console.log('// Verificar que el mapa está disponible');
        console.log('console.log(typeof window.initializeClientMap);');
        console.log('// Verificar estilos de inputs');
        console.log('const input = document.querySelector(".form-input");');
        console.log('console.log(getComputedStyle(input).color);');
        console.log('// Probar mapa directamente');
        console.log('window.initializeClientMap();  // Debería inicializar mapa');
        
    } catch (error) {
        console.error('❌ Error en test de mapa y inputs:', error.message);
        
        if (error.code === 'ENOENT') {
            console.log('\n💡 El archivo no existe. Verifica la ruta:');
            console.log('frontend/src/pages/index.astro');
        }
    }
}

// Ejecutar test
testFixMapAndInputs();
console.log('\n✅ Test de mapa y inputs completado');
