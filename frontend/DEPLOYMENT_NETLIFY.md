# 🚀 Deployment en Netlify - Frontend Astro

## 📋 **Configuración Correcta para Netlify**

### **1. Configuración del Build en Netlify:**

```
Base directory: (dejar vacío)
Build command: npm run build
Publish directory: dist
```

### **2. Variables de Entorno (Opcional):**

Si necesitas configurar variables de entorno en Netlify:

```
VITE_API_BASE_URL=https://back-adm.fly.dev
VITE_APP_NAME=AquaDelivery
VITE_DEBUG_MODE=false
VITE_LOG_API_CALLS=false
VITE_NODE_ENV=production
```

### **3. Pasos para el Deployment:**

1. **Conectar tu repositorio de GitHub a Netlify**
2. **Configurar el directorio raíz:** Dejar vacío (Netlify detectará automáticamente el `package.json`)
3. **Comando de build:** `npm run build`
4. **Directorio de publicación:** `dist`
5. **Deploy automático:** Cada push a `main` activará un nuevo deploy

### **4. Estructura del Proyecto:**

```
frontend/
├── src/                    ← Código fuente Astro
├── public/                 ← Archivos estáticos
│   ├── manifest.json      ← PWA Manifest
│   ├── sw.js             ← Service Worker
│   └── icon-*.png        ← Iconos PWA
├── dist/                  ← Build de producción (generado)
├── astro.config.mjs      ← Configuración Astro
├── netlify.toml          ← Configuración Netlify
└── package.json          ← Dependencias
```

### **5. Verificación Post-Deploy:**

- ✅ **PWA Installable:** La app se puede instalar en móviles/desktop
- ✅ **Backend Connection:** Conecta correctamente a `back-adm.fly.dev`
- ✅ **Offline Support:** Funciona sin conexión (cache)
- ✅ **Responsive Design:** Se adapta a todos los dispositivos

### **6. URLs Finales:**

- **Frontend:** `https://tu-sitio.netlify.app`
- **Backend:** `https://back-adm.fly.dev`
- **PWA:** Instalable desde cualquier dispositivo

### **7. Troubleshooting:**

**Problema:** Build falla
**Solución:** Verificar que `npm run build` funcione localmente

**Problema:** PWA no se instala
**Solución:** Verificar que `manifest.json` y `sw.js` estén en `/dist`

**Problema:** No conecta al backend
**Solución:** Verificar que la URL en `config.js` sea correcta

## 🎯 **Comando Local de Prueba:**

```bash
cd frontend
npm run build
npm run preview  # Para probar el build localmente
```

## 📱 **PWA Features:**

- ✅ **Manifest.json** configurado
- ✅ **Service Worker** para cache offline
- ✅ **Iconos** en múltiples tamaños
- ✅ **Meta tags** optimizados
- ✅ **Headers** de seguridad configurados
