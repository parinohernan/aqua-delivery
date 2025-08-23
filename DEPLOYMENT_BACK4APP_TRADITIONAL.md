# 🚀 Deployment en Back4App - Método Tradicional (Solo Backend)

Guía paso a paso para deployar únicamente el backend de AquaDelivery en Back4App usando el método tradicional de Node.js.

## 📋 Prerrequisitos

1. **Cuenta en Back4App**: [Registrarse en back4app.com](https://www.back4app.com/)
2. **Repositorio en GitHub**: Tu código debe estar en GitHub
3. **Base de datos externa**: MySQL (recomendado: PlanetScale, Railway, o AWS RDS)

## 🏗️ Archivos Preparados

✅ **Archivos creados para el deployment**:
- `backend/package.json` - Actualizado con engines y scripts
- `backend/Procfile` - Comando para iniciar la aplicación
- `backend/app.json` - Configuración de la aplicación

## 🚀 Pasos para el Deployment

### Paso 1: Preparar el Repositorio

1. **Asegurar que todos los cambios estén en GitHub**:
```bash
cd backend
git add .
git commit -m "Preparar backend para deployment tradicional en Back4App"
git push origin main
```

### Paso 2: Crear Aplicación en Back4App

1. **Acceder al Dashboard**:
   - Ve a [dashboard.back4app.com](https://dashboard.back4app.com/)
   - Inicia sesión en tu cuenta

2. **Crear Nueva Aplicación**:
   - Haz clic en **"NUEVA APLICACIÓN"** o **"CREATE NEW APP"**
   - Si ves opciones, selecciona **"Parse App"** o **"Node.js App"**
   - Si no hay opciones específicas, continúa con la creación normal

3. **Configurar la Aplicación**:
   - **Nombre**: `aqua-delivery-backend`
   - **Plan**: Selecciona el plan gratuito para empezar

### Paso 3: Conectar con GitHub

1. **En el Dashboard de tu app**:
   - Busca la sección **"Deploy"** o **"Deployment"**
   - Selecciona **"GitHub"** como fuente
   - Autoriza la conexión con tu cuenta de GitHub

2. **Configurar el Repositorio**:
   - **Repository**: Selecciona tu repositorio
   - **Branch**: `main`
   - **Root Directory**: `backend` (importante: especificar la carpeta backend)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Paso 4: Configurar Base de Datos Externa

#### Opción A: PlanetScale (Recomendado)
1. Crea una cuenta en [planetscale.com](https://planetscale.com/)
2. Crea una nueva base de datos MySQL
3. Obtén las credenciales de conexión

#### Opción B: Railway
1. Crea una cuenta en [railway.app](https://railway.app/)
2. Crea un servicio MySQL
3. Obtén las credenciales de conexión

#### Opción C: AWS RDS
1. Crea una instancia RDS MySQL en AWS
2. Configura las reglas de seguridad
3. Obtén las credenciales de conexión

### Paso 5: Configurar Variables de Entorno

En **Settings > Environment Variables** de tu app en Back4App, agrega:

```env
# Configuración del servidor
NODE_ENV=production
PORT=8001

# Base de datos externa
DB_HOST=tu-host-de-base-de-datos
DB_USER=tu-usuario-de-db
DB_PASSWORD=tu-password-de-db
DB_NAME=deliverydeagua
DB_PORT=3306

# JWT para autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_con_al_menos_32_caracteres

# CORS - URL del frontend (actualizar después)
FRONTEND_URL=https://tu-frontend-domain.netlify.app
```

### Paso 6: Importar Esquema de Base de Datos

1. **Conectar a tu base de datos externa**
2. **Importar el esquema**:
   - Si tienes `documentos/deliverydeagua.sql`, impórtalo
   - O ejecuta las migraciones manualmente

### Paso 7: Deployar

1. **En Back4App Dashboard**:
   - Ve a la sección **"Deploy"**
   - Haz clic en **"Deploy Now"** o **"Manual Deploy"**
   - Espera a que termine el build (puede tomar varios minutos)

2. **Verificar el Deployment**:
   - Una vez completado, obtendrás una URL como: `https://tu-app.back4app.io`
   - Prueba el endpoint de salud: `https://tu-app.back4app.io/health`

## 🧪 Probar Localmente Antes del Deployment

```bash
cd backend
npm install
npm start
```

Verifica que funcione en: `http://localhost:8001/health`

## 🔧 Troubleshooting

### Error: "Application Error"
- Revisa los logs en Back4App Dashboard
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que la base de datos esté accesible

### Error de Conexión a Base de Datos
- Verifica las credenciales de la base de datos
- Asegúrate de que la base de datos permita conexiones externas
- Revisa que el puerto esté correcto (generalmente 3306 para MySQL)

### Error de CORS
- Actualiza `FRONTEND_URL` con la URL correcta de tu frontend
- Verifica la configuración de CORS en `server.js`

### Error de Build
- Asegúrate de que `package.json` esté en la carpeta `backend`
- Verifica que todas las dependencias estén en `dependencies` (no en `devDependencies`)

## 📱 Siguiente Paso: Frontend

Una vez que el backend esté funcionando, puedes deployar el frontend en:
- **Netlify** (recomendado para Astro)
- **Vercel**
- **GitHub Pages**

## 🎯 URLs Importantes

Después del deployment tendrás:
- **Backend API**: `https://tu-app.back4app.io`
- **Health Check**: `https://tu-app.back4app.io/health`
- **Endpoints de API**: `https://tu-app.back4app.io/api/...`

## 📚 Recursos Adicionales

- [Documentación de Back4App](https://docs.back4app.com/)
- [Guía de Node.js en Back4App](https://blog.back4app.com/es/como-alojar-una-aplicacion-node-js/)
- [Troubleshooting Back4App](https://docs.back4app.com/docs/troubleshooting)

¡Tu backend estará listo para recibir requests de cualquier frontend! 🎉
