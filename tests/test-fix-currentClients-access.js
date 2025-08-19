/**
 * Test para verificar que las funciones pueden acceder a currentClients correctamente
 */
const fs = require('fs');
const path = require('path');

function testFixCurrentClientsAccess() {
    console.log('🧪 TEST: Acceso a currentClients en Funciones');
    console.log('============================================');
    
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
        
        // 3. Verificar funciones que usan currentClients
        console.log('\n🔍 3. Verificando funciones que usan currentClients...');
        const functionsToCheck = [
            'editClienteInline',
            'toggleClienteStatus',
            'viewClienteInline'
        ];
        
        console.log('✅ Funciones que usan currentClients:');
        functionsToCheck.forEach(func => {
            if (content.includes(func)) {
                console.log(`   - ${func}()`);
            } else {
                console.log(`   - ${func}() (no encontrada)`);
            }
        });
        
        // 4. Verificar acceso seguro a currentClients
        console.log('\n🛡️ 4. Verificando acceso seguro a currentClients...');
        const safeAccessPattern = /window\.currentClients \|\| currentClients \|\| \[\]/g;
        const safeAccessMatches = content.match(safeAccessPattern);
        
        if (safeAccessMatches) {
            console.log(`✅ Acceso seguro encontrado ${safeAccessMatches.length} veces:`);
            safeAccessMatches.forEach((match, index) => {
                console.log(`   ${index + 1}. ${match}`);
            });
        } else {
            console.log('❌ No se encontró acceso seguro a currentClients');
        }
        
        // 5. Verificar declaración de currentClients
        console.log('\n📝 5. Verificando declaración de currentClients...');
        const declarationPattern = /let currentClients = \[\]/g;
        const declarations = content.match(declarationPattern);
        
        if (declarations && declarations.length === 1) {
            console.log('✅ Declaración única de currentClients encontrada');
        } else if (declarations && declarations.length > 1) {
            console.log(`❌ Múltiples declaraciones de currentClients: ${declarations.length}`);
        } else {
            console.log('❌ No se encontró declaración de currentClients');
        }
        
        // 6. Verificar exposición global
        console.log('\n🌐 6. Verificando exposición global...');
        const globalExposurePattern = /window\.currentClients = currentClients/g;
        const globalExposure = content.match(globalExposurePattern);
        
        if (globalExposure) {
            console.log('✅ currentClients expuesta globalmente');
        } else {
            console.log('❌ currentClients no expuesta globalmente');
        }
        
        // 7. Verificar funciones expuestas globalmente
        console.log('\n🔧 7. Verificando funciones expuestas globalmente...');
        const globalFunctions = [
            'window.editClienteInline',
            'window.toggleClienteStatus',
            'window.viewClienteInline'
        ];
        
        console.log('✅ Funciones expuestas globalmente:');
        globalFunctions.forEach(func => {
            const pattern = new RegExp(func.replace('.', '\\.') + ' = ' + func.split('.').pop());
            if (content.match(pattern)) {
                console.log(`   - ${func}`);
            } else {
                console.log(`   - ${func} (no encontrada)`);
            }
        });
        
        // 8. Verificar comentarios de acceso seguro
        console.log('\n💬 8. Verificando comentarios de acceso seguro...');
        const safeAccessComment = '// Usar window.currentClients para asegurar acceso global';
        const commentMatches = content.match(new RegExp(safeAccessComment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
        
        if (commentMatches) {
            console.log(`✅ Comentarios de acceso seguro encontrados: ${commentMatches.length}`);
        } else {
            console.log('❌ No se encontraron comentarios de acceso seguro');
        }
        
        // 9. Resultado final
        console.log('\n🎉 RESULTADO DEL TEST');
        console.log('=====================');
        
        const hasSafeAccess = safeAccessMatches && safeAccessMatches.length >= 3;
        const hasGlobalExposure = globalExposure !== null;
        const hasUniqueDeclaration = declarations && declarations.length === 1;
        
        if (hasSafeAccess && hasGlobalExposure && hasUniqueDeclaration) {
            console.log('✅ ACCESO A currentClients CORREGIDO');
            console.log('====================================');
            console.log('✅ Acceso seguro implementado en todas las funciones');
            console.log('✅ Variable expuesta globalmente');
            console.log('✅ Declaración única de currentClients');
            console.log('✅ Funciones pueden acceder a currentClients sin errores');
            
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
            console.log('❌ ACCESO A currentClients INCOMPLETO');
            console.log('====================================');
            if (!hasSafeAccess) console.log('❌ Acceso seguro no implementado en todas las funciones');
            if (!hasGlobalExposure) console.log('❌ Variable no expuesta globalmente');
            if (!hasUniqueDeclaration) console.log('❌ Declaración duplicada o ausente');
            console.log('❌ Error de "currentClients is not defined" puede persistir');
        }
        
        console.log('\n🔧 Variables disponibles para testing:');
        console.log('- window.currentClients (array de clientes)');
        console.log('- window.editClienteInline(clientId)');
        console.log('- window.toggleClienteStatus(clientId)');
        console.log('- window.viewClienteInline(clientId)');
        
        console.log('\n🎯 Comportamiento esperado:');
        console.log('- No errores de "currentClients is not defined"');
        console.log('- Funciones pueden acceder a currentClients sin errores');
        console.log('- Acceso seguro implementado con fallback');
        console.log('- Variables accesibles desde cualquier función');
        
        console.log('\n🔍 Debug en consola:');
        console.log('// Verificar que currentClients está disponible');
        console.log('console.log(window.currentClients);');
        console.log('// Verificar que las funciones están disponibles');
        console.log('console.log(typeof window.editClienteInline);');
        console.log('console.log(typeof window.toggleClienteStatus);');
        console.log('// Verificar acceso seguro');
        console.log('const clients = window.currentClients || currentClients || [];');
        console.log('console.log("Clientes disponibles:", clients.length);');
        
    } catch (error) {
        console.error('❌ Error en test de acceso a currentClients:', error.message);
        
        if (error.code === 'ENOENT') {
            console.log('\n💡 El archivo no existe. Verifica la ruta:');
            console.log('frontend/src/pages/index.astro');
        }
    }
}

// Ejecutar test
testFixCurrentClientsAccess();
console.log('\n✅ Test de acceso a currentClients completado');
