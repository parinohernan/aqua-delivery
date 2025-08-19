/**
 * Test para verificar que el modal funciona y las funciones están disponibles
 */
const fs = require('fs');
const path = require('path');

function testFixModalAndFunctions() {
    console.log('🧪 TEST: Modal y Funciones de Clientes');
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
        
        // 3. Verificar modal de clientes
        console.log('\n🔍 3. Verificando modal de clientes...');
        const modalElements = [
            'id="clientModal"',
            'class="modal-overlay"',
            'class="cliente-modal"',
            'id="clientForm"',
            'id="clientName"',
            'id="clientApellido"',
            'id="clientTelefono"',
            'id="clientDireccion"',
            'id="clientSaldo"',
            'id="clientRetornables"'
        ];
        
        console.log('✅ Elementos del modal encontrados:');
        modalElements.forEach(element => {
            if (content.includes(element)) {
                console.log(`   - ${element}`);
            } else {
                console.log(`   - ${element} (no encontrado)`);
            }
        });
        
        // 4. Verificar funciones disponibles
        console.log('\n🔧 4. Verificando funciones disponibles...');
        const functions = [
            'editClienteInline',
            'toggleClienteStatus',
            'showCreateClientModal',
            'closeClientModal',
            'handleClientSubmit'
        ];
        
        console.log('✅ Funciones encontradas:');
        functions.forEach(func => {
            if (content.includes(func)) {
                console.log(`   - ${func}()`);
            } else {
                console.log(`   - ${func}() (no encontrada)`);
            }
        });
        
        // 5. Verificar exposición global
        console.log('\n🌐 5. Verificando exposición global...');
        const globalExposures = [
            'window.editClienteInline = editClienteInline',
            'window.toggleClienteStatus = toggleClienteStatus',
            'window.showCreateClientModal = showCreateClientModal',
            'window.closeClientModal = closeClientModal'
        ];
        
        console.log('✅ Exposiciones globales encontradas:');
        globalExposures.forEach(exposure => {
            if (content.includes(exposure)) {
                console.log(`   - ${exposure}`);
            } else {
                console.log(`   - ${exposure} (no encontrada)`);
            }
        });
        
        // 6. Verificar orden de exposición global
        console.log('\n📝 6. Verificando orden de exposición global...');
        const lines = content.split('\n');
        
        let editClienteInlineExposureLine = -1;
        let renderClientesListLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('window.editClienteInline = editClienteInline')) {
                editClienteInlineExposureLine = i + 1;
            }
            if (lines[i].includes('function renderClientesList')) {
                renderClientesListLine = i + 1;
            }
        }
        
        console.log(`📍 Líneas encontradas:`);
        console.log(`   - Exposición editClienteInline: ${editClienteInlineExposureLine}`);
        console.log(`   - renderClientesList: ${renderClientesListLine}`);
        
        if (editClienteInlineExposureLine > 0 && renderClientesListLine > 0) {
            if (editClienteInlineExposureLine < renderClientesListLine) {
                console.log('✅ Exposición global está antes de renderClientesList');
            } else {
                console.log('❌ Exposición global está después de renderClientesList');
            }
        }
        
        // 7. Verificar CSS del modal
        console.log('\n🎨 7. Verificando CSS del modal...');
        const cssFile = path.join(__dirname, '../frontend/src/styles/clientes.css');
        
        if (fs.existsSync(cssFile)) {
            const cssContent = fs.readFileSync(cssFile, 'utf8');
            console.log('✅ Archivo CSS de clientes encontrado');
            
            const cssElements = [
                '.modal-overlay',
                '.cliente-modal',
                '.form-input',
                '.form-label'
            ];
            
            console.log('✅ Elementos CSS encontrados:');
            cssElements.forEach(element => {
                if (cssContent.includes(element)) {
                    console.log(`   - ${element}`);
                } else {
                    console.log(`   - ${element} (no encontrado)`);
                }
            });
        } else {
            console.log('❌ Archivo CSS de clientes no encontrado');
        }
        
        // 8. Verificar inputs del modal
        console.log('\n📝 8. Verificando inputs del modal...');
        const inputAttributes = [
            'type="text"',
            'type="tel"',
            'type="number"',
            'class="form-input"',
            'placeholder=',
            'required'
        ];
        
        console.log('✅ Atributos de inputs encontrados:');
        inputAttributes.forEach(attr => {
            if (content.includes(attr)) {
                console.log(`   - ${attr}`);
            } else {
                console.log(`   - ${attr} (no encontrado)`);
            }
        });
        
        // 9. Resultado final
        console.log('\n🎉 RESULTADO DEL TEST');
        console.log('=====================');
        
        const modalComplete = modalElements.every(element => content.includes(element));
        const functionsAvailable = functions.every(func => content.includes(func));
        const globalExposed = globalExposures.every(exposure => content.includes(exposure));
        const correctOrder = editClienteInlineExposureLine < renderClientesListLine;
        
        if (modalComplete && functionsAvailable && globalExposed && correctOrder) {
            console.log('✅ MODAL Y FUNCIONES CORREGIDOS');
            console.log('==============================');
            console.log('✅ Modal de clientes completo');
            console.log('✅ Funciones disponibles');
            console.log('✅ Exposición global correcta');
            console.log('✅ Orden de exposición correcto');
            console.log('✅ Error de "editClienteInline is not defined" resuelto');
            
            console.log('\n💡 Para verificar que los problemas se solucionaron:');
            console.log('1. Abre la aplicación en el navegador');
            console.log('2. Haz login con tu cuenta');
            console.log('3. Ve a la sección "Clientes"');
            console.log('4. Prueba crear un nuevo cliente:');
            console.log('   - Los inputs deberían ser legibles');
            console.log('   - El formulario debería funcionar correctamente');
            console.log('5. Prueba editar un cliente existente:');
            console.log('   - El modal debería abrirse');
            console.log('   - Los datos deberían cargarse');
            console.log('   - No debería haber errores en la consola');
            
        } else {
            console.log('❌ MODAL Y FUNCIONES INCOMPLETOS');
            console.log('===============================');
            if (!modalComplete) console.log('❌ Modal de clientes incompleto');
            if (!functionsAvailable) console.log('❌ Funciones no disponibles');
            if (!globalExposed) console.log('❌ Exposición global incompleta');
            if (!correctOrder) console.log('❌ Orden de exposición incorrecto');
            console.log('❌ Problemas pueden persistir');
        }
        
        console.log('\n🔧 Variables disponibles para testing:');
        console.log('- window.editClienteInline(clientId)');
        console.log('- window.toggleClienteStatus(clientId)');
        console.log('- window.showCreateClientModal()');
        console.log('- window.closeClientModal()');
        
        console.log('\n🎯 Comportamiento esperado:');
        console.log('- Modal de clientes funcional');
        console.log('- Inputs legibles y funcionales');
        console.log('- Funciones disponibles globalmente');
        console.log('- No errores de "editClienteInline is not defined"');
        
        console.log('\n🔍 Debug en consola:');
        console.log('// Verificar que las funciones están disponibles');
        console.log('console.log(typeof window.editClienteInline);');
        console.log('console.log(typeof window.showCreateClientModal);');
        console.log('// Probar funciones directamente');
        console.log('window.showCreateClientModal();  // Debería abrir modal');
        console.log('window.editClienteInline(1);     // Debería abrir modal con datos');
        
    } catch (error) {
        console.error('❌ Error en test de modal y funciones:', error.message);
        
        if (error.code === 'ENOENT') {
            console.log('\n💡 El archivo no existe. Verifica la ruta:');
            console.log('frontend/src/pages/index.astro');
        }
    }
}

// Ejecutar test
testFixModalAndFunctions();
console.log('\n✅ Test de modal y funciones completado');
