# Guía de Deployment en Render - Backend

Esta guía te ayudará a deployar el backend de tu aplicación de delivery de agua en Render.

## 📋 Preparación

### 1. Variables de entorno requeridas

En Render, deberás configurar las siguientes variables de entorno:

```
# Puerto (Render lo asigna automáticamente)
PORT=8001

# Configuración de la base de datos
DB_HOST=tu-host-de-base-de-datos
DB_USER=tu-usuario-de-db  
DB_PASSWORD=tu-password-de-db
DB_NAME=nombre-de-tu-base-de-datos
DB_PORT=3306

# URL del frontend para CORS
FRONTEND_URL=https://tu-app-frontend.onrender.com

# JWT Secret para autenticación
JWT_SECRET=tu-jwt-secret-muy-seguro-aqui

# Entorno
NODE_ENV=production
```

### 2. Base de datos

**Opción 1: Base de datos externa (recomendada)**
- Usa un servicio como PlanetScale, Railway, o AWS RDS
- Más estable y con mejor rendimiento

**Opción 2: Base de datos en Render**
- Render ofrece PostgreSQL managed
- Para MySQL necesitarás usar un servicio externo

## 🚀 Pasos para el deployment

### Paso 1: Preparar el repositorio

1. Asegúrate de que todos los cambios estén commiteados:
```bash
git add .
git commit -m "Preparar backend para deployment en Render"
git push origin main
```

### Paso 2: Crear el servicio en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Conecta tu repositorio de GitHub
3. Crea un nuevo **Web Service**
4. Selecciona tu repositorio
5. Configura el servicio:

#### Configuración básica:
- **Name**: `delivery-manager-backend` (o el nombre que prefieras)
- **Region**: Elige la más cercana a tus usuarios
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Plan:
- **Free tier** para pruebas
- **Starter** ($7/mes) para producción

### Paso 3: Configurar variables de entorno

En la sección **Environment** del dashboard de Render, agrega:

```
DB_HOST=tu-host-de-base-de-datos
DB_USER=tu-usuario-de-db
DB_PASSWORD=tu-password-de-db
DB_NAME=delivery_manager
DB_PORT=3306
FRONTEND_URL=https://tu-frontend-url.onrender.com
JWT_SECRET=un-secret-muy-seguro-de-al-menos-32-caracteres
NODE_ENV=production
```

### Paso 4: Deploy

1. Haz clic en **Create Web Service**
2. Render automáticamente:
   - Clonará tu repositorio
   - Instalará las dependencias
   - Iniciará el servidor

## 🔍 Verificación del deployment

### Health Check
Tu API estará disponible en: `https://tu-servicio.onrender.com`

Prueba el endpoint de health check:
```
GET https://tu-servicio.onrender.com/health
```

Deberías recibir:
```json
{
  "status": "OK",
  "message": "API Backend funcionando correctamente"
}
```

### Endpoints disponibles:
- `POST /auth/login` - Autenticación
- `GET /api/clientes` - Gestión de clientes
- `GET /api/productos` - Gestión de productos  
- `GET /api/pedidos` - Gestión de pedidos
- `GET /api/pagos` - Gestión de pagos
- `GET /api/zonas` - Gestión de zonas
- `GET /api/tiposdepago` - Tipos de pago
- `GET /api/informes` - Informes y reportes

## 🛠️ Configuración de la base de datos

### Si usas una base de datos externa:

1. **PlanetScale (MySQL)**:
   ```
   DB_HOST=aws.connect.psdb.cloud
   DB_USER=tu-usuario
   DB_PASSWORD=tu-password
   DB_NAME=tu-database
   DB_PORT=3306
   ```

2. **Railway (MySQL)**:
   ```
   DB_HOST=containers-us-west-xxx.railway.app
   DB_USER=root
   DB_PASSWORD=tu-password
   DB_NAME=railway
   DB_PORT=xxxx
   ```

### Migrar la base de datos:

Si tienes migraciones en `/backend/migrations/`, ejecuta:

```sql
-- add_zona_to_clientes.sql
-- add_location_columns_to_clientes.sql
```

## 🔄 Actualizaciones

Para actualizar el deployment:

1. Haz push a tu rama main:
```bash
git add .
git commit -m "Actualización del backend"  
git push origin main
```

2. Render detectará automáticamente los cambios y redesplegará

## 🐛 Troubleshooting

### Error de conexión a la base de datos:
- Verifica las variables de entorno
- Asegúrate de que la base de datos esté accesible desde internet
- Revisa los logs en el dashboard de Render

### Error de CORS:
- Actualiza `FRONTEND_URL` con la URL correcta de tu frontend
- Verifica que el frontend esté desplegado

### Error 503 Service Unavailable:
- Revisa los logs de build
- Verifica que las dependencias se instalen correctamente
- Asegúrate de que el puerto sea el correcto

### Logs útiles:
```bash
# En el dashboard de Render, ve a la sección "Logs"
# También puedes ver logs en tiempo real
```

## 📊 Monitoreo

Render proporciona:
- Logs en tiempo real
- Métricas de CPU y memoria
- Alertas por email
- Health checks automáticos

## 💡 Recomendaciones

1. **Usa variables de entorno** para toda la configuración sensible
2. **Configura health checks** personalizados si es necesario
3. **Monitorea los logs** regularmente
4. **Usa SSL/TLS** (Render lo proporciona automáticamente)
5. **Configura un dominio personalizado** si lo necesitas

## 🔐 Seguridad

- Render proporciona HTTPS automáticamente
- Usa secretos fuertes para JWT
- No expongas información sensible en los logs
- Mantén las dependencias actualizadas

---

¡Tu backend estará listo para recibir requests de tu frontend! 🎉
