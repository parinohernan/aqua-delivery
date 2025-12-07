# 🚀 Deploy Frontend en Netlify - Guía Completa

## ⚡ Pasos Rápidos (10 minutos)

### 1️⃣ Actualizar URL del Backend (IMPORTANTE)

**Archivo:** `src/config/api.js`

Busca esta línea:
```javascript
return 'https://YOUR_KOYEB_URL.koyeb.app'; // ⚠️ CAMBIAR POR TU URL DE KOYEB
```

Cámbiala por tu URL real de Koyeb:
```javascript
return 'https://tu-app-XXXXX.koyeb.app';
```

---

### 2️⃣ Verificar que el Build Funciona Localmente

```bash
cd /home/hernan/dev/delivery\ manager/frontend
npm run build
npm run preview
```

Si funciona correctamente, continúa al siguiente paso.

---

### 3️⃣ Subir Código a GitHub

```bash
cd /home/hernan/dev/delivery\ manager/frontend
git add .
git commit -m "Configurar frontend para deploy en Netlify"
git push origin main
```

---

### 4️⃣ Deployar en Netlify

#### Opción A: Desde la Web (Recomendado)

1. **Ir a Netlify:**
   - https://www.netlify.com
   - Click en **"Sign up"** o **"Log in"**
   - Usa tu cuenta de GitHub

2. **Crear Nuevo Site:**
   - Click en **"Add new site"** → **"Import an existing project"**
   - Selecciona **"Deploy with GitHub"**
   - Autoriza a Netlify para acceder a tus repositorios
   - Selecciona tu repositorio

3. **Configurar Build Settings:**

   **Site settings:**
   - Site name: `aqua-delivery-manager` (o el que prefieras)
   
   **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: (dejar vacío)

4. **Variables de Entorno (Opcional):**
   - Por ahora no necesitas ninguna, la URL del backend está hardcoded en el código

5. **Deploy:**
   - Click en **"Deploy site"**
   - Espera 2-3 minutos

6. **¡Listo!** Tu sitio estará en:
   ```
   https://aqua-delivery-manager.netlify.app
   ```
   (o el nombre que hayas elegido)

---

#### Opción B: Desde Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar
cd /home/hernan/dev/delivery\ manager/frontend
netlify init

# Configurar:
# - Create & configure a new site
# - Team: Tu equipo
# - Site name: aqua-delivery-manager
# - Build command: npm run build
# - Directory to deploy: dist

# Deploy
netlify deploy --prod
```

---

### 5️⃣ Actualizar CORS en el Backend

Una vez que tengas tu URL de Netlify, asegúrate de que el backend la permita.

**Tu backend ya está configurado** para permitir todos los dominios `.netlify.app`, así que no necesitas hacer nada más. ✅

---

### 6️⃣ Verificar el Deployment

1. **Abrir tu sitio:**
   ```
   https://tu-sitio.netlify.app
   ```

2. **Probar funcionalidades:**
   - ✅ Login funciona
   - ✅ Crear/editar clientes
   - ✅ Crear/editar productos
   - ✅ Crear/editar pedidos
   - ✅ PWA se puede instalar

3. **Verificar en DevTools:**
   - F12 → Console
   - No debería haber errores de CORS
   - Las peticiones deben ir a tu backend de Koyeb

---

## 🔄 Auto-Deploy desde GitHub

Netlify está configurado para auto-deployar cada vez que hagas push a `main`:

```bash
# Hacer cambios en el código
git add .
git commit -m "Actualizar frontend"
git push origin main

