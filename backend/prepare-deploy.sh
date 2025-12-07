#!/bin/bash

# Script para preparar y commitear cambios para deploy en Koyeb
# Uso: ./prepare-deploy.sh "mensaje del commit"

set -e  # Salir si hay algún error

echo "🚀 Preparando backend para deploy en Koyeb..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio backend"
    exit 1
fi

# Verificar que Git esté inicializado
if [ ! -d ".git" ]; then
    echo "❌ Error: Git no está inicializado. Ejecuta 'git init' primero"
    exit 1
fi

# Agregar archivos importantes para el deploy
echo "📦 Agregando archivos de configuración..."
git add .gitignore
git add .koyeb/
git add DEPLOY_KOYEB.md
git add CHECKLIST_DEPLOY.md
git add server.js
git add package.json
git add package-lock.json
git add routes/
git add config/
git add migrations/

# Verificar que .env NO esté siendo agregado
if git diff --cached --name-only | grep -q "^\.env$"; then
    echo "⚠️  Advertencia: .env está siendo agregado. Removiendo..."
    git reset .env
fi

echo ""
echo "📝 Archivos preparados para commit:"
git diff --cached --name-only

echo ""
echo "💾 Creando commit..."

# Usar mensaje personalizado o uno por defecto
COMMIT_MSG="${1:-Preparar backend para deploy en Koyeb}"
git commit -m "$COMMIT_MSG"

echo ""
echo "✅ Commit creado exitosamente!"
echo ""
echo "📤 Para subir a GitHub, ejecuta:"
echo "   git push origin main"
echo ""
echo "🌐 Luego ve a Koyeb y deploya desde tu repositorio GitHub"
echo ""
echo "📖 Lee DEPLOY_KOYEB.md para instrucciones detalladas"
echo "✅ Usa CHECKLIST_DEPLOY.md para verificar todos los pasos"
