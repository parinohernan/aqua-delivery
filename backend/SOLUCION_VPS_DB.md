# 🔧 Solución: Problemas de Conexión a Base de Datos en VPS

## ❌ Problema

El backend en el VPS no logra conectar a la base de datos. Aparecen warnings sobre opciones inválidas de configuración.

## ✅ Solución Paso a Paso

### 1️⃣ Actualizar el Código en el VPS

Primero, asegúrate de tener la versión más reciente del código:

```bash
# En tu VPS
cd ~/astrial-project/backend  # o la ruta donde tengas el proyecto
git pull origin main
```

Si no usas git, copia manualmente el archivo `config/database.js` actualizado.

### 2️⃣ Verificar Variables de Entorno

Verifica que exista un archivo `.env` en el directorio `backend/`:

```bash
cd ~/astrial-project/backend
cat .env
```

Debe contener (ajusta los valores según tu configuración):

```env
DB_HOST=tu_host_mysql
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=deliverydeagua
DB_PORT=3306
```

**⚠️ IMPORTANTE:**
- Si MySQL está en el mismo VPS: `DB_HOST=localhost` o `DB_HOST=127.0.0.1`
- Si MySQL está en otro servidor: `DB_HOST=IP_DEL_SERVIDOR` o `DB_HOST=dominio.com`
- Si MySQL está en Docker: `DB_HOST=database` (nombre del servicio)

### 3️⃣ Ejecutar Diagnóstico

Ejecuta el script de diagnóstico para identificar el problema:

```bash
cd ~/astrial-project/backend
node diagnose-vps-db.js
```

Este script verificará:
- ✅ Variables de entorno configuradas
- ✅ Resolución DNS (si usas hostname)
- ✅ Conectividad al puerto 3306
- ✅ Conexión MySQL
- ✅ Permisos de usuario

### 4️⃣ Soluciones Comunes

#### Problema: `ECONNREFUSED` o Puerto no accesible

**Si MySQL está en el mismo VPS:**

1. Verificar que MySQL esté corriendo:
   ```bash
   sudo systemctl status mysql
   # o
   sudo systemctl status mysqld
   ```

2. Verificar que MySQL escuche en todas las interfaces:
   ```bash
   sudo netstat -tlnp | grep 3306
   # Debe mostrar: 0.0.0.0:3306 (no solo 127.0.0.1:3306)
   ```

3. Si solo muestra `127.0.0.1:3306`, editar configuración:
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   # Cambiar: bind-address = 127.0.0.1
   # Por: bind-address = 0.0.0.0
   # Luego reiniciar:
   sudo systemctl restart mysql
   ```

**Si MySQL está en otro servidor:**

1. Verificar firewall:
   ```bash
   # En el servidor MySQL
   sudo ufw status
   sudo ufw allow 3306/tcp
   ```

2. Verificar que el usuario tenga permisos remotos:
   ```sql
   -- Conectarse a MySQL
   mysql -u root -p
   
   -- Verificar usuarios
   SELECT user, host FROM mysql.user WHERE user='tu_usuario';
   
   -- Si el host es 'localhost', crear usuario para conexiones remotas
   CREATE USER 'tu_usuario'@'%' IDENTIFIED BY 'tu_password';
   GRANT ALL PRIVILEGES ON deliverydeagua.* TO 'tu_usuario'@'%';
   FLUSH PRIVILEGES;
   ```

#### Problema: `ER_ACCESS_DENIED_ERROR`

El usuario o password son incorrectos:

1. Verificar `.env`:
   ```bash
   cat .env | grep DB_
   ```

2. Probar conexión manual:
   ```bash
   mysql -h DB_HOST -u DB_USER -p DB_NAME
   ```

3. Si funciona manualmente pero no desde Node.js, verificar que `.env` esté siendo cargado correctamente.

#### Problema: `ER_BAD_DB_ERROR`

La base de datos no existe:

```sql
-- Conectarse a MySQL
mysql -u root -p

-- Crear base de datos
CREATE DATABASE deliverydeagua CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Importar datos si tienes un dump
mysql -u root -p deliverydeagua < dump.sql
```

### 5️⃣ Verificar que el Código Esté Actualizado

Después de actualizar el código, reinicia el backend:

```bash
# Si usas PM2
pm2 restart aqua-delivery

# Si usas systemd
sudo systemctl restart aqua-delivery

# Si ejecutas directamente
# Detener con Ctrl+C y volver a iniciar:
npm start
```

### 6️⃣ Verificar Logs

Revisa los logs para ver la configuración que está usando:

```bash
# Deberías ver algo como:
# 📊 Configuración de Base de Datos:
#    Host: tu_host
#    Port: 3306
#    Database: deliverydeagua
#    User: tu_usuario
#    Password: ***
```

Si ves `Host: localhost` o `Host: undefined`, las variables de entorno no están configuradas correctamente.

## 🔍 Checklist de Verificación

- [ ] Código actualizado (sin warnings de `acquireTimeout`, `timeout`, `reconnect`)
- [ ] Archivo `.env` existe en `backend/`
- [ ] Variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` configuradas
- [ ] MySQL está corriendo
- [ ] MySQL escucha en `0.0.0.0:3306` (no solo `127.0.0.1`)
- [ ] Firewall permite puerto 3306
- [ ] Usuario MySQL tiene permisos remotos (si aplica)
- [ ] Base de datos existe
- [ ] Script de diagnóstico pasa todos los checks

## 📞 Si el Problema Persiste

1. Ejecuta el diagnóstico y comparte la salida completa
2. Verifica los logs del backend
3. Verifica los logs de MySQL: `sudo tail -f /var/log/mysql/error.log`
4. Verifica la configuración de red y firewall

