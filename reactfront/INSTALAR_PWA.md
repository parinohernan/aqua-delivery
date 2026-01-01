# 📱 Cómo Instalar la PWA en tu Móvil

La aplicación está configurada como Progressive Web App (PWA) y puede instalarse en tu dispositivo móvil.

## ✅ Requisitos

1. **Servidor en ejecución**: La aplicación debe estar corriendo (en desarrollo o producción)
2. **Acceso HTTPS o localhost**: 
   - En desarrollo local: funciona con `localhost` o `127.0.0.1`
   - En producción: requiere HTTPS
   - En red local: puede funcionar con HTTP si el navegador lo permite

## 📱 Instalación en Android (Chrome)

1. Abre Chrome en tu dispositivo Android
2. Navega a la URL de la aplicación (ej: `http://192.168.1.110:4321`)
3. Espera a que la página cargue completamente
4. Verás un banner en la parte inferior que dice **"Agregar a la pantalla de inicio"** o **"Instalar app"**
5. Toca el banner o el menú de Chrome (⋮) → **"Agregar a la pantalla de inicio"**
6. Confirma la instalación
7. La app aparecerá en tu pantalla de inicio con el icono de AquaDelivery

## 🍎 Instalación en iOS (Safari)

1. Abre Safari en tu iPhone/iPad
2. Navega a la URL de la aplicación
3. Toca el botón **Compartir** (cuadrado con flecha hacia arriba)
4. Desplázate hacia abajo y toca **"Agregar a pantalla de inicio"**
5. Personaliza el nombre si lo deseas (por defecto: "AquaDelivery")
6. Toca **"Agregar"**
7. La app aparecerá en tu pantalla de inicio

## 🔍 Verificar que la PWA está funcionando

### En desarrollo:
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
3. Verifica:
   - **Service Workers**: Debe mostrar un service worker registrado
   - **Manifest**: Debe mostrar el manifest.json con todos los datos
   - **Cache Storage**: Debe tener caches creados

### En el móvil:
- La app debe abrirse en modo standalone (sin barra de navegación del navegador)
- Debe tener un icono en la pantalla de inicio
- Debe funcionar offline (con datos en caché)

## 🛠️ Solución de Problemas

### No aparece el banner de instalación:
- Asegúrate de que la app esté completamente cargada
- Verifica que estés usando HTTPS o localhost
- En Android, el banner puede tardar unos segundos en aparecer
- Intenta usar el menú del navegador (⋮) → "Agregar a la pantalla de inicio"

### El service worker no se registra:
- Verifica que estés en modo producción (`npm run build`)
- En desarrollo, VitePWA puede no registrar el service worker automáticamente
- Verifica la consola del navegador para ver errores

### La app no funciona offline:
- Asegúrate de haber visitado la app al menos una vez con conexión
- Verifica que el service worker esté activo
- Los datos de la API se cachean por 5 minutos

## 📦 Build para Producción

Para generar la versión instalable:

```bash
cd reactfront
npm run build
```

Esto generará:
- Service Worker (`sw.js`)
- Manifest actualizado
- Assets optimizados
- Caché configurado

Luego sirve la carpeta `dist` con un servidor HTTP/HTTPS.

## 🎨 Características de la PWA

- ✅ Instalable en móviles
- ✅ Funciona offline (con datos en caché)
- ✅ Iconos personalizados
- ✅ Pantalla de inicio personalizada
- ✅ Actualización automática
- ✅ Caché de imágenes y assets
- ✅ Caché de API (5 minutos)

## 📝 Notas

- En desarrollo local, la PWA funciona mejor si accedes desde la misma red local
- Para producción, se requiere HTTPS para que funcione completamente
- Los datos se sincronizan automáticamente cuando hay conexión

