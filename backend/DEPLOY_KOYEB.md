# 🚀 Guía de Deployment en Koyeb

## Requisitos Previos
- ✅ Cuenta de GitHub (tu código debe estar en un repositorio)
- ✅ Base de datos MySQL en Google Cloud VM (ya la tienes)
- ✅ Cuenta en Koyeb (gratis)

---

## 📋 Paso 1: Preparar el Repositorio

### 1.1 Verificar que tienes un repositorio Git
```bash
cd /home/hernan/dev/delivery\ manager/backend
git status
```

Si no tienes Git inicializado:
```bash
git init
git add .
git commit -m "Initial commit for Koyeb deployment"
```

### 1.2 Subir a GitHub
Si aún no lo has hecho:
```bash
# Crear repositorio en GitHub primero, luego:
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Configurar Google Cloud MySQL

### 2.1 Permitir conexiones externas
En tu VM de Google Cloud, asegúrate de que MySQL permita conexiones desde fuera:

1. **Editar configuración de MySQL:**
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```
   
2. **Cambiar bind-address:**
   ```
   bind-address = 0.0.0.0
   ```

3. **Reiniciar MySQL:**
   ```bash
   sudo systemctl restart mysql
   ```

### 2.2 Crear usuario para acceso remoto
```sql
CREATE USER 'koyeb_user'@'%' IDENTIFIED BY 'TU_PASSWORD_SEGURO';
GRANT ALL PRIVILEGES ON deliverydeagua.* TO 'koyeb_user'@'%';
FLUSH PRIVILEGES;
```

### 2.3 Configurar Firewall de Google Cloud
1. Ve a **VPC Network > Firewall** en Google Cloud Console
2. Crea una regla de firewall:
   - **Nombre:** allow-mysql-koyeb
   - **Targets:** All instances (o específico a tu VM)
   - **Source IP ranges:** `0.0.0.0/0` (o las IPs de Koyeb si las conoces)
   - **Protocols and ports:** tcp:3306
   - **Action:** Allow

⚠️ **Importante:** Para mayor seguridad, considera usar Cloud SQL Proxy o restringir IPs específicas.

---

## 🔧 Paso 3: Crear Cuenta en Koyeb

