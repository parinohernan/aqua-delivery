# 🚀 Guía de Deployment en Back4App - AquaDelivery

Esta guía te ayudará a deployar tu aplicación completa de delivery de agua en Back4App usando containers.

## 📋 Prerrequisitos

1. **Cuenta en Back4App**: Regístrate en [back4app.com](https://www.back4app.com/)
2. **Código en GitHub**: Tu repositorio debe estar en GitHub
3. **Archivos de configuración**: Ya están incluidos en tu proyecto

## 🏗️ Archivos de Configuración Creados

### ✅ Backend
- `backend/Dockerfile` - Container del backend Node.js/Express
- `backend/.dockerignore` - Archivos a ignorar en el build

### ✅ Frontend  
- `frontend/Dockerfile` - Container del frontend Astro con Nginx
- `frontend/nginx.conf` - Configuración de Nginx para servir archivos estáticos
- `frontend/.dockerignore` - Archivos a ignorar en el build

### ✅ Orquestación
- `docker-compose.yml` - Para desarrollo local con base de datos
- `back4app.yml` - Configuración específica para Back4App
- `back4app.json` - Metadatos del proyecto para Back4App
- `env.example` - Variables de entorno de ejemplo

## 🚀 Pasos para el Deployment

### Paso 1: Preparar el Repositorio

1. **Commitear todos los cambios**:
```bash
git add .
git commit -m "Agregar configuración para deployment en Back4App"
git push origin main
```

### Paso 2: Crear la Aplicación en Back4App

1. **Iniciar sesión** en [Back4App Dashboard](https://dashboard.back4app.com/)
2. **Crear nueva aplicación**:
   - Click en "Create new app"
   - Selecciona "Container App"
   - Nombre: `aqua-delivery-manager`
   - Región: Elige la más cercana a tus usuarios

### Paso 3: Configurar el Deployment

#### 3.1 Conectar Repositorio
1. En el dashboard de tu app, ve a **"Deploy"**
2. Conecta tu repositorio de GitHub
3. Selecciona la rama `main`
4. Especifica el directorio raíz: `/` (raíz del proyecto)

#### 3.2 Configurar Container
1. **Dockerfile path**: `backend/Dockerfile`
2. **Port**: `8001`
3. **Health check endpoint**: `/health`

### Paso 4: Configurar Base de Datos

1. En el dashboard, ve a **"Database"**
2. Crea una nueva base de datos MySQL:
   - Tipo: MySQL 8.0
   - Nombre: `deliverydeagua`
   - Plan: Selecciona según tus necesidades

3. **Importar esquema** (si tienes el archivo SQL):
   - Sube el archivo `documentos/deliverydeagua.sql`
   - O ejecuta las migraciones manualmente

### Paso 5: Configurar Variables de Entorno

En **"Settings" > "Environment Variables"**, agrega:

```env
# Configuración del servidor
PORT=8001
NODE_ENV=production

# Base de datos (Back4App las proporcionará automáticamente)
DB_HOST=<host-de-tu-db-back4app>
DB_USER=<usuario-de-tu-db>
DB_PASSWORD=<password-de-tu-db>
DB_NAME=deliverydeagua
DB_PORT=3306

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_con_al_menos_32_caracteres

# URL del frontend (actualizar después del deployment)
FRONTEND_URL=https://tu-app-frontend.back4app.io
```

### Paso 6: Deployar el Backend

1. En **"Deploy"**, click en **"Deploy now"**
2. Espera a que termine el build (puede tomar varios minutos)
3. Verifica que el deployment sea exitoso
4. Prueba el endpoint de salud: `https://tu-app-backend.back4app.io/health`

### Paso 7: Deployar el Frontend (Opcional)

Si quieres deployar el frontend por separado:

1. Crea otra aplicación en Back4App para el frontend
2. Usa el mismo repositorio pero especifica:
   - **Dockerfile path**: `frontend/Dockerfile`
   - **Port**: `80`
3. Actualiza la variable `FRONTEND_URL` en el backend

## 🔧 Configuración Avanzada

### Variables de Entorno Automáticas

Back4App proporciona automáticamente:
- `DATABASE_URL` - URL completa de conexión a la base de datos
- `PORT` - Puerto asignado por Back4App

### Logs y Monitoreo

1. **Ver logs**: Dashboard > "Logs"
2. **Métricas**: Dashboard > "Analytics"
3. **Health checks**: Configurado en `/health`

### Escalabilidad

1. **Scaling horizontal**: Dashboard > "Settings" > "Scaling"
2. **Recursos**: Ajustar CPU/RAM según el plan

## 🧪 Prueba Local con Docker

Antes del deployment, puedes probar localmente:

```bash
# 1. Crear archivo .env desde el ejemplo
cp env.example .env
# Editar .env con tus valores locales

# 2. Ejecutar con Docker Compose
docker-compose up --build

# 3. Verificar servicios
# Backend: http://localhost:8001/health
# Frontend: http://localhost:80
# Base de datos: localhost:3306
```

## 🔍 Troubleshooting

### Error de Conexión a Base de Datos
- Verifica las variables de entorno `DB_*`
- Asegúrate de que la base de datos esté creada
- Revisa los logs para errores de conexión

### Error de Build
- Verifica que los Dockerfiles estén correctos
- Revisa que las dependencias estén en `package.json`
- Checa los logs de build en Back4App

### Error de CORS
- Actualiza `FRONTEND_URL` en las variables de entorno
- Verifica la configuración de CORS en `backend/server.js`

### Error 500 en la API
- Revisa los logs de la aplicación
- Verifica que todas las rutas estén funcionando
- Comprueba la conexión a la base de datos

## 📚 Recursos Adicionales

- [Documentación de Back4App](https://docs.back4app.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Deployment Guide](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🎉 ¡Deployment Completado!

Una vez completado el deployment:

1. ✅ Backend API funcionando en Back4App
2. ✅ Base de datos MySQL configurada
3. ✅ Variables de entorno configuradas
4. ✅ Health checks funcionando
5. ✅ Logs y monitoreo disponibles

Tu aplicación AquaDelivery estará disponible en:
- **Backend**: `https://tu-app-backend.back4app.io`
- **Frontend**: `https://tu-app-frontend.back4app.io` (si deployaste por separado)

¡Felicidades! 🎊 Tu aplicación de delivery de agua está ahora en producción.