# Netlify detecta el cambio y re-deploya automáticamente (2-3 min)
```

---

## 🎨 Personalizar Dominio (Opcional)

### Usar Dominio Personalizado

1. **En Netlify Dashboard:**
   - Site settings → Domain management
   - Click en **"Add custom domain"**
   - Ingresa tu dominio (ej: `aquadelivery.com`)

2. **Configurar DNS:**
   - En tu proveedor de dominio, agrega un registro CNAME:
   ```
   CNAME www tu-sitio.netlify.app
   ```

3. **SSL Automático:**
   - Netlify configura SSL automáticamente (Let's Encrypt)

---

## 📊 Monitoreo y Analytics

### Ver Deploys
- Netlify Dashboard → Deploys
- Puedes ver logs de cada deploy
- Puedes hacer rollback a versiones anteriores

### Analytics (Opcional - Pago)
- Netlify Analytics: $9/mes
- O usar Google Analytics gratis

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Solución:**
```bash
# Verificar que el build funciona localmente
cd frontend
npm run build

# Si falla, revisar los errores
# Asegurarse de que todas las dependencias estén en package.json
```

### Error: "Page not found" en rutas

**Solución:**
El archivo `netlify.toml` ya tiene configurado el redirect:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Error: "Cannot connect to backend"

**Solución:**
1. Verificar que la URL de Koyeb esté correcta en `src/config/api.js`
2. Verificar en F12 → Network que las peticiones vayan a la URL correcta
3. Verificar que el backend de Koyeb esté funcionando: `curl https://tu-backend.koyeb.app/health`

### Error de CORS

**Solución:**
Tu backend ya permite `.netlify.app`, pero verifica:
1. Que el backend esté corriendo
2. Que la URL sea HTTPS (no HTTP)
3. Revisa los logs del backend en Koyeb

---

## 📱 PWA (Progressive Web App)

Tu frontend ya está configurado como PWA:

- ✅ `manifest.json` configurado
- ✅ Service Worker (`sw.js`)
- ✅ Iconos en múltiples tamaños
- ✅ Funciona offline (cache)

**Para instalar:**
1. Abre el sitio en Chrome/Edge
2. Click en el ícono de instalación en la barra de direcciones
3. O en el menú → "Instalar Aqua Delivery"

---

## 🌍 URLs Finales

Después del deployment:

- **Frontend:** `https://tu-sitio.netlify.app`
- **Backend:** `https://tu-backend.koyeb.app`
- **Base de Datos:** Google Cloud VM (MySQL)

---

## 📋 Checklist de Deploy

- [ ] URL de Koyeb actualizada en `src/config/api.js`
- [ ] Build funciona localmente (`npm run build`)
- [ ] Código subido a GitHub
- [ ] Sitio creado en Netlify
- [ ] Build settings configurados correctamente
- [ ] Deploy exitoso
- [ ] Login funciona desde el sitio deployado
- [ ] Todas las funcionalidades principales funcionan
- [ ] PWA se puede instalar

---

## 💡 Tips

### Preview Deploys
Netlify crea un preview deploy para cada Pull Request:
- Útil para probar cambios antes de mergear
- URL temporal: `https://deploy-preview-XX--tu-sitio.netlify.app`

### Branch Deploys
Puedes configurar deploys automáticos para otras ramas:
- Site settings → Build & deploy → Deploy contexts

### Environment Variables
Si necesitas variables de entorno:
- Site settings → Environment variables
- Agregar variables con prefijo `PUBLIC_` para Astro

---

## 🔐 Seguridad

El archivo `netlify.toml` ya incluye headers de seguridad:
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

---

## 📚 Recursos

- **Netlify Docs:** https://docs.netlify.com
- **Astro Docs:** https://docs.astro.build
- **Netlify Status:** https://www.netlifystatus.com

---

## 🎯 Próximos Pasos Opcionales

1. **Configurar dominio personalizado**
2. **Agregar Google Analytics**
3. **Configurar Sentry para error tracking**
4. **Agregar tests automatizados**
5. **Configurar Lighthouse CI**

---

**¡Tu aplicación está lista para producción!** 🎉

**Stack completo:**
- Frontend: Netlify (Astro)
- Backend: Koyeb (Node.js + Express)
- Database: Google Cloud VM (MySQL)
- Todo gratis y escalable ✅
