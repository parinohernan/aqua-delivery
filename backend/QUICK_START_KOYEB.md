# 🚀 Deploy Rápido en Koyeb - Resumen Ejecutivo

## ⚡ Pasos Rápidos (15 minutos)

### 1️⃣ Preparar Google Cloud MySQL (5 min)

```bash
# En tu VM de Google Cloud:
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Cambiar: bind-address = 0.0.0.0
sudo systemctl restart mysql

# Crear usuario remoto:
mysql -u root -p
```

```sql
CREATE USER 'koyeb_user'@'%' IDENTIFIED BY 'PASSWORD_SEGURO_AQUI';
GRANT ALL PRIVILEGES ON deliverydeagua.* TO 'koyeb_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

**Firewall Google Cloud:**
- Ve a VPC Network > Firewall
- Crea regla: allow-mysql-koyeb
- Source: 0.0.0.0/0
- Port: tcp:3306

**Obtener IP externa:**
```bash
curl ifconfig.me
# Anota esta IP: ___________________
```

---

### 2️⃣ Subir Código a GitHub (3 min)

```bash
cd /home/hernan/dev/delivery\ manager/backend

# Opción A: Usar el script automático
./prepare-deploy.sh "Deploy inicial a Koyeb"
git push origin main

# Opción B: Manual
git add .
git commit -m "Deploy inicial a Koyeb"
git push origin main
```

---

### 3️⃣ Deployar en Koyeb (5 min)

1. **Ir a:** https://www.koyeb.com
2. **Crear cuenta** (con GitHub)
3. **Create App** > Deploy from GitHub
4. **Seleccionar** tu repositorio

**Configuración:**
- Builder: `Buildpack`
- Run command: `npm start`
- Instance: `Nano` (gratis)
- Port: `8001`
- Health check: `/health`

**Variables de Entorno:**
```
NODE_ENV=production
PORT=8001
DB_HOST=[IP_EXTERNA_DE_TU_VM]  ← Secret
DB_USER=koyeb_user              ← Secret
DB_PASSWORD=[TU_PASSWORD]       ← Secret
DB_NAME=deliverydeagua
DB_PORT=3306
JWT_SECRET=[TU_JWT_SECRET]      ← Secret
FRONTEND_URL=https://aquadeliverymanager.netlify.app
```

5. **Click Deploy** y espera 3-5 minutos

---

### 4️⃣ Verificar (2 min)

```bash
# Reemplaza con tu URL de Koyeb
curl https://tu-app-XXXXX.koyeb.app/health

# Deberías ver:
# {"status":"OK","message":"API Backend funcionando correctamente"}
```

---

### 5️⃣ Actualizar Frontend

**Archivo:** `/home/hernan/dev/delivery manager/frontend/.env`
```env
PUBLIC_API_URL=https://tu-app-XXXXX.koyeb.app
```

**Archivo:** `/home/hernan/dev/delivery manager/frontend/src/config/api.js`
```javascript
const API_URL = import.meta.env.PUBLIC_API_URL || 'https://tu-app-XXXXX.koyeb.app';
```

Luego re-deploya el frontend en Netlify.

---

## 🆘 Troubleshooting Rápido

### Error: "Cannot connect to database"
```bash
# Verificar que MySQL acepta conexiones remotas:
mysql -h [IP_EXTERNA_VM] -u koyeb_user -p deliverydeagua
```

Si no conecta:
- ✅ Verifica firewall de Google Cloud
- ✅ Verifica bind-address en MySQL
- ✅ Verifica que el usuario tenga permisos remotos

### Error: "Health check failed"
- ✅ Aumenta grace period a 60 segundos en Koyeb
- ✅ Verifica logs en Koyeb dashboard
- ✅ Verifica que el puerto sea 8001

### Error de CORS en el navegador
- ✅ Ya está configurado para `.koyeb.app`
- ✅ Verifica que FRONTEND_URL esté correcto
- ✅ Verifica en F12 > Console el error exacto

---

## 📋 Checklist Ultra-Rápido

- [ ] MySQL acepta conexiones remotas
- [ ] Firewall permite puerto 3306
- [ ] Usuario remoto creado
- [ ] IP externa anotada
- [ ] Código en GitHub
- [ ] App creada en Koyeb
- [ ] Variables de entorno configuradas
- [ ] Deploy exitoso
- [ ] Health check funciona
- [ ] Frontend actualizado

---

## 🎯 URLs Importantes

- **Koyeb Dashboard:** https://app.koyeb.com
- **Tu API (después del deploy):** https://tu-app-XXXXX.koyeb.app
- **Frontend:** https://aquadeliverymanager.netlify.app
- **Documentación completa:** Ver `DEPLOY_KOYEB.md`

---

## 💡 Ventajas de Koyeb

✅ **Gratis para siempre** (plan Nano)
✅ **No se duerme** (a diferencia de Render)
✅ **Auto-deploy** desde GitHub
✅ **SSL automático**
✅ **Sin límite de tráfico**

---

## 🔄 Próximos Deploys

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
# Koyeb auto-deploya automáticamente
```

---

**¿Necesitas ayuda?** Lee `DEPLOY_KOYEB.md` para instrucciones detalladas.
