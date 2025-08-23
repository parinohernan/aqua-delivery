#!/bin/bash

# 🚀 Script de Deployment para Back4App - AquaDelivery
# Este script automatiza la preparación del proyecto para deployment

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando preparación para deployment en Back4App..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

print_status "Verificando estructura del proyecto..."

# Verificar archivos necesarios
required_files=(
    "backend/Dockerfile"
    "backend/package.json"
    "backend/server.js"
    "frontend/Dockerfile"
    "frontend/package.json"
    "docker-compose.yml"
    "back4app.yml"
    "back4app.json"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Faltan archivos necesarios:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

print_success "Todos los archivos necesarios están presentes"

# Verificar dependencias de Node.js
print_status "Verificando instalación de dependencias..."

if [ ! -d "backend/node_modules" ]; then
    print_warning "Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

print_success "Dependencias verificadas"

# Verificar archivo .env
if [ ! -f ".env" ]; then
    print_warning "No se encontró archivo .env, creando desde ejemplo..."
    if [ -f "env.example" ]; then
        cp env.example .env
        print_warning "Por favor, edita el archivo .env con tus valores reales antes del deployment"
    else
        print_error "No se encontró env.example. Crea manualmente el archivo .env"
        exit 1
    fi
fi

# Probar build local (opcional)
read -p "¿Quieres probar el build local con Docker? (y/N): " test_build
if [[ $test_build =~ ^[Yy]$ ]]; then
    print_status "Probando build del backend..."
    docker build -t aqua-delivery-backend ./backend
    
    print_status "Probando build del frontend..."
    docker build -t aqua-delivery-frontend ./frontend
    
    print_success "Builds locales exitosos"
fi

# Preparar commit
print_status "Preparando archivos para commit..."

# Verificar estado de git
if ! git diff --quiet; then
    print_warning "Hay cambios sin commitear. Agregando archivos..."
    git add .
    
    read -p "¿Quieres hacer commit de los cambios? (Y/n): " do_commit
    if [[ ! $do_commit =~ ^[Nn]$ ]]; then
        read -p "Mensaje del commit [Preparar para deployment en Back4App]: " commit_message
        commit_message=${commit_message:-"Preparar para deployment en Back4App"}
        git commit -m "$commit_message"
        print_success "Commit realizado: $commit_message"
    fi
fi

# Push a GitHub
read -p "¿Quieres hacer push a GitHub? (Y/n): " do_push
if [[ ! $do_push =~ ^[Nn]$ ]]; then
    git push origin main
    print_success "Push realizado a GitHub"
fi

# Mostrar resumen
echo ""
echo "=========================="
echo "🎉 PREPARACIÓN COMPLETADA"
echo "=========================="
echo ""
print_success "Tu proyecto está listo para deployment en Back4App!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a https://dashboard.back4app.com/"
echo "2. Crea una nueva Container App"
echo "3. Conecta tu repositorio de GitHub"
echo "4. Configura las variables de entorno"
echo "5. Deploya la aplicación"
echo ""
echo "📖 Para más detalles, consulta: DEPLOYMENT_BACK4APP.md"
echo ""

# Mostrar URLs importantes
if [ -f ".env" ]; then
    echo "🔧 Variables de entorno configuradas en .env"
else
    print_warning "Recuerda configurar las variables de entorno en Back4App"
fi

echo "🐳 Dockerfiles creados:"
echo "  - Backend: backend/Dockerfile"
echo "  - Frontend: frontend/Dockerfile"
echo ""

echo "📁 Archivos de configuración:"
echo "  - docker-compose.yml (para desarrollo local)"
echo "  - back4app.yml (configuración específica)"
echo "  - back4app.json (metadatos del proyecto)"
echo ""

print_success "¡Deployment preparado exitosamente! 🚀"
