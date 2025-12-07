#!/bin/bash

# Script para actualizar .env con la variable correcta

echo "🔧 Actualizando .env para usar PUBLIC_API_URL..."
echo ""

# Crear nuevo .env
cat > .env << 'EOF'
# Variables de entorno para el frontend
# IMPORTANTE: En Astro, las variables que se usan en el cliente deben tener el prefijo PUBLIC_

# URL del backend API (desarrollo local)
PUBLIC_API_URL=http://localhost:8001

# Para producción, esta variable se configura en Netlify Dashboard
# No cambies este archivo para producción, usa Netlify Environment Variables
EOF

echo "✅ Archivo .env actualizado"
echo ""
echo "📝 Contenido:"
cat .env
echo ""
echo "🚀 Ahora puedes hacer:"
echo "   npm run build"
echo "   npm run preview"
