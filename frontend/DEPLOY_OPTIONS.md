# 🚀 Opciones de Deploy para Frontend

## Comparativa de Plataformas Gratuitas

| Plataforma | Bandwidth | Builds/mes | Auto-deploy | SSL | CDN | Recomendado |
|------------|-----------|------------|-------------|-----|-----|-------------|
| **Netlify** | 100GB | 300 min | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| **Vercel** | 100GB | Ilimitado | ✅ | ✅ | ✅ | ⭐⭐⭐ |
| **Cloudflare Pages** | Ilimitado | 500/mes | ✅ | ✅ | ✅ | ⭐⭐ |
| **GitHub Pages** | 100GB | N/A | ✅ | ✅ | ❌ | ⭐ |

---

## 1. Netlify (Recomendado) ⭐⭐⭐

**Por qué elegirlo:**
- ✅ Más fácil de configurar
- ✅ Excelente para Astro
- ✅ PWA support nativo
- ✅ Headers personalizados
- ✅ Redirects y rewrites
- ✅ Preview deploys automáticos

**Guía:** Ver `DEPLOYMENT_NETLIFY.md`

**Configuración rápida:**
```bash
# Ya tienes netlify.toml configurado
# Solo necesitas:
1. Crear cuenta en netlify.com
2. Conectar GitHub
3. Deploy automático
```

---

## 2. Vercel ⭐⭐⭐

**Por qué elegirlo:**
- ✅ Muy rápido
- ✅ Edge functions gratis
- ✅ Analytics incluido
- ✅ Excelente DX

**Configuración:**

1. **Crear `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "astro"
}
```

2. **Deploy:**
```bash
npm i -g vercel
vercel login
vercel
```

---

## 3. Cloudflare Pages ⭐⭐

**Por qué elegirlo:**
- ✅ Bandwidth ilimitado
- ✅ CDN ultra-rápido
- ✅ Workers gratis

**Configuración:**

1. **Ir a:** https://pages.cloudflare.com
2. **Conectar GitHub**
3. **Build settings:**
   - Build command: `npm run build`
   - Build output: `dist`
   - Root directory: `frontend`

---

## 4. GitHub Pages ⭐

**Por qué elegirlo:**
- ✅ Gratis
- ✅ Simple

**Limitaciones:**
- ❌ Solo repos públicos
- ❌ Sin variables de entorno
- ❌ Sin headers personalizados

**Configuración:**

1. **Instalar gh-pages:**
```bash
npm install --save-dev gh-pages
```

2. **Agregar script a package.json:**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Deploy:**
```bash
npm run deploy
```

---

## 🎯 Recomendación Final

Para tu proyecto **Aqua Delivery**, recomiendo:

### **Netlify** (Primera opción)
- Ya tienes todo configurado
- Mejor soporte para PWA
- Más fácil de usar

### **Vercel** (Alternativa)
- Si necesitas edge functions
- Si quieres analytics gratis

---

## 📊 Arquitectura Final

```
┌─────────────────┐
│   Frontend      │
│   (Netlify)     │ ← https://tu-sitio.netlify.app
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Backend       │
│   (Koyeb)       │ ← https://tu-backend.koyeb.app
└────────┬────────┘
         │
         │ SQL Queries
         ▼
┌─────────────────┐
│   Database      │
│ (Google Cloud)  │ ← MySQL en VM
└─────────────────┘
```

---

## 🚀 Siguiente Paso

**Recomendado:** Sigue la guía `DEPLOYMENT_NETLIFY.md` para deployar en Netlify.

**Tiempo estimado:** 10 minutos

**Pasos:**
1. Actualizar URL de Koyeb en `src/config/api.js`
2. Subir a GitHub
3. Conectar Netlify
4. Deploy automático
5. ¡Listo!
