# 🚀 Deployment en Back4App usando Cloud Code

Guía para deployar tu backend AquaDelivery usando Cloud Code en una Parse App de Back4App.

## 📋 ¿Qué es Cloud Code?

Cloud Code te permite ejecutar código JavaScript/Node.js personalizado en el servidor de Parse. Es perfecto para:
- Lógica de negocio personalizada
- APIs personalizadas
- Funciones que se ejecutan en el servidor

## 🏗️ Archivos Preparados

✅ **Nuevo archivo creado:**
- `backend/main.js` - Archivo principal para Cloud Code con Parse Functions

✅ **Archivos existentes que se reutilizan:**
- `backend/routes/*` - Todas tus rutas Express
- `backend/package.json` - Dependencias
- `backend/config/database.js` - Configuración de DB

## 🚀 Pasos para Deployment

### Paso 1: Configurar Cloud Code

1. **En tu Parse App Dashboard:**
   - Ve a **"Cloud Code"** en el menú lateral
   - Haz clic en **"Deploy"** o **"Configure"**

2. **Conectar GitHub:**
   - **Repository**: Selecciona tu repositorio
   - **Branch**: `main`
   - **Subdirectory**: `backend` ⚠️ (Muy importante)
   - **Main file**: `main.js` (el nuevo archivo que creamos)

### Paso 2: Configurar Variables de Entorno

En **"App Settings" > "Environment Variables"**:

```env
# Configuración de Parse (Back4App las maneja automáticamente)
PARSE_APPLICATION_ID=tu-app-id
PARSE_MASTER_KEY=tu-master-key
PARSE_SERVER_URL=https://parseapi.back4app.com/

# Base de datos (si usas externa)
DB_HOST=tu-host-mysql-externo
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=deliverydeagua
DB_PORT=3306

# JWT para autenticación personalizada
JWT_SECRET=tu-jwt-secret-seguro

# CORS - Frontend URL
FRONTEND_URL=https://tu-frontend.netlify.app

# Entorno
NODE_ENV=production
```

### Paso 3: Deploy

1. **Hacer Deploy:**
   - En Cloud Code, haz clic en **"Deploy"**
   - Espera a que termine el proceso
   - Revisa los logs para verificar que no hay errores

2. **URLs disponibles después del deploy:**
   - Parse Functions: `https://parseapi.back4app.com/functions/`
   - Tu app: `https://tu-app-id.back4app.io/`

## 🧪 Probar las Cloud Functions

### Función de Health Check
```bash
curl -X POST \
  -H "X-Parse-Application-Id: TU_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://parseapi.back4app.com/functions/health
```

### Función de Autenticación
```bash
curl -X POST \
  -H "X-Parse-Application-Id: TU_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{"telegramId":"freedom135","codigoEmpresa":"1"}' \
  https://parseapi.back4app.com/functions/authenticate
```

## 🔄 Alternativa: Mantener Express Server

Si prefieres mantener tu servidor Express original, puedes usar **"Web Deployment"**:

### Opción Web Deployment:

1. **Ve a "Web Deployment"** en el menú lateral
2. **Configuración:**
   - **Repository**: Tu repositorio
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `8001`

3. **Variables de Entorno:** Las mismas que arriba

## 🗄️ Base de Datos

### Opción A: Usar Parse Database (Recomendado para Parse Apps)
- Back4App proporciona una base de datos Parse automáticamente
- No necesitas configurar MySQL externo
- Usa Parse Queries en lugar de SQL

### Opción B: MySQL Externo
- Mantén tu configuración actual de MySQL
- Necesitarás un servicio como PlanetScale o Railway
- Configura las variables `DB_*` en Environment Variables

## 🔧 Migración de Datos

Si decides usar Parse Database:

### 1. Crear Parse Classes
```javascript
// En Cloud Code - main.js
Parse.Cloud.afterSave("Cliente", (request) => {
    console.log("Cliente guardado:", request.object);
});

// Crear objetos Parse
const Cliente = Parse.Object.extend("Cliente");
const cliente = new Cliente();
cliente.set("nombre", "Juan Pérez");
cliente.set("telefono", "123456789");
await cliente.save();
```

### 2. Migrar desde MySQL
```javascript
// Script de migración (ejecutar una vez)
Parse.Cloud.define("migrateFromMySQL", async (request) => {
    // Conectar a MySQL y migrar datos
    // Este sería un script personalizado
});
```

## 📱 Integración con Frontend

### Desde JavaScript (Frontend):
```javascript
// Inicializar Parse
Parse.initialize("TU_APP_ID");
Parse.serverURL = 'https://parseapi.back4app.com/';

// Llamar Cloud Functions
const result = await Parse.Cloud.run("health");
console.log(result);

// Autenticación
const authResult = await Parse.Cloud.run("authenticate", {
    telegramId: "freedom135",
    codigoEmpresa: "1"
});
```

## 🔍 Troubleshooting

### Error: "Cloud Code not deployed"
- Verifica que el archivo `main.js` esté en la raíz del subdirectorio `backend`
- Asegúrate de que el repositorio esté conectado correctamente

### Error: "Function not found"
- Revisa que las funciones estén definidas con `Parse.Cloud.define()`
- Verifica que el deploy haya sido exitoso

### Error de Base de Datos
- Si usas MySQL externo, verifica las variables de entorno
- Si usas Parse Database, asegúrate de usar Parse Queries

## 📚 Recursos

- [Documentación de Cloud Code](https://docs.parseplatform.org/cloudcode/guide/)
- [Parse JavaScript SDK](https://docs.parseplatform.org/js/guide/)
- [Back4App Cloud Code Guide](https://www.back4app.com/docs/platform/cloud-code-functions)

## 🎯 Siguiente Paso

Una vez deployado el backend:
1. ✅ Cloud Functions funcionando
2. ✅ Base de datos configurada  
3. ✅ Variables de entorno configuradas
4. 🔄 Adaptar frontend para usar Parse SDK o mantener REST API

¡Tu backend estará funcionando en Cloud Code! 🎉
