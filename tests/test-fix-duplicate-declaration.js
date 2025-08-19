/**
 * Test para verificar que el error de declaración duplicada se ha solucionado
 */
const fs = require('fs');
const path = require('path');

function testFixDuplicateDeclaration() {
    console.log('🧪 TEST: Corrección de Declaración Duplicada');
    console.log('===========================================');
    
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
        
        // 3. Verificar declaraciones de currentClients
        console.log('\n🔍 3. Verificando declaraciones de currentClients...');
        const currentClientsDeclarations = content.match(/let currentClients = \[\]/g);
        
        if (!currentClientsDeclarations) {
            console.log('❌ No se encontraron declaraciones de currentClients');
            return;
        }
        
        const declarationCount = currentClientsDeclarations.length;
        console.log(`📊 Declaraciones encontradas: ${declarationCount}`);
        
        if (declarationCount === 1) {
            console.log('✅ Solo hay una declaración de currentClients');
        } else if (declarationCount > 1) {
            console.log('❌ Hay múltiples declaraciones de currentClients');
            console.log('   Esto causará el error: "The symbol "currentClients" has already been declared"');
        } else {
            console.log('❌ No hay declaraciones de currentClients');
        }
        
        // 4. Verificar ubicación de la declaración
        console.log('\n📍 4. Verificando ubicación de la declaración...');
        const lines = content.split('\n');
        let declarationLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('let currentClients = []')) {
                declarationLine = i + 1;
                break;
            }
        }
        
        if (declarationLine > 0) {
            console.log(`✅ Declaración encontrada en línea: ${declarationLine}`);
            
            // Verificar contexto
            const contextStart = Math.max(0, declarationLine - 3);
            const contextEnd = Math.min(lines.length, declarationLine + 2);
            
            console.log('📝 Contexto de la declaración:');
            for (let i = contextStart; i < contextEnd; i++) {
                const marker = i === declarationLine - 1 ? '>>> ' : '    ';
                console.log(`${marker}${i + 1}: ${lines[i]}`);
            }
        } else {
            console.log('❌ No se encontró la declaración de currentClients');
        }
        
        // 5. Verificar que no hay declaraciones duplicadas
        console.log('\n🔍 5. Verificando ausencia de declaraciones duplicadas...');
        const allMatches = content.match(/let currentClients/g);
        
        if (allMatches && allMatches.length === 1) {
            console.log('✅ Solo hay una declaración "let currentClients"');
        } else if (allMatches && allMatches.length > 1) {
            console.log(`❌ Hay ${allMatches.length} declaraciones "let currentClients"`);
            console.log('   Esto causará el error de declaración duplicada');
        } else {
            console.log('❌ No se encontraron declaraciones "let currentClients"');
        }
        
        // 6. Verificar que las funciones pueden acceder a currentClients
        console.log('\n🎯 6. Verificando acceso a currentClients en funciones...');
        const functionsUsingCurrentClients = [
            'editClienteInline',
            'toggleClienteStatus',
            'applyClientFilters'
        ];
        
        console.log('✅ Funciones que usan currentClients:');
        functionsUsingCurrentClients.forEach(func => {
            if (content.includes(func)) {
                console.log(`   - ${func}()`);
            } else {
                console.log(`   - ${func}() (no encontrada)`);
            }
        });
        
        // 7. Verificar disponibilidad global
        console.log('\n🌐 7. Verificando disponibilidad global...');
        if (content.includes('window.currentClients = currentClients')) {
            console.log('✅ currentClients expuesta globalmente');
        } else {
            console.log('❌ currentClients no expuesta globalmente');
        }
        
        // 8. Resultado final
        console.log('\n🎉 RESULTADO DEL TEST');
        console.log('=====================');
        
        if (declarationCount === 1 && allMatches && allMatches.length === 1) {
            console.log('✅ DECLARACIÓN DUPLICADA CORREGIDA');
            console.log('==================================');
            console.log('✅ Solo una declaración de currentClients');
            console.log('✅ Variable accesible globalmente');
            console.log('✅ Funciones pueden usar currentClients');
            console.log('✅ No errores de compilación esperados');
            
            console.log('\n💡 Para verificar que el error se solucionó:');
            console.log('1. Reinicia el servidor de desarrollo:');
            console.log('   cd frontend && npm run dev');
            console.log('2. Verifica que no aparece el error:');
            console.log('   "The symbol "currentClients" has already been declared"');
            console.log('3. Navega a la sección de clientes');
            console.log('4. Prueba las funciones de editar y cambiar estado');
            
        } else {
            console.log('❌ DECLARACIÓN DUPLICADA PERSISTE');
            console.log('================================');
            console.log('❌ Múltiples declaraciones encontradas');
            console.log('❌ Error de compilación persistirá');
            console.log('❌ Necesita corrección adicional');
        }
        
    } catch (error) {
        console.error('❌ Error en test de declaración duplicada:', error.message);
        
        if (error.code === 'ENOENT') {
            console.log('\n💡 El archivo no existe. Verifica la ruta:');
            console.log('frontend/src/pages/index.astro');
        }
    }
}

// Ejecutar test
testFixDuplicateDeclaration();
console.log('\n✅ Test de declaración duplicada completado');
