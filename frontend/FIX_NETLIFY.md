# 🔧 SOLUCIÓN: Configurar Variable de Entorno

## ✅ Cambios Realizados

He actualizado tu frontend para usar **variables de entorno** en lugar de URLs hardcodeadas.

### Archivos Modificados:
1. ✅ `src/config/api.js` - Ahora usa `PUBLIC_API_URL`
2. ✅ `.env` - Configurado para desarrollo local
3. ✅ `.env.example` - Ejemplo de configuración

---

## 🚀 Próximos Pasos para Arreglar Netlify

### 1️⃣ Configurar Variable en Netlify (IMPORTANTE)

1. **Ir a tu sitio en Netlify:**
   - https://app.netlify.com

2. **Site settings → Environment variables**

3. **Add a variable:**
   ```
   Key:   PUBLIC_API_URL
   Value: https://dull-benny-hernanpa-b7cac3cd.koyeb.app
   ```

4. **Scopes:** Marcar ✅ **Builds**

5. **Save**

---

### 2️⃣ Re-deployar

**Opción A: Trigger deploy en Netlify**
1. Deploys → Trigger deploy → Clear cache and deploy site

**Opción B: Push a GitHub**
```bash
cd /home/hernan/dev/delivery\ manager/frontend
git add .
git commit -m "Configurar API con variables de entorno"
git push origin main
```

---

## 🔍 Verificar que Funciona

Después del re-deploy:

1. **Abrir tu sitio** en Netlify
2. **F12 → Console**
3. Deberías ver:
   ```
   ✅ Usando backend desde PUBLIC_API_URL: https://dull-benny-hernanpa-b7cac3cd.koyeb.app
   ```
4. **Probar login** - Debería funcionar ✅

---

## 📋 Resumen de la Solución

### Problema:
- ❌ El sitio deployado usaba `localhost:8001`
- ❌ URL hardcodeada en el código

### Solución:
- ✅ Usar variable de entorno `PUBLIC_API_URL`
- ✅ Configurar en Netlify Dashboard
- ✅ Desarrollo usa `.env` local
- ✅ Producción usa variable de Netlify

---

## 🎯 Configuración por Entorno

### Desarrollo Local:
```env
# .env (ya configurado)
PUBLIC_API_URL=http://localhost:8001
```

### Producción (Netlify):
```
Netlify Dashboard → Environment variables
PUBLIC_API_URL=https://dull-benny-hernanpa-b7cac3cd.koyeb.app
```

---

## 📚 Documentación Completa

- **`NETLIFY_ENV_SETUP.md`** - Guía detallada paso a paso
- **`.env.example`** - Ejemplo de configuración

---

## ⚡ Comando Rápido

```bash
# Ver la guía completa
cat NETLIFY_ENV_SETUP.md
```

---

## ✅ Checklist

- [x] Código actualizado para usar `PUBLIC_API_URL`
- [x] `.env` local configurado
- [x] Build funciona localmente
- [ ] Variable configurada en Netlify
- [ ] Re-deploy ejecutado
- [ ] Login funciona en producción

---

**Tiempo estimado para arreglar:** 2 minutos

**Después de configurar la variable en Netlify, tu frontend se conectará correctamente al backend!** 🎉
