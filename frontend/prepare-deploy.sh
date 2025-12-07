#!/bin/bash

# Script para preparar el frontend para deployment
# Uso: ./prepare-deploy.sh [URL_DE_KOYEB]

set -e

echo "🚀 Preparando frontend para deploy..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio frontend"
    exit 1
fi

# Verificar que se pasó la URL de Koyeb
if [ -z "$1" ]; then
    echo "⚠️  No se proporcionó URL de Koyeb"
    echo ""
    echo "Uso: ./prepare-deploy.sh https://tu-backend.koyeb.app"
    echo ""
    echo "Por favor, proporciona la URL de tu backend en Koyeb"
    exit 1
fi

KOYEB_URL=$1

echo "📝 Configurando URL del backend: $KOYEB_URL"
echo ""

# Actualizar api.js con la URL de Koyeb
sed -i "s|return 'https://YOUR_KOYEB_URL.koyeb.app';|return '$KOYEB_URL';|g" src/config/api.js

echo "✅ URL del backend actualizada en src/config/api.js"
echo ""

# Verificar que el build funciona
echo "🔨 Probando build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build exitoso!"
    echo ""
    echo "📦 Archivos listos para commit:"
    echo "   - src/config/api.js (URL actualizada)"
    echo "   - netlify.toml (configuración de Netlify)"
    echo "   - DEPLOYMENT_NETLIFY.md (guía de deploy)"
    echo ""
    echo "📤 Próximos pasos:"
    echo "   1. git add ."
    echo "   2. git commit -m 'Configurar frontend para Netlify'"
    echo "   3. git push origin main"
    echo "   4. Ir a netlify.com y conectar tu repositorio"
    echo ""
    echo "📖 Lee DEPLOYMENT_NETLIFY.md para instrucciones detalladas"
else
    echo ""
    echo "❌ Error en el build. Por favor revisa los errores arriba."
    exit 1
fi
