# 🔔 Sistema de Notificaciones Push

Este documento explica cómo configurar y usar el sistema de notificaciones push para AquaDelivery.

## 📋 Requisitos Previos

1. **Node.js** instalado (versión 18 o superior)
2. **Base de datos MySQL** configurada
3. **Variables de entorno** configuradas en `.env`

## 🚀 Configuración Inicial

### 1. Generar VAPID Keys

Las VAPID keys son necesarias para autenticar las notificaciones push. Ejecuta:

```bash
cd backend
node scripts/generate-vapid-keys.js
```

Este script generará las claves públicas y privadas necesarias. Puedes elegir agregarlas automáticamente al archivo `.env` o copiarlas manualmente.

Las claves se agregarán al `.env` como:
```
VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_SUBJECT=mailto:admin@aquadelivery.com
```

### 2. Crear Tabla en Base de Datos

Ejecuta la migración SQL para crear la tabla de suscripciones:

```bash
mysql -u tu_usuario -p tu_base_de_datos < backend/migrations/create_push_subscriptions_table.sql
```

O ejecuta el SQL manualmente en tu cliente MySQL.

### 3. Instalar Dependencias

Las dependencias ya deberían estar instaladas, pero si no:

```bash
cd backend
npm install
```

## 📱 Uso del Sistema

### Enviar Notificaciones desde la Terminal

El script CLI permite enviar notificaciones push desde tu PC:

#### Ejemplos Básicos

```bash
# Notificar a todos los usuarios sobre una nueva versión
cd backend
node scripts/send-push-notification.js \
  --title "Nueva versión disponible" \
  --body "Actualiza la aplicación para ver las nuevas funciones"

# Notificar a un grupo específico
node scripts/send-push-notification.js \
  --title "Mantenimiento programado" \
  --body "El sistema estará en mantenimiento mañana" \
  --grupo "admins"

# Notificar a un usuario específico
node scripts/send-push-notification.js \
  --title "Nuevo pedido" \
  --body "Tienes un nuevo pedido pendiente" \
  --user 123
```

#### Modo Interactivo

Para un modo más amigable que pregunta por cada valor:

```bash
node scripts/send-push-notification.js --interactive
```

#### Opciones Disponibles

- `--title, -t`: Título de la notificación (requerido)
- `--body, -b`: Cuerpo de la notificación (requerido)
- `--url, -u`: URL a abrir al hacer clic (default: `/`)
- `--icon, -i`: URL del icono (default: `/icon-192.png`)
- `--grupo, -g`: Grupo de usuarios (`all`, `admins`, `vendedores`, etc.)
- `--empresa, -e`: ID de empresa específica
- `--user, -U`: ID de usuario específico
- `--interactive, -I`: Modo interactivo
- `--help, -h`: Mostrar ayuda

### Grupos de Usuarios

Los grupos permiten segmentar las notificaciones:

- `all`: Todos los usuarios (por defecto)
- `admins`: Solo administradores
- `vendedores`: Solo vendedores
- `clientes`: Solo clientes
- Cualquier otro nombre personalizado

Los usuarios se asignan a grupos cuando se registran sus suscripciones. Por defecto, todos se registran en el grupo `all`.

## 🔧 API Endpoints

### Obtener Clave Pública VAPID

```
GET /api/push/vapid-public-key
```

Retorna la clave pública VAPID necesaria para suscribirse.

### Registrar Suscripción

```
POST /api/push/subscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "subscription": {
    "endpoint": "...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "grupo": "all"
}
```

### Eliminar Suscripción

```
POST /api/push/unsubscribe
Authorization: Bearer <token>
Content-Type: application/json

{
  "endpoint": "..."
}
```

### Enviar Notificación (desde API)

```
POST /api/push/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Título",
  "body": "Cuerpo",
  "url": "/",
  "icon": "/icon-192.png",
  "grupo": "all",
  "empresaId": 1,
  "userId": 123
}
```

### Estadísticas

```
GET /api/push/stats
Authorization: Bearer <token>
```

Retorna estadísticas de suscripciones por grupo.

## 📱 Frontend

El frontend se suscribe automáticamente a las notificaciones push cuando:

1. El usuario está autenticado
2. El navegador soporta notificaciones push
3. El usuario otorga permiso

La suscripción se maneja en `frontend/public/js/PushNotifications.js` y se inicializa automáticamente después del login.

## 🔍 Verificación

### Verificar Suscripciones en Base de Datos

```sql
SELECT * FROM push_subscriptions;
```

### Verificar Estadísticas

Usa el endpoint `/api/push/stats` o consulta directamente:

```sql
SELECT grupo, COUNT(*) as total, COUNT(DISTINCT user_id) as usuarios
FROM push_subscriptions
GROUP BY grupo;
```

## 🐛 Solución de Problemas

### Las notificaciones no se envían

1. Verifica que las VAPID keys estén configuradas en `.env`
2. Verifica que la tabla `push_subscriptions` exista
3. Verifica que haya suscripciones registradas
4. Revisa los logs del servidor para errores

### El usuario no recibe notificaciones

1. Verifica que el navegador soporte notificaciones push
2. Verifica que el usuario haya otorgado permiso
3. Verifica que el service worker esté registrado
4. Revisa la consola del navegador para errores

### Error "VAPID keys no configuradas"

Ejecuta `node scripts/generate-vapid-keys.js` y agrega las keys al `.env`.

## 📝 Notas Importantes

- Las notificaciones push solo funcionan en HTTPS (excepto localhost)
- El service worker debe estar registrado y activo
- Las suscripciones inválidas se eliminan automáticamente
- Los usuarios pueden desuscribirse desde la configuración del navegador

## 🎯 Casos de Uso

### Notificar Nueva Versión

```bash
node scripts/send-push-notification.js \
  -t "Nueva versión disponible" \
  -b "Actualiza la app para ver las mejoras" \
  -u "/" \
  -g "all"
```

### Notificar Mantenimiento

```bash
node scripts/send-push-notification.js \
  -t "Mantenimiento programado" \
  -b "El sistema estará en mantenimiento el 15/01 de 2:00 AM a 4:00 AM" \
  -g "admins"
```

### Notificar Pedido Nuevo

```bash
node scripts/send-push-notification.js \
  -t "Nuevo pedido" \
  -b "Tienes un nuevo pedido pendiente" \
  -U 123
```

## 📚 Recursos Adicionales

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

