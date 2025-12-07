# 🔍 Diagnóstico: Error 500 en Login

## ✅ Progreso Actual

- ✅ Frontend deployado en Netlify: `https://aqua314.netlify.app`
- ✅ Backend deployado en Koyeb: `https://dull-benny-hernanpa-b7cac3cd.koyeb.app`
- ✅ Conexión frontend → backend funcionando (no hay error de CORS)
- ❌ Backend devuelve error 500 al intentar login

---

## 🔍 Análisis del Error

### Error Recibido:
```
POST /auth/login → 500 Internal Server Error
Response: {"error":""}
```

### Causa Probable:
El error 500 con mensaje vacío generalmente indica:
1. **Error de conexión a la base de datos**
2. **Variables de entorno no configuradas en Koyeb**
3. **Base de datos no accesible desde Koyeb**

---

## 🔧 Solución: Verificar Configuración en Koyeb

### 1️⃣ Verificar Variables de Entorno en Koyeb

Ve a tu app en Koyeb Dashboard y verifica que TODAS estas variables estén configuradas:

```
✅ NODE_ENV=production
✅ PORT=8001
✅ DB_HOST=[IP_DE_TU_VM_GOOGLE_CLOUD]
✅ DB_USER=[usuario_mysql]
✅ DB_PASSWORD=[password_mysql]
✅ DB_NAME=deliverydeagua
✅ DB_PORT=3306
✅ JWT_SECRET=[tu_jwt_secret]
```

**Cómo verificar:**
1. Ir a: https://app.koyeb.com
2. Seleccionar tu servicio
3. Settings → Environment variables
4. Verificar que TODAS las variables estén presentes

---

### 2️⃣ Verificar Conexión a Base de Datos

#### Opción A: Desde tu VM de Google Cloud

```bash
# Conectarte a tu VM
# Luego verificar que MySQL esté escuchando en todas las interfaces:
sudo netstat -tlnp | grep 3306

# Deberías ver:
# tcp  0  0.0.0.0:3306  0.0.0.0:*  LISTEN
```

#### Opción B: Verificar Firewall de Google Cloud

1. Ve a: https://console.cloud.google.com
2. VPC Network → Firewall
3. Busca la regla que permite puerto 3306
4. Verifica que:
   - Source IP ranges: `0.0.0.0/0` (o las IPs de Koyeb)
   - Protocols and ports: `tcp:3306`
   - Action: `Allow`

---

### 3️⃣ Ver Logs del Backend en Koyeb

Los logs te dirán exactamente qué está fallando:

1. **Ir a Koyeb Dashboard**
2. Seleccionar tu servicio
3. Click en **"Logs"**
4. Buscar errores relacionados con:
   - `Error en query`
   - `ECONNREFUSED`
   - `ER_ACCESS_DENIED_ERROR`
   - `ETIMEDOUT`

---

## 🆘 Errores Comunes y Soluciones

### Error: `ECONNREFUSED` o `ETIMEDOUT`
**Causa:** Koyeb no puede conectarse a tu base de datos

**Solución:**
1. Verificar que el firewall de Google Cloud permita conexiones en puerto 3306
2. Verificar que MySQL esté configurado para aceptar conexiones remotas:
   ```bash
   # En tu VM:
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   # Verificar: bind-address = 0.0.0.0
   sudo systemctl restart mysql
   ```

---

### Error: `ER_ACCESS_DENIED_ERROR`
**Causa:** Usuario o contraseña incorrectos

**Solución:**
1. Verificar las variables `DB_USER` y `DB_PASSWORD` en Koyeb
2. Verificar que el usuario tenga permisos remotos:
   ```sql
   -- En MySQL:
   SELECT user, host FROM mysql.user WHERE user='tu_usuario';
   -- Debería mostrar: tu_usuario | %
   ```

---

### Error: `Unknown database`
**Causa:** La base de datos no existe

**Solución:**
1. Verificar que `DB_NAME=deliverydeagua` esté correcto
2. Verificar que la base de datos exista:
   ```sql
   SHOW DATABASES;
   ```

---

## 📋 Checklist de Diagnóstico

### En Koyeb:
- [ ] Variable `DB_HOST` configurada con IP externa de VM
- [ ] Variable `DB_USER` configurada
- [ ] Variable `DB_PASSWORD` configurada (marcada como Secret)
- [ ] Variable `DB_NAME=deliverydeagua`
- [ ] Variable `DB_PORT=3306`
- [ ] Variable `JWT_SECRET` configurada
- [ ] Logs revisados para ver el error exacto

### En Google Cloud:
- [ ] MySQL acepta conexiones remotas (`bind-address = 0.0.0.0`)
- [ ] Usuario MySQL tiene permisos remotos (`user@'%'`)
- [ ] Firewall permite puerto 3306
- [ ] Base de datos `deliverydeagua` existe

---

## 🔍 Comandos de Diagnóstico

### Verificar IP Externa de tu VM:
```bash
# Desde tu VM de Google Cloud:
curl ifconfig.me
```

### Probar Conexión a MySQL desde Fuera:
```bash
# Desde tu computadora local:
mysql -h [IP_EXTERNA_VM] -u [DB_USER] -p deliverydeagua
```

Si esto falla, Koyeb tampoco podrá conectarse.

---

## 🎯 Próximos Pasos

1. **Ver logs en Koyeb** para identificar el error exacto
2. **Verificar variables de entorno** en Koyeb
3. **Probar conexión** a MySQL desde fuera de Google Cloud
4. **Ajustar configuración** según el error encontrado

---

## 📞 Información que Necesito

Para ayudarte mejor, necesito saber:

1. **¿Qué dice el log en Koyeb?**
   - Koyeb Dashboard → Logs → Buscar errores

2. **¿Las variables de entorno están configuradas?**
   - Koyeb Dashboard → Settings → Environment variables

3. **¿Puedes conectarte a MySQL desde fuera de Google Cloud?**
   ```bash
   mysql -h [IP_VM] -u [usuario] -p
   ```

---

## 💡 Solución Rápida Temporal

Mientras investigas, puedes probar el backend localmente:

```bash
cd /home/hernan/dev/delivery\ manager/backend
npm run dev
```

Y cambiar temporalmente el frontend para usar localhost:
```env
# frontend/.env
PUBLIC_API_URL=http://localhost:8001
```

---

**Siguiente paso:** Ver los logs en Koyeb para identificar el error exacto.
