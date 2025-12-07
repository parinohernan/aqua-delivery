# 🔧 Configurar Variable de Entorno en Netlify

## ⚠️ IMPORTANTE: Debes configurar esto en Netlify

Tu frontend ahora usa la variable de entorno `PUBLIC_API_URL` para conectarse al backend.

---

## 📋 Pasos para Configurar en Netlify

### 1️⃣ Ir a Site Settings

1. **Abrir tu sitio en Netlify Dashboard**
2. Click en **"Site settings"**
3. En el menú lateral, click en **"Environment variables"**

---

### 2️⃣ Agregar Variable de Entorno

1. Click en **"Add a variable"** o **"Add environment variable"**

2. **Configurar:**
   ```
   Key:   PUBLIC_API_URL
   Value: https://dull-benny-hernanpa-b7cac3cd.koyeb.app
   ```

3. **Scopes:** Seleccionar:
   - ✅ **Builds** (importante para que se use durante el build)
   - ✅ **Functions** (opcional, no lo usamos pero no hace daño)
   - ✅ **Post processing** (opcional)

4. Click en **"Create variable"** o **"Save"**

---

### 3️⃣ Re-deployar el Sitio

Después de agregar la variable, necesitas re-deployar:

**Opción A: Trigger deploy desde Netlify**
1. En Netlify Dashboard → **Deploys**
2. Click en **"Trigger deploy"** → **"Clear cache and deploy site"**

**Opción B: Push a GitHub**
```bash
cd /home/hernan/dev/delivery\ manager/frontend
git add .
git commit -m "Actualizar configuración de API"
git push origin main
```

---

## 🔍 Verificar que Funciona

Después del re-deploy:

1. **Abrir tu sitio** en Netlify
2. **Abrir DevTools** (F12)
3. **Ir a Console**
4. Deberías ver:
   ```
   ✅ Usando backend desde PUBLIC_API_URL: https://dull-benny-hernanpa-b7cac3cd.koyeb.app
   ```

5. **Probar login** y verificar que funcione

---

## 📸 Captura de Pantalla de la Configuración

En Netlify, debería verse así:

```
┌─────────────────────────────────────────────┐
│ Environment variables                        │
├─────────────────────────────────────────────┤
│                                             │
│ Key: PUBLIC_API_URL                         │
│ Value: https://dull-benny-hernanpa-...      │
│ Scopes: ☑ Builds                            │
│                                             │
│ [Create variable]                           │
└─────────────────────────────────────────────┘
```

---

## 🔄 Para Desarrollo Local

El archivo `.env` local ya está configurado:

```env
PUBLIC_API_URL=http://localhost:8001
```

Esto permite que en desarrollo uses tu backend local.

---

## 🆘 Troubleshooting

### ❌ Sigue usando localhost después de configurar

**Solución:**
1. Verifica que la variable se llame exactamente `PUBLIC_API_URL` (con el prefijo PUBLIC_)
2. Verifica que el scope "Builds" esté marcado
3. Haz un "Clear cache and deploy site"

---

### ❌ No aparece el log en la consola

**Solución:**
El log solo aparece durante el build. Para verlo:
1. Netlify Dashboard → Deploys → [último deploy]
2. Ver los logs del build
3. Buscar "Usando backend desde PUBLIC_API_URL"

---

### ❌ Error "PUBLIC_API_URL is not defined"

**Solución:**
Asegúrate de que la variable esté configurada en Netlify con el scope "Builds" marcado.

---

## ✅ Checklist

- [ ] Variable `PUBLIC_API_URL` agregada en Netlify
- [ ] Scope "Builds" marcado
- [ ] Valor: `https://dull-benny-hernanpa-b7cac3cd.koyeb.app`
- [ ] Re-deploy ejecutado
- [ ] Login funciona en el sitio deployado
- [ ] DevTools muestra el log correcto

---

## 🎯 Resumen

**Variable de entorno:**
```
PUBLIC_API_URL=https://dull-benny-hernanpa-b7cac3cd.koyeb.app
```

**Dónde configurarla:**
```
Netlify Dashboard → Site settings → Environment variables
```

**Después:**
```
Trigger deploy → Clear cache and deploy site
```

---

**Tiempo estimado:** 2 minutos

¡Después de esto tu frontend se conectará correctamente al backend! 🚀
