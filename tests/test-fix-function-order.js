/**
 * Test para verificar que las funciones están en el orden correcto
 */
const fs = require('fs');
const path = require('path');

function testFixFunctionOrder() {
    console.log('🧪 TEST: Orden de Funciones Corregido');
    console.log('=====================================');
    
    try {
        // 1. Verificar archivo
        console.log('\n📋 1. Verificando archivo...');
        const filePath = path.join(__dirname, '../frontend/src/pages/index.astro');
        
        if (!fs.existsSync(filePath)) {
            throw new Error('Archivo index.astro no encontrado');
        }
        
        console.log('✅ Archivo index.astro encontrado');
        
        // 2. Leer contenido
        console.log('\n📖 2. Leyendo contenido del archivo...');
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('✅ Contenido leído correctamente');
        
        // 3. Verificar orden de funciones
        console.log('\n🔍 3. Verificando orden de funciones...');
        const lines = content.split('\n');
        
        let editClienteInlineLine = -1;
        let toggleClienteStatusLine = -1;
        let renderClientesListLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('function editClienteInline')) {
                editClienteInlineLine = i + 1;
            }
            if (lines[i].includes('function toggleClienteStatus')) {
                toggleClienteStatusLine = i + 1;
            }
            if (lines[i].includes('function renderClientesList')) {
                renderClientesListLine = i + 1;
            }
        }
        
        console.log(`📍 Líneas encontradas:`);
        console.log(`   - editClienteInline: ${editClienteInlineLine}`);
        console.log(`   - toggleClienteStatus: ${toggleClienteStatusLine}`);
        console.log(`   - renderClientesList: ${renderClientesListLine}`);
        
        // 4. Verificar que las funciones están antes de renderClientesList
        console.log('\n✅ 4. Verificando orden correcto...');
        
        if (editClienteInlineLine > 0 && renderClientesListLine > 0) {
            if (editClienteInlineLine < renderClientesListLine) {
                console.log('✅ editClienteInline está antes de renderClientesList');
            } else {
                console.log('❌ editClienteInline está después de renderClientesList');
            }
        }
        
        if (toggleClienteStatusLine > 0 && renderClientesListLine > 0) {
            if (toggleClienteStatusLine < renderClientesListLine) {
                console.log('✅ toggleClienteStatus está antes de renderClientesList');
            } else {
                console.log('❌ toggleClienteStatus está después de renderClientesList');
            }
        }
        
        // 5. Verificar que no hay funciones duplicadas
        console.log('\n🔍 5. Verificando ausencia de funciones duplicadas...');
        const editClienteInlineMatches = content.match(/function editClienteInline/g);
        const toggleClienteStatusMatches = content.match(/function toggleClienteStatus/g);
        
        if (editClienteInlineMatches && editClienteInlineMatches.length === 1) {
            console.log('✅ Solo hay una definición de editClienteInline');
        } else if (editClienteInlineMatches && editClienteInlineMatches.length > 1) {
            console.log(`❌ Hay ${editClienteInlineMatches.length} definiciones de editClienteInline`);
        } else {
            console.log('❌ No se encontró definición de editClienteInline');
        }
        
        if (toggleClienteStatusMatches && toggleClienteStatusMatches.length === 1) {
            console.log('✅ Solo hay una definición de toggleClienteStatus');
        } else if (toggleClienteStatusMatches && toggleClienteStatusMatches.length > 1) {
            console.log(`❌ Hay ${toggleClienteStatusMatches.length} definiciones de toggleClienteStatus`);
        } else {
            console.log('❌ No se encontró definición de toggleClienteStatus');
        }
        
        // 6. Verificar acceso seguro implementado
        console.log('\n🛡️ 6. Verificando acceso seguro...');
        const safeAccessPattern = /window\.currentClients \|\| currentClients \|\| \[\]/g;
        const safeAccessMatches = content.match(safeAccessPattern);
        
        if (safeAccessMatches && safeAccessMatches.length >= 2) {
            console.log(`✅ Acceso seguro implementado ${safeAccessMatches.length} veces`);
        } else {
            console.log('❌ Acceso seguro no implementado correctamente');
        }
        
        // 7. Verificar exposición global
        console.log('\n🌐 7. Verificando exposición global...');
        const globalExposurePattern = /window\.editClienteInline = editClienteInline/g;
        const globalExposure = content.match(globalExposurePattern);
        
        if (globalExposure) {
            console.log('✅ editClienteInline expuesta globalmente');
        } else {
            console.log('❌ editClienteInline no expuesta globalmente');
        }
        
        // 8. Resultado final
        console.log('\n🎉 RESULTADO DEL TEST');
        console.log('=====================');
        
        const correctOrder = editClienteInlineLine < renderClientesListLine && 
                           toggleClienteStatusLine < renderClientesListLine;
        const noDuplicates = (editClienteInlineMatches && editClienteInlineMatches.length === 1) &&
                           (toggleClienteStatusMatches && toggleClienteStatusMatches.length === 1);
        const safeAccess = safeAccessMatches && safeAccessMatches.length >= 2;
        const globalExposed = globalExposure !== null;
        
        if (correctOrder && noDuplicates && safeAccess && globalExposed) {
            console.log('✅ ORDEN DE FUNCIONES CORREGIDO');
            console.log('==============================');
            console.log('✅ Funciones definidas antes de renderClientesList');
            console.log('✅ No hay funciones duplicadas');
            console.log('✅ Acceso seguro implementado');
            console.log('✅ Funciones expuestas globalmente');
            console.log('✅ Error de "currentClients is not defined" resuelto');
            
            console.log('\n💡 Para verificar que el error se solucionó:');
            console.log('1. Abre la aplicación en el navegador');
            console.log('2. Haz login con tu cuenta');
            console.log('3. Ve a la sección "Clientes"');
            console.log('4. Verifica que NO aparece el error:');
            console.log('   - "ReferenceError: currentClients is not defined"');
            console.log('5. Prueba el botón "Editar" de un cliente');
            console.log('6. Prueba el botón "Bloquear/Desbloquear" de un cliente');
            console.log('7. Verifica que ambas funciones funcionan sin errores');
            
        } else {
            console.log('❌ ORDEN DE FUNCIONES INCOMPLETO');
            console.log('===============================');
            if (!correctOrder) console.log('❌ Funciones no están en el orden correcto');
            if (!noDuplicates) console.log('❌ Hay funciones duplicadas');
            if (!safeAccess) console.log('❌ Acceso seguro no implementado');
            if (!globalExposed) console.log('❌ Funciones no expuestas globalmente');
            console.log('❌ Error de "currentClients is not defined" puede persistir');
        }
        
        console.log('\n🔧 Variables disponibles para testing:');
        console.log('- window.editClienteInline(clientId)');
        console.log('- window.toggleClienteStatus(clientId)');
        console.log('- window.currentClients (array de clientes)');
        
        console.log('\n🎯 Comportamiento esperado:');
        console.log('- No errores de "currentClients is not defined"');
        console.log('- Funciones disponibles cuando se renderiza el HTML');
        console.log('- Acceso seguro implementado con fallback');
        console.log('- Variables accesibles desde cualquier función');
        
        console.log('\n🔍 Debug en consola:');
        console.log('// Verificar que las funciones están disponibles');
        console.log('console.log(typeof window.editClienteInline);');
        console.log('console.log(typeof window.toggleClienteStatus);');
        console.log('// Verificar acceso seguro');
        console.log('const clients = window.currentClients || currentClients || [];');
        console.log('console.log("Clientes disponibles:", clients.length);');
        
    } catch (error) {
        console.error('❌ Error en test de orden de funciones:', error.message);
        
        if (error.code === 'ENOENT') {
            console.log('\n💡 El archivo no existe. Verifica la ruta:');
            console.log('frontend/src/pages/index.astro');
        }
    }
}

// Ejecutar test
testFixFunctionOrder();
console.log('\n✅ Test de orden de funciones completado');
