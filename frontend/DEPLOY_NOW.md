# 🚀 Deploy a Netlify - Configuración Lista

## ✅ Estado Actual

- ✅ Backend deployado en Koyeb: `https://dull-benny-hernanpa-b7cac3cd.koyeb.app`
- ✅ URL configurada en `src/config/api.js`
- ✅ Build funcionando correctamente
- ✅ `netlify.toml` configurado

---

## 📋 Pasos para Deployar (5 minutos)

### 1️⃣ Subir Código a GitHub

```bash
cd /home/hernan/dev/delivery\ manager/frontend

# Agregar cambios
git add .

# Commit
git commit -m "Configurar frontend para Netlify con backend de Koyeb"

# Push
git push origin main
```

---

### 2️⃣ Crear Cuenta en Netlify

1. **Ir a:** https://www.netlify.com
2. **Click en:** "Sign up"
3. **Seleccionar:** "Sign up with GitHub"
4. **Autorizar** a Netlify

---

### 3️⃣ Crear Nuevo Site

1. **En Netlify Dashboard:**
   - Click en **"Add new site"**
   - Selecciona **"Import an existing project"**

2. **Conectar GitHub:**
   - Click en **"Deploy with GitHub"**
   - Autoriza a Netlify si es necesario
   - Selecciona tu repositorio: `parinohernan/aqua-delivery` (o el nombre que tenga)

3. **Configurar Build Settings:**

   ```
   Site name: aqua-delivery-manager
   (o el nombre que prefieras)
   
   Branch to deploy: main
   
   Base directory: frontend
   
   Build command: npm run build
   
   Publish directory: frontend/dist
   
   Functions directory: (dejar vacío)
   ```

4. **Variables de Entorno:**
   - No necesitas agregar ninguna por ahora
   - La URL del backend ya está en el código

5. **Click en "Deploy site"**

---

### 4️⃣ Esperar el Deploy (2-3 minutos)

Netlify mostrará:
- ✅ Building...
- ✅ Deploying...
- ✅ Published!

Tu sitio estará disponible en:
```
https://[nombre-aleatorio].netlify.app
```

O si elegiste un nombre:
```
https://aqua-delivery-manager.netlify.app
```

---

### 5️⃣ Verificar que Funciona

1. **Abrir tu sitio** en el navegador

2. **Probar login:**
   - Ir a `/login`
   - Intentar iniciar sesión
   - Debería conectarse a tu backend de Koyeb

3. **Verificar en DevTools:**
   - F12 → Console
   - No debería haber errores de CORS
   - F12 → Network
   - Las peticiones deben ir a `https://dull-benny-hernanpa-b7cac3cd.koyeb.app`

---

## 🔧 Configuración Detallada de Netlify

### En la Interfaz de Netlify:

**Step 1: Pick a repository**
```
✓ parinohernan/aqua-delivery
```

**Step 2: Site settings, and deploy!**

**Owner:**
```
[Tu cuenta de Netlify]
```

**Branch to deploy:**
```
main
```

**Base directory:**
```
frontend
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
frontend/dist
```

**Advanced build settings:**
```
(No necesitas agregar nada aquí por ahora)
```

---

## 🎨 Personalizar Nombre del Sitio (Opcional)

Después del deploy, puedes cambiar el nombre:

1. **Site settings** → **General** → **Site details**
2. **Change site name**
3. Ingresa: `aqua-delivery-manager`
4. **Save**

Tu sitio ahora será:
```
https://aqua-delivery-manager.netlify.app
```

---

## 🔄 Auto-Deploy Configurado

Cada vez que hagas `git push origin main`:
- ✅ Netlify detecta el cambio automáticamente
- ✅ Ejecuta `npm run build`
- ✅ Deploya la nueva versión
- ✅ Todo en 2-3 minutos

---

## 📊 Monitoreo

### Ver Logs del Deploy:
1. Netlify Dashboard → **Deploys**
2. Click en el deploy más reciente
3. Ver logs en tiempo real

### Ver Errores:
1. Netlify Dashboard → **Deploys**
2. Si hay errores, aparecerán en rojo
3. Click para ver detalles

---

## 🆘 Troubleshooting

### ❌ Build falla en Netlify

**Posible causa:** Dependencias faltantes

**Solución:**
```bash
# Verificar que package.json tenga todas las dependencias
npm install
git add package-lock.json
git commit -m "Actualizar dependencias"
git push origin main
```

---

### ❌ "Page not found" en rutas

**Solución:**
Ya está configurado en `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Si aún falla, verifica que `netlify.toml` esté en la raíz de `frontend/`

---

### ❌ No conecta al backend

**Verificar:**
1. Backend funcionando: `curl https://dull-benny-hernanpa-b7cac3cd.koyeb.app/health`
2. URL correcta en `src/config/api.js`
3. F12 → Network → Ver a dónde van las peticiones

---

### ❌ Error de CORS

**Verificar:**
1. Backend permite `.netlify.app` (ya está configurado ✅)
2. Usar HTTPS (no HTTP)
3. Ver logs del backend en Koyeb

---

## 📱 PWA - Instalar en Móvil

Una vez deployado:

1. **Abrir el sitio** en Chrome/Edge móvil
2. **Menú** → "Agregar a pantalla de inicio"
3. **O** aparecerá un banner automático
4. La app se instalará como PWA

---

## 🌍 URLs Finales

Después del deployment:

```
Frontend:  https://aqua-delivery-manager.netlify.app
Backend:   https://dull-benny-hernanpa-b7cac3cd.koyeb.app
Database:  Google Cloud VM (MySQL)
```

---

## ✅ Checklist Final

- [x] Backend deployado en Koyeb
- [x] URL configurada en `src/config/api.js`
- [x] Build funciona localmente
- [x] `netlify.toml` configurado
- [ ] Código en GitHub
- [ ] Site creado en Netlify
- [ ] Deploy exitoso
- [ ] Login funciona
- [ ] Todas las funcionalidades OK

---

## 🎯 Próximo Paso

**Ahora mismo:**
```bash
cd /home/hernan/dev/delivery\ manager/frontend
git add .
git commit -m "Configurar frontend para Netlify"
git push origin main
```

**Luego:**
1. Ir a https://www.netlify.com
2. Sign up con GitHub
3. Import project
4. ¡Deploy!

---

**Tiempo total estimado:** 5-10 minutos

**¡Tu aplicación estará en producción!** 🎉
