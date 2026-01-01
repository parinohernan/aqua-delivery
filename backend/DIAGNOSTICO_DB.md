# 🔍 Diagnóstico de Conexión a Base de Datos

## Error Actual

```
Error: connect ETIMEDOUT
Host: dbase01.duckdns.org
Port: 3306
Database: deliveryDeAgua
```

## Pasos de Diagnóstico

### 1️⃣ Ejecutar Script de Diagnóstico

```bash
cd backend
node test-db-connection.js
```

Este script verificará:
- ✅ Variables de entorno configuradas
- ✅ Resolución DNS del hostname
- ✅ Conectividad al puerto 3306
- ✅ Conexión MySQL
- ✅ Permisos de usuario

### 2️⃣ Verificar Variables de Entorno

Verifica que tu archivo `.env` tenga todas las variables:

```bash
cat .env
```

Debe contener:
```env
DB_HOST=dbase01.duckdns.org
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=deliveryDeAgua
DB_PORT=3306
```

### 3️⃣ Verificar Conectividad de Red

#### Test de DNS:
```bash
nslookup dbase01.duckdns.org
# o
ping dbase01.duckdns.org
```

#### Test de Puerto:
```bash
telnet dbase01.duckdns.org 3306
# o
nc -zv dbase01.duckdns.org 3306
```

Si el puerto no responde, el problema es de red/firewall.

### 4️⃣ Verificar desde el Servidor MySQL

Si tienes acceso al servidor donde está MySQL:

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar que escuche en todas las interfaces
sudo netstat -tlnp | grep 3306
# Debe mostrar: 0.0.0.0:3306 (no solo 127.0.0.1:3306)

# Verificar configuración
sudo cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep bind-address
# Debe ser: bind-address = 0.0.0.0
```

### 5️⃣ Verificar Firewall

Si el servidor MySQL está en Google Cloud, AWS, o similar:

1. **Google Cloud:**
   - VPC Network → Firewall Rules
   - Debe haber una regla permitiendo `tcp:3306` desde `0.0.0.0/0`

2. **AWS:**
   - Security Groups
   - Debe permitir inbound en puerto 3306

3. **Firewall local:**
   ```bash
   sudo ufw status
   sudo ufw allow 3306/tcp
   ```

### 6️⃣ Verificar Permisos de Usuario MySQL

Conectarse al servidor MySQL y verificar:

```sql
-- Ver usuarios y hosts permitidos
SELECT user, host FROM mysql.user WHERE user='tu_usuario';

-- Debe mostrar algo como:
-- tu_usuario | %    (permite desde cualquier IP)
-- o
-- tu_usuario | 192.168.%  (permite desde red local)

-- Si no existe o solo tiene 'localhost', crear/actualizar:
CREATE USER 'tu_usuario'@'%' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON deliveryDeAgua.* TO 'tu_usuario'@'%';
FLUSH PRIVILEGES;
```

## Soluciones Comunes

### Solución 1: Timeout muy corto
✅ **Ya aplicado**: Aumentado `connectTimeout` a 15 segundos

### Solución 2: MySQL no escucha remotamente
```bash
# En el servidor MySQL:
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Cambiar: bind-address = 0.0.0.0
sudo systemctl restart mysql
```

### Solución 3: Firewall bloqueando
- Verificar reglas de firewall
- Permitir puerto 3306 desde tu IP o desde todas (0.0.0.0/0)

### Solución 4: DuckDNS no resuelve correctamente
```bash
# Verificar IP actual de DuckDNS
nslookup dbase01.duckdns.org

# Si la IP cambió, actualizar en .env o usar IP directa
# DB_HOST=123.45.67.89  (IP actual)
```

### Solución 5: Usar IP directa en lugar de hostname
Si DuckDNS está causando problemas, usar la IP directamente:

```env
# En .env, cambiar:
DB_HOST=123.45.67.89  # IP actual del servidor
```

## Verificar que Funciona

Después de aplicar las soluciones:

```bash
# Ejecutar diagnóstico
node test-db-connection.js

# O probar manualmente
mysql -h dbase01.duckdns.org -u tu_usuario -p deliveryDeAgua
```

## Logs del Backend

Si el problema persiste, revisa los logs del backend para más detalles:

```bash
# Ver logs en tiempo real
npm start

# Buscar errores específicos:
# - ETIMEDOUT: Problema de red/conectividad
# - ECONNREFUSED: Puerto cerrado o firewall
# - ER_ACCESS_DENIED: Usuario/contraseña incorrectos
# - Unknown database: Base de datos no existe
```

