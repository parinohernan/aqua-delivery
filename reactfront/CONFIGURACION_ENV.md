# Configuración de Variables de Entorno

## ¿Cómo funciona la configuración del backend?

El frontend de React **SÍ puede usar archivos `.env`**, pero con Vite hay algunas particularidades:

### 1. Variables de Entorno en Vite

En Vite, las variables de entorno deben tener el prefijo `VITE_` para ser expuestas al código del frontend:

```env
VITE_API_BASE_URL=http://localhost:8001
VITE_BACKEND_PORT=8001
VITE_APP_NAME=AquaDelivery
VITE_DEBUG_MODE=false
```

### 2. Cómo se acceden en el código

Las variables se acceden mediante `import.meta.env.VITE_*`:

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### 3. Lógica de Detección Automática

El código actual tiene una lógica inteligente en `src/services/api/client.ts` que detecta automáticamente dónde está el backend:

#### **Opción 1: Variable de entorno configurada**
Si existe `VITE_API_BASE_URL` en el `.env`, la usa directamente.

#### **Opción 2: Localhost (desarrollo)**
Si estás en `localhost` o `127.0.0.1`:
- Usa el **proxy de Vite** configurado en `vite.config.ts`
- El proxy redirige `/api` y `/auth` a `http://localhost:8001`
- No necesitas especificar la URL completa

#### **Opción 3: Red local (acceso desde otros dispositivos)**
Si accedes desde otra IP (ej: `192.168.1.100:4321`):
- Detecta automáticamente la IP del servidor
- Construye la URL: `http://192.168.1.100:8001`
- Usa el puerto configurado en `VITE_BACKEND_PORT` (por defecto 8001)

### 4. Crear archivo `.env`

Crea un archivo `.env` en la raíz de `reactfront/`:

```env
# URL base del backend (opcional - se detecta automáticamente)
VITE_API_BASE_URL=http://localhost:8001

# Puerto del backend (solo si no usas VITE_API_BASE_URL)
VITE_BACKEND_PORT=8001

# Nombre de la aplicación
VITE_APP_NAME=AquaDelivery

# Modo debug
VITE_DEBUG_MODE=false
```

### 5. Ejemplos de configuración

#### Desarrollo local:
```env
VITE_API_BASE_URL=http://localhost:8001
```

#### Acceso desde red local:
```env
# Reemplaza con la IP de tu servidor
VITE_API_BASE_URL=http://192.168.1.100:8001
```

#### Producción:
```env
VITE_API_BASE_URL=https://api.tudominio.com
```

### 6. Archivos `.env` disponibles

- `.env` - Variables para todos los entornos
- `.env.local` - Variables locales (ignorado por git)
- `.env.development` - Solo en desarrollo
- `.env.production` - Solo en producción

### 7. Importante

⚠️ **El archivo `.env` está en `.gitignore`** - no se sube al repositorio por seguridad.

✅ **Crea un `.env.example`** con valores de ejemplo (sin datos sensibles) para que otros desarrolladores sepan qué variables necesitan.

### 8. Verificar configuración

Para ver qué URL está usando el frontend, abre la consola del navegador y ejecuta:

```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

O revisa la pestaña Network en las DevTools para ver a qué URL se están haciendo las peticiones.

### 9. Proxy de Vite (vite.config.ts)

El proxy está configurado para desarrollo local:

```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_BASE_URL || 'http://localhost:8001',
      changeOrigin: true,
    },
    '/auth': {
      target: process.env.VITE_API_BASE_URL || 'http://localhost:8001',
      changeOrigin: true,
    }
  }
}
```

Esto significa que en desarrollo, las peticiones a `/api/*` se redirigen automáticamente al backend.

### Resumen

- ✅ **Sí usa `.env`** - pero con prefijo `VITE_`
- ✅ **Detección automática** - funciona sin `.env` en la mayoría de casos
- ✅ **Proxy en desarrollo** - facilita el desarrollo local
- ✅ **Configuración flexible** - puedes sobrescribir con `.env`

