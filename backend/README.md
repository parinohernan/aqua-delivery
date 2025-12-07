# 🚀 Aqua Delivery - Backend API

Backend API para sistema de gestión de delivery de agua multiempresa.

## 📋 Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de Datos:** MySQL 8.0
- **Autenticación:** JWT (JSON Web Tokens)
- **CORS:** Configurado para Netlify y Koyeb

## 🌐 Deployment

### Producción (Koyeb)
El backend está deployado en **Koyeb** (plan gratuito).

**Documentación de Deploy:**
- 📖 **[QUICK_START_KOYEB.md](./QUICK_START_KOYEB.md)** - Guía rápida (15 min)
- 📚 **[DEPLOY_KOYEB.md](./DEPLOY_KOYEB.md)** - Guía completa y detallada
- ✅ **[CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md)** - Checklist de verificación

**Script de Deploy:**
```bash
./prepare-deploy.sh "Mensaje del commit"
git push origin main
# Koyeb auto-deploya automáticamente
```

### Base de Datos
La base de datos MySQL está alojada en **Google Cloud VM**.

## 🛠️ Desarrollo Local

### Requisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- MySQL 8.0

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:8001`

## 📁 Estructura del Proyecto

```
backend/
├── .koyeb/              # Configuración de Koyeb
├── config/              # Configuración de la aplicación
├── migrations/          # Migraciones de base de datos
├── routes/              # Rutas de la API
│   ├── auth.js         # Autenticación
│   ├── clientes.js     # Gestión de clientes
│   ├── productos.js    # Gestión de productos
│   ├── pedidos.js      # Gestión de pedidos
│   ├── pagos.js        # Gestión de pagos
│   ├── zonas.js        # Gestión de zonas
│   ├── tiposdepago.js  # Tipos de pago
│   └── informes.js     # Reportes e informes
├── server.js           # Servidor principal
├── package.json        # Dependencias
├── .env.example        # Ejemplo de variables de entorno
└── DEPLOY_KOYEB.md     # Guía de deployment
```

## 🔌 API Endpoints

### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Obtener cliente
- `POST /api/clientes` - Crear cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/:id` - Obtener pedido
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id` - Actualizar pedido
- `DELETE /api/pedidos/:id` - Eliminar pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado

### Pagos
- `GET /api/pagos` - Listar pagos
- `POST /api/pagos` - Registrar pago

### Zonas
- `GET /api/zonas` - Listar zonas
- `POST /api/zonas` - Crear zona

### Tipos de Pago
- `GET /api/tiposdepago` - Listar tipos de pago

### Informes
- `GET /api/informes/ventas` - Informe de ventas
- `GET /api/informes/clientes` - Informe de clientes

### Health Check
- `GET /health` - Verificar estado del servidor

## 🔐 Variables de Entorno

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=deliverydeagua
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Servidor
PORT=8001
NODE_ENV=development

# Frontend (para CORS)
FRONTEND_URL=http://localhost:4321
```

## 🧪 Testing

```bash
npm test
```

## 📦 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo (con nodemon)
- `npm run build` - No requiere build (Node.js)
- `npm test` - Ejecutar tests

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ CORS configurado
- ✅ Variables de entorno para credenciales
- ✅ Validación de datos
- ✅ Conexión segura a base de datos

## 🌍 CORS

El servidor acepta peticiones desde:
- `localhost:*` (desarrollo)
- `*.netlify.app` (frontend en Netlify)
- `*.koyeb.app` (backend en Koyeb)
- IPs locales (192.168.x.x, 10.x.x.x, 172.x.x.x)

## 📊 Monitoreo

- **Logs:** Disponibles en Koyeb Dashboard
- **Health Check:** `/health` endpoint
- **Métricas:** CPU, memoria, requests en Koyeb

## 🆘 Soporte

- **Issues:** GitHub Issues
- **Documentación:** Ver carpeta `/docs`
- **Deploy:** Ver `DEPLOY_KOYEB.md`

## 📝 Licencia

Privado - Todos los derechos reservados

---

**Desarrollado con ❤️ para Aqua Delivery**
