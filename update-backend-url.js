#!/usr/bin/env node

// Script para actualizar la URL del backend en los archivos de configuración
// Uso: node update-backend-url.js https://nueva-url.fly.dev

const fs = require('fs');
const path = require('path');

function updateEnvFile(filePath, newUrl) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Reemplazar la URL del backend
        content = content.replace(
            /VITE_API_BASE_URL=.*/,
            `VITE_API_BASE_URL=${newUrl}`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
        return false;
    }
}

function updateNetlifyToml(filePath, newUrl) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Extraer dominio de la URL para CORS
        const urlObj = new URL(newUrl);
        const domain = urlObj.hostname;
        
        // Actualizar Content-Security-Policy para incluir el nuevo dominio
        content = content.replace(
            /connect-src 'self' https:\/\/\*\.fly\.dev/,
            `connect-src 'self' https://${domain}`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado CORS en: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    const newUrl = process.argv[2];
    
    if (!newUrl) {
        console.log('📋 Uso: node update-backend-url.js <nueva-url>');
        console.log('📋 Ejemplo: node update-backend-url.js https://mi-nueva-app.fly.dev');
        process.exit(1);
    }
    
    // Validar URL
    try {
        new URL(newUrl);
    } catch (error) {
        console.error('❌ URL inválida:', newUrl);
        process.exit(1);
    }
    
    console.log(`🔄 Actualizando URL del backend a: ${newUrl}`);
    console.log('');
    
    const files = [
        'env.production',
        'env.development'  // Solo para desarrollo si quieres usar una URL específica
    ];
    
    let successCount = 0;
    
    // Actualizar archivos de entorno
    files.forEach(file => {
        if (fs.existsSync(file)) {
            if (file === 'env.development') {
                // Para desarrollo, preguntar si realmente quiere cambiar
                console.log(`⚠️  Saltando ${file} (mantener localhost para desarrollo)`);
            } else {
                if (updateEnvFile(file, newUrl)) {
                    successCount++;
                }
            }
        } else {
            console.log(`⚠️  Archivo no encontrado: ${file}`);
        }
    });
    
    // Actualizar netlify.toml si existe
    if (fs.existsSync('netlify.toml')) {
        if (updateNetlifyToml('netlify.toml', newUrl)) {
            successCount++;
        }
    }
    
    console.log('');
    if (successCount > 0) {
        console.log(`✅ Actualización completada. ${successCount} archivo(s) modificado(s).`);
        console.log('');
        console.log('📋 Próximos pasos:');
        console.log('1. git add .');
        console.log('2. git commit -m "Actualizar URL del backend"');
        console.log('3. git push origin main');
        console.log('4. Netlify redesplegará automáticamente');
    } else {
        console.log('❌ No se pudo actualizar ningún archivo.');
        process.exit(1);
    }
}

main();