1. Ve a [https://www.koyeb.com/](https://www.koyeb.com/)
2. Regístrate con GitHub (recomendado) o email
3. Verifica tu cuenta

---

## 🚀 Paso 4: Deployar en Koyeb

### 4.1 Crear Nueva App
1. En el dashboard de Koyeb, click en **"Create App"**
2. Selecciona **"Deploy from GitHub"**
3. Autoriza a Koyeb para acceder a tu repositorio
4. Selecciona tu repositorio del backend

### 4.2 Configurar el Deployment

**Builder:**
- Builder: `Buildpack`
- Build command: (dejar vacío, usa package.json)
- Run command: `npm start`

**Instance:**
- Type: `Nano` (gratis)
- Regions: Selecciona la más cercana a tu VM de Google Cloud
  - Si tu VM está en `us-central1` → selecciona `Washington (was)`
  - Si está en `southamerica-east1` → selecciona `Washington (was)` (más cercano)
  - Si está en Europa → selecciona `Frankfurt (fra)`

**Ports:**
- Port: `8001`
- Protocol: `HTTP`

**Health Check:**
- Path: `/health`
- Port: `8001`
- Grace period: `30` segundos

### 4.3 Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

| Variable | Valor | Tipo |
|----------|-------|------|
| `NODE_ENV` | `production` | Plain text |
| `PORT` | `8001` | Plain text |
| `DB_HOST` | `IP_EXTERNA_DE_TU_VM` | **Secret** |
| `DB_USER` | `koyeb_user` | **Secret** |
| `DB_PASSWORD` | `TU_PASSWORD_SEGURO` | **Secret** |
| `DB_NAME` | `deliverydeagua` | Plain text |
| `DB_PORT` | `3306` | Plain text |
| `JWT_SECRET` | `tu_jwt_secret_muy_seguro` | **Secret** |
| `FRONTEND_URL` | `https://aquadeliverymanager.netlify.app` | Plain text |

⚠️ **Importante:** Marca como **Secret** las variables sensibles (passwords, tokens, etc.)

### 4.4 Obtener IP Externa de tu VM de Google Cloud

```bash
# En tu VM de Google Cloud, ejecuta:
curl ifconfig.me
```

O desde Google Cloud Console:
1. Ve a **Compute Engine > VM instances**
2. Copia la **External IP** de tu VM

### 4.5 Deploy

1. Revisa toda la configuración
2. Click en **"Deploy"**
3. Espera 2-5 minutos mientras Koyeb construye y deploya tu app

---

## ✅ Paso 5: Verificar el Deployment

### 5.1 Obtener la URL de tu API
Koyeb te dará una URL como:
```
https://tu-app-nombre-usuario.koyeb.app
```

### 5.2 Probar el Health Check
```bash
curl https://tu-app-nombre-usuario.koyeb.app/health
```

Deberías recibir:
```json
{
  "status": "OK",
  "message": "API Backend funcionando correctamente"
}
```

### 5.3 Probar un Endpoint
```bash
# Ejemplo: obtener productos
curl https://tu-app-nombre-usuario.koyeb.app/api/productos
```

---

## 🔄 Paso 6: Actualizar Frontend

Actualiza la URL del backend en tu frontend:

**Archivo:** `/home/hernan/dev/delivery manager/frontend/.env`
```env
PUBLIC_API_URL=https://tu-app-nombre-usuario.koyeb.app
```

**Archivo:** `/home/hernan/dev/delivery manager/frontend/src/config/api.js`
```javascript
const API_URL = import.meta.env.PUBLIC_API_URL || 'https://tu-app-nombre-usuario.koyeb.app';
```

---

## 🔧 Troubleshooting

### Error: "Cannot connect to database"
- ✅ Verifica que la IP externa de tu VM sea correcta
- ✅ Verifica que el firewall de Google Cloud permita conexiones en puerto 3306
- ✅ Verifica que MySQL esté configurado para aceptar conexiones remotas
- ✅ Verifica las credenciales de la base de datos

### Error: "Health check failed"
- ✅ Verifica que el endpoint `/health` esté funcionando
- ✅ Aumenta el grace period a 60 segundos
- ✅ Revisa los logs en Koyeb dashboard

### Error: "Build failed"
- ✅ Verifica que `package.json` tenga el script `"start": "node server.js"`
- ✅ Verifica que todas las dependencias estén en `dependencies` (no en `devDependencies`)

### Ver Logs
En Koyeb dashboard:
1. Ve a tu app
2. Click en **"Logs"**
3. Revisa los logs en tiempo real

---

## 🔐 Seguridad Adicional (Recomendado)

### Opción 1: Usar Cloud SQL Proxy
En lugar de exponer MySQL directamente, usa Cloud SQL Proxy para conexiones más seguras.

### Opción 2: Restringir IPs
En lugar de permitir `0.0.0.0/0`, obtén las IPs de Koyeb y permite solo esas.

### Opción 3: VPN o VPC Peering
Para producción seria, considera configurar una VPN entre Koyeb y Google Cloud.

---

## 📊 Monitoreo

Koyeb ofrece:
- ✅ Logs en tiempo real
- ✅ Métricas de CPU y memoria
- ✅ Health check automático
- ✅ Auto-restart si la app falla

---

## 💰 Límites del Plan Gratuito

- ✅ 1 instancia Nano
- ✅ 512 MB RAM
- ✅ 0.1 vCPU
- ✅ Sin límite de tráfico
- ✅ **No se duerme** (ventaja sobre Render)

---

## 🔄 Auto-Deploy desde GitHub

Koyeb automáticamente re-deploya cuando haces push a tu rama principal:

```bash
git add .
git commit -m "Update backend"
git push origin main
# Koyeb detecta el cambio y re-deploya automáticamente
```

---

## 📞 Soporte

- Documentación: https://www.koyeb.com/docs
- Discord: https://www.koyeb.com/community
- Status: https://status.koyeb.com

---

## ✨ Próximos Pasos

1. ✅ Deploy exitoso en Koyeb
2. ✅ Actualizar frontend con nueva URL
3. ✅ Configurar dominio personalizado (opcional)
4. ✅ Configurar CI/CD más avanzado (opcional)
5. ✅ Implementar monitoreo con Sentry o similar (opcional)

---

**¡Listo!** Tu backend debería estar funcionando en Koyeb de forma gratuita y sin dormirse. 🎉
