# 🔧 Sistema de Variables de Entorno - AquaDelivery

Documentación completa del sistema de configuración con variables de entorno para el frontend.

## 📋 Archivos de Configuración

### ✅ **Archivos Creados:**
- `env.production` - Variables para producción (Netlify)
- `env.development` - Variables para desarrollo local
- `public/js/config.js` - Sistema de configuración dinámico
- `update-backend-url.js` - Script para actualizar URLs fácilmente

## 🌐 URL del Backend Configurada

**URL actual**: `https://back-adm.fly.dev`

Esta URL se usa automáticamente en producción y puedes cambiarla fácilmente.

## 🚀 Cómo Funciona

### 1. **Detección Automática de Entorno:**
```javascript
// El sistema detecta automáticamente si estás en:
// - Desarrollo: localhost → usa env.development
// - Producción: Netlify → usa env.production
```

### 2. **Variables Disponibles:**
```env
VITE_API_BASE_URL=https://back-adm.fly.dev  # URL del backend
VITE_APP_NAME=AquaDelivery                   # Nombre de la app
VITE_APP_VERSION=1.0.0                       # Versión
VITE_DEBUG_MODE=false                        # Modo debug
VITE_LOG_API_CALLS=false                     # Log de API calls
```

### 3. **Uso en el Código:**
```javascript
// Obtener URL del backend
const backendURL = CONFIG.API.BASE_URL;

// Hacer llamada API
const response = await api.request('/clientes');

// Verificar configuración
console.log(CONFIG.API.BASE_URL);  // https://back-adm.fly.dev
```

## 🔄 Cambiar URL del Backend

### **Método 1: Script Automático (Recomendado)**
```bash
# Cambiar a una nueva URL
node update-backend-url.js https://nueva-app.fly.dev

# El script actualiza automáticamente:
# - env.production
# - netlify.toml (CORS)
```

### **Método 2: Manual**
1. **Editar `env.production`:**
   ```env
   VITE_API_BASE_URL=https://nueva-app.fly.dev
   ```

2. **Actualizar `netlify.toml` (CORS):**
   ```toml
   Content-Security-Policy = "... connect-src 'self' https://nueva-app.fly.dev"
   ```

3. **Commitear y pushear:**
   ```bash
   git add .
   git commit -m "Actualizar URL del backend"
   git push origin main
   ```

## 🧪 Probar la Configuración

### **En Desarrollo:**
```bash
# Abrir http://localhost:8000 (o tu servidor local)
# En la consola del navegador:
console.log(CONFIG.API.BASE_URL);  // http://localhost:8001
```

### **En Producción (Netlify):**
```bash
# Abrir tu sitio de Netlify
# En la consola del navegador:
console.log(CONFIG.API.BASE_URL);  // https://back-adm.fly.dev
```

### **Probar Conexión:**
```javascript
// En la consola del navegador
fetch(CONFIG.API.ENDPOINTS.HEALTH)
  .then(r => r.json())
  .then(data => console.log('✅ Backend conectado:', data))
  .catch(err => console.error('❌ Error:', err));
```

## 🔧 Configuración Avanzada

### **Variables de Debug:**
```env
# En env.development
VITE_DEBUG_MODE=true          # Habilita logs detallados
VITE_LOG_API_CALLS=true       # Log de todas las llamadas API
```

### **Funciones Disponibles:**
```javascript
// Actualizar URL dinámicamente
updateBackendURL('https://nueva-url.fly.dev');

// Recargar variables de entorno
await reloadEnvVars();

// Obtener configuración actual
const config = getConfig();
```

## 📱 Deploy en Netlify

### **Variables de Entorno en Netlify (Opcional):**
Si quieres override desde Netlify Dashboard:

1. **Netlify Dashboard → Site Settings → Environment Variables**
2. **Agregar:**
   ```
   VITE_API_BASE_URL = https://back-adm.fly.dev
   ```

**Nota:** Las variables del archivo `env.production` tienen prioridad sobre las de Netlify.

## 🔍 Troubleshooting

### **Error: "Failed to fetch env file"**
**Causa:** Archivo de entorno no encontrado

**Solución:**
1. Verificar que `env.production` esté en la carpeta `public/`
2. O usar valores por defecto (ya configurados)

### **Error: "CORS blocked"**
**Causa:** Backend no permite requests desde Netlify

**Solución:**
1. **En tu backend (Fly.io), actualizar CORS:**
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:4321',
       'https://tu-sitio.netlify.app',  // ⚠️ Agregar tu URL de Netlify
     ],
     credentials: true
   }));
   ```

### **Error: "CONFIG is undefined"**
**Causa:** Configuración no inicializada

**Solución:**
1. Verificar que `config.js` se carga antes que otros scripts
2. Esperar a que `initConfig()` termine

## 📊 Logs y Debugging

### **En Desarrollo:**
```javascript
// Ver configuración completa
console.log('CONFIG:', CONFIG);

// Ver variables de entorno cargadas
console.log('ENV_VARS:', ENV_VARS);

// Ver todas las URLs de API
console.log('API ENDPOINTS:', CONFIG.API.ENDPOINTS);
```

### **En Producción:**
```javascript
// Habilitar debug temporalmente
updateBackendURL('https://back-adm.fly.dev');
ENV_VARS.VITE_DEBUG_MODE = 'true';
ENV_VARS.VITE_LOG_API_CALLS = 'true';
```

## 🎯 Beneficios del Sistema

### ✅ **Ventajas:**
- 🔄 **Cambio fácil** de URL sin tocar código
- 🌍 **Multi-entorno** (dev/prod automático)
- 📊 **Debug configurable** por entorno
- 🚀 **Deploy automático** con nuevas URLs
- 🔒 **CORS automático** configurado

### ✅ **Casos de Uso:**
- Cambiar de servidor de desarrollo a producción
- Migrar entre proveedores (Fly.io → Railway, etc.)
- Probar con diferentes backends
- A/B testing con múltiples APIs

## 📚 Archivos Importantes

```
proyecto/
├── env.production           # Variables de producción
├── env.development          # Variables de desarrollo
├── public/js/config.js      # Sistema de configuración
├── netlify.toml            # Configuración de Netlify (CORS)
├── update-backend-url.js   # Script de actualización
└── README_ENV_CONFIG.md    # Esta documentación
```

## 🎊 ¡Sistema Completamente Configurado!

Tu frontend ahora:
- ✅ **Lee la URL** desde `env.production`: `https://back-adm.fly.dev`
- ✅ **Detecta automáticamente** el entorno
- ✅ **Configura CORS** correctamente
- ✅ **Permite cambios fáciles** con el script
- ✅ **Funciona en desarrollo y producción**

¡Listo para deployar en Netlify! 🚀
